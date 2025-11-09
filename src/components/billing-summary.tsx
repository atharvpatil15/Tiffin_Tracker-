'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  isBefore,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { CalendarIcon, Edit, Sunrise, Sun, Moon, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import type { TiffinLog } from '@/lib/types';
import { MEAL_PRICES } from '@/lib/constants';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BillingSummaryProps {
  user: {
    id: string;
    displayName: string;
    billingStartDate: number;
    tiffins: TiffinLog;
  };
  onBillingDateChange: (newDate: number) => void;
}

const getBillingCycle = (
  billingStartDate: number
): { start: Date; end: Date } => {
  const today = new Date();
  const currentDay = getDate(today);

  let cycleStart: Date;
  let cycleEnd: Date;

  if (currentDay >= billingStartDate) {
    cycleStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      billingStartDate
    );
    const nextMonth = addMonths(cycleStart, 1);
    cycleEnd = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      billingStartDate - 1
    );
  } else {
    const prevMonth = subMonths(today, 1);
    cycleStart = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth(),
      billingStartDate
    );
    cycleEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      billingStartDate - 1
    );
  }

  // Ensure cycleEnd is not before cycleStart, which can happen for short months
  if (isBefore(cycleEnd, cycleStart)) {
      cycleEnd = endOfMonth(cycleStart);
  }

  return { start: cycleStart, end: cycleEnd };
};

const calculateBill = (
  tiffinLog: TiffinLog,
  billingCycle: { start: Date; end: Date }
) => {
  const daysInCycle = eachDayOfInterval(billingCycle);
  let totalBill = 0;
  const mealCounts = { breakfast: 0, lunch: 0, dinner: 0 };
  const dailyBreakdown: {date: string; breakfast: string; lunch: string; dinner: string; dayTotal: number}[] = [];


  daysInCycle.forEach((day) => {
    const dayFormatted = format(day, 'yyyy-MM-dd');
    const dayLog = tiffinLog[dayFormatted];
    let dayTotal = 0;
    
    const breakfastTaken = dayLog?.breakfast;
    const lunchTaken = dayLog?.lunch;
    const dinnerTaken = dayLog?.dinner;

    if (breakfastTaken) {
      const price = MEAL_PRICES.breakfast;
      totalBill += price;
      mealCounts.breakfast++;
      dayTotal += price;
    }
    if (lunchTaken) {
      const price = MEAL_PRICES.lunch;
      totalBill += price;
      mealCounts.lunch++;
      dayTotal += price;
    }
    if (dinnerTaken) {
       const price = MEAL_PRICES.dinner;
      totalBill += price;
      mealCounts.dinner++;
      dayTotal += price;
    }
    
    if (dayTotal > 0 || isBefore(day, new Date())) {
      dailyBreakdown.push({
        date: format(day, 'MMM d, yyyy'),
        breakfast: breakfastTaken ? 'Yes' : 'No',
        lunch: lunchTaken ? 'Yes' : 'No',
        dinner: dinnerTaken ? 'Yes' : 'No',
        dayTotal: dayTotal,
      });
    }
  });

  return { totalBill, mealCounts, dailyBreakdown };
};

