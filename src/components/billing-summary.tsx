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

  return { start: cycleStart, end: cycleEnd };
};

const calculateBill = (
  tiffinLog: TiffinLog,
  billingCycle: { start: Date; end: Date }
) => {
  const daysInCycle = eachDayOfInterval(billingCycle);
  let totalBill = 0;
  const mealCounts = { breakfast: 0, lunch: 0, dinner: 0 };

  daysInCycle.forEach((day) => {
    const dayLog = tiffinLog[format(day, 'yyyy-MM-dd')];
    if (dayLog) {
      if (dayLog.breakfast) {
        totalBill += MEAL_PRICES.breakfast;
        mealCounts.breakfast++;
      }
      if (dayLog.lunch) {
        totalBill += MEAL_PRICES.lunch;
        mealCounts.lunch++;
      }
      if (dayLog.dinner) {
        totalBill += MEAL_PRICES.dinner;
        mealCounts.dinner++;
      }
    }
  });

  return { totalBill, mealCounts };
};

const BillingSummary: FC<BillingSummaryProps> = ({
  user,
  onBillingDateChange,
}) => {
  const [newBillingDate, setNewBillingDate] = useState(user.billingStartDate);

  const billingCycle = getBillingCycle(user.billingStartDate);
  const { totalBill, mealCounts } = calculateBill(
    user.tiffins || {},
    billingCycle
  );

  const handleSave = () => {
    if (newBillingDate >= 1 && newBillingDate <= 31) {
      onBillingDateChange(newBillingDate);
    }
  };

  const handleDownloadBill = () => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Tiffin Bill', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Billed to: ${user.displayName}`, 20, 40);
    doc.text(`Billing Cycle: ${format(billingCycle.start, 'MMM d, yyyy')} - ${format(billingCycle.end, 'MMM d, yyyy')}`, 20, 48);
    
    doc.line(20, 60, 190, 60); // separator

    doc.setFont('courier', 'bold');
    doc.text('Item', 20, 70);
    doc.text('Quantity', 80, 70);
    doc.text('Rate', 120, 70);
    doc.text('Amount', 160, 70);
    doc.line(20, 75, 190, 75);

    let yPos = 85;
    const items = [
      { name: 'Breakfasts', count: mealCounts.breakfast, price: MEAL_PRICES.breakfast },
      { name: 'Lunches', count: mealCounts.lunch, price: MEAL_PRICES.lunch },
      { name: 'Dinners', count: mealCounts.dinner, price: MEAL_PRICES.dinner },
    ];

    doc.setFont('courier', 'normal');
    items.forEach(item => {
      if (item.count > 0) {
        const total = (item.count * item.price).toFixed(2);
        doc.text(item.name, 20, yPos);
        doc.text(item.count.toString(), 80, yPos);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 120, yPos);
        doc.text(`Rs. ${total}`, 160, yPos);
        yPos += 10;
      }
    });

    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text('TOTAL BILL:', 110, yPos);
    doc.text(`Rs. ${totalBill.toFixed(2)}`, 160, yPos);

    doc.save(`TiffinBill-${user.displayName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center justify-between">
          <span>Monthly Bill</span>
          <span className="text-sm font-medium text-muted-foreground">
            {user.displayName}
          </span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(billingCycle.start, 'MMM d, yyyy')} -{' '}
          {format(billingCycle.end, 'MMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between items-center p-4 rounded-lg bg-primary/20">
          <span className="font-bold text-lg text-primary-foreground">Total Bill</span>
          <span className="font-bold text-3xl text-primary-foreground font-mono">
            ₹{totalBill.toFixed(2)}
          </span>
        </div>
        <div className="space-y-3 text-sm pt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sunrise className="h-4 w-4 text-[hsl(var(--indicator-breakfast))]" /> Breakfasts
            </div>
            <span>
              {mealCounts.breakfast} x ₹{MEAL_PRICES.breakfast}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sun className="h-4 w-4 text-[hsl(var(--indicator-lunch))]" /> Lunches
            </div>
            <span>
              {mealCounts.lunch} x ₹{MEAL_PRICES.lunch}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Moon className="h-4 w-4 text-[hsl(var(--indicator-dinner))]" /> Dinners
            </div>
            <span>
              {mealCounts.dinner} x ₹{MEAL_PRICES.dinner}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-between items-center gap-2">
         <Button variant="outline" onClick={handleDownloadBill} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Bill
          </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" />
              Change Billing Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
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
              <Button onClick={handleSave}>Save</Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
};

export default BillingSummary;
