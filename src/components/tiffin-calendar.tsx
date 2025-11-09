"use client";

import type { FC } from "react";
import { DayPicker, type DayProps } from "react-day-picker";
import { format } from "date-fns";
import { Sunrise, Sun, Moon } from "lucide-react";

import type { TiffinLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface TiffinCalendarProps {
  tiffinLog: TiffinLog;
  onDayClick: (date: Date) => void;
  month: Date;
  setMonth: (date: Date) => void;
}

const TiffinCalendar: FC<TiffinCalendarProps> = ({
  tiffinLog,
  onDayClick,
  month,
  setMonth,
}) => {

  function DayContent(props: DayProps) {
    const dayFormatted = format(props.date, "yyyy-MM-dd");
    const meals = tiffinLog[dayFormatted];
    
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        <span>{format(props.date, "d")}</span>
        {meals && (
          <div className="absolute bottom-1 flex gap-1">
            {meals.breakfast && <Sunrise className="h-3 w-3 text-accent" />}
            {meals.lunch && <Sun className="h-3 w-3 text-accent" />}
            {meals.dinner && <Moon className="h-3 w-3 text-accent" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <DayPicker
      month={month}
      onMonthChange={setMonth}
      onDayClick={(day, modifiers) => !modifiers.disabled && onDayClick(day)}
      components={{
        DayContent: DayContent,
      }}
      className="bg-card rounded-lg shadow-lg p-4"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-medium font-headline",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-16 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-16 w-full p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-accent/20 text-accent-foreground focus:bg-accent/20 focus:text-primary",
        day_today: "bg-primary/20 text-primary-foreground font-bold",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent/10 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
      }}
      showOutsideDays
    />
  );
};

export default TiffinCalendar;