const BillingSummary: FC<BillingSummaryProps> = ({
  user,
  onBillingDateChange,
}) => {
  const [newBillingDate, setNewBillingDate] = useState(user.billingStartDate);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);


  const billingCycle = getBillingCycle(user.billingStartDate);
  const { totalBill, mealCounts, dailyBreakdown } = calculateBill(
    user.tiffins || {},
    billingCycle
  );

  const handleSave = () => {
    if (newBillingDate >= 1 && newBillingDate <= 31) {
      onBillingDateChange(newBillingDate);
      setIsPopoverOpen(false); // Close popover on save
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSave();
  };

  const handleDownloadBill = () => {
    const doc = new jsPDF() as any;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Tiffin Bill', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billed to: ${user.displayName}`, 20, 40);
    doc.text(`Billing Cycle: ${format(billingCycle.start, 'MMM d, yyyy')} - ${format(billingCycle.end, 'MMM d, yyyy')}`, 20, 48);
    
    const breakfastAmount = (mealCounts.breakfast * MEAL_PRICES.breakfast);
    const lunchAmount = (mealCounts.lunch * MEAL_PRICES.lunch);
    const dinnerAmount = (mealCounts.dinner * MEAL_PRICES.dinner);

    doc.autoTable({
        startY: 60,
        head: [['Item', 'Quantity', 'Rate', 'Amount']],
        body: [
            ['Breakfasts', mealCounts.breakfast, `Rs. ${MEAL_PRICES.breakfast.toFixed(2)}`, `Rs. ${breakfastAmount.toFixed(2)}`],
            ['Lunches', mealCounts.lunch, `Rs. ${MEAL_PRICES.lunch.toFixed(2)}`, `Rs. ${lunchAmount.toFixed(2)}`],
            ['Dinners', mealCounts.dinner, `Rs. ${MEAL_PRICES.dinner.toFixed(2)}`, `Rs. ${dinnerAmount.toFixed(2)}`],
        ],
        foot: [['Total', '', '', `Rs. ${totalBill.toFixed(2)}`]],
        headStyles: { fillColor: [24, 95, 53] }, // Hindu Orange for header
        footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        theme: 'striped',
        didDrawPage: (data: any) => {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL BILL:', 130, data.cursor.y + 10);
            doc.text(`Rs. ${totalBill.toFixed(2)}`, 165, data.cursor.y + 10);
        }
    });

    if (dailyBreakdown.length > 0) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Daily Breakdown', 105, 20, { align: 'center' });
        
        doc.autoTable({
            startY: 30,
            head: [['Date', 'Breakfast', 'Lunch', 'Dinner', 'Day Total']],
            body: dailyBreakdown.map(d => [d.date, d.breakfast, d.lunch, d.dinner, `Rs. ${d.dayTotal.toFixed(2)}`]),
            headStyles: { fillColor: [24, 95, 53] },
            theme: 'grid',
            styles: { font: 'helvetica', halign: 'center' },
            bodyStyles: {
              didParseCell: function (data: any) {
                if (data.cell.text[0] === 'Yes') {
                  data.cell.styles.textColor = '#28a745';
                  data.cell.styles.fontStyle = 'bold';
                }
                if (data.cell.text[0] === 'No') {
                  data.cell.styles.textColor = '#dc3545';
                }
              },
            },
        });
    }


    doc.save(`TiffinBill-${user.displayName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex flex-wrap items-center justify-between gap-2">
          <span>Monthly Bill</span>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {user.displayName}
          </span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <CalendarIcon className="h-4 w-4" />
          <span>{format(billingCycle.start, 'MMM d')} - {format(billingCycle.end, 'MMM d, yyyy')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between items-center p-4 rounded-lg bg-primary/20">
          <span className="font-bold text-lg text-primary-foreground">Total Bill</span>
          <span className="font-bold text-3xl text-primary-foreground font-mono">
            Rs. {totalBill.toFixed(2)}
          </span>
        </div>
        <div className="space-y-3 text-sm pt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sunrise className="h-4 w-4 text-[hsl(var(--indicator-breakfast))]" /> Breakfasts
            </div>
            <span>
              {mealCounts.breakfast} x Rs. {MEAL_PRICES.breakfast.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sun className="h-4 w-4 text-[hsl(var(--indicator-lunch))]" /> Lunches
            </div>
            <span>
              {mealCounts.lunch} x Rs. {MEAL_PRICES.lunch.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="h-4 w-4 text-[hsl(var(--indicator-dinner))]" /> Dinners
            </div>
            <span>
              {mealCounts.dinner} x Rs. {MEAL_PRICES.dinner.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-between items-center gap-2">
         <Button variant="outline" onClick={handleDownloadBill} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Bill
          </Button>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" />
              Change Billing Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
             <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Billing Start Date</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the day your monthly cycle starts.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billing-date">Start Day (1-31)</Label>
                  <Input
                    id="billing-date"
                    type="number"
                    min="1"
                    max="31"
                    value={newBillingDate}
                    onChange={(e) =>
                      setNewBillingDate(parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                </div>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
};

export default BillingSummary;

    