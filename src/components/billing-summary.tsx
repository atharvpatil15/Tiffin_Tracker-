"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  isBefore,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CalendarIcon, Edit, Utensils, Sunrise, Sun, Moon } from "lucide-react";

import type { TiffinLog, UserData } from "@/lib/types";
import { MEAL_PRICES, USERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BillingSummaryProps {
  user: UserData;
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
    cycleStart = new Date(today.getFullYear(), today.getMonth(), billingStartDate);
    const nextMonth = addMonths(cycleStart, 1);
    cycleEnd = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), billingStartDate - 1);
  } else {
    const prevMonth = subMonths(today, 1);
    cycleStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), billingStartDate);
    cycleEnd = new Date(today.getFullYear(), today.getMonth(), billingStartDate - 1);
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
    const dayLog = tiffinLog[format(day, "yyyy-MM-dd")];
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

  return (
    <Card className="w-full lg:w-96 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center justify-between">
          <span>Monthly Bill</span>
          <span className="text-sm font-medium text-muted-foreground">{user.name}</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(billingCycle.start, "MMM d, yyyy")} -{" "}
          {format(billingCycle.end, "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
            <span className="font-bold text-lg text-primary">Total Bill</span>
            <span className="font-bold text-2xl text-primary font-mono">₹{totalBill.toFixed(2)}</span>
        </div>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground"><Sunrise className="h-4 w-4 text-accent" /> Breakfasts</div>
                <span>{mealCounts.breakfast} x ₹{MEAL_PRICES.breakfast}</span>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground"><Sun className="h-4 w-4 text-accent" /> Lunches</div>
                <span>{mealCounts.lunch} x ₹{MEAL_PRICES.lunch}</span>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground"><Moon className="h-4 w-4 text-accent" /> Dinners</div>
                <span>{mealCounts.dinner} x ₹{MEAL_PRICES.dinner}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
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
                  onChange={(e) => setNewBillingDate(parseInt(e.target.value, 10))}
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
