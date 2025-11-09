"use client";

import type { FC } from "react";
import { DayPicker, type DayContentProps } from "react-day-picker";
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

function CustomDayContent(props: DayContentProps) {
  const dayFormatted = format(props.date, "yyyy-MM-dd");
  const meals = (props.activeModifiers.tiffinLog as any)?.[dayFormatted];

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center p-2",
        props.activeModifiers.today && "font-bold"
      )}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {format(props.date, "d")}
      </div>
      {meals && (
        <div className="absolute bottom-1.5 flex justify-center w-full gap-1">
          {meals.breakfast && <Sunrise className="h-3 w-3 text-accent" />}
          {meals.lunch && <Sun className="h-3 w-3 text-accent" />}
          {meals.dinner && <Moon className="h-3 w-3 text-accent" />}
        </div>
      )}
    </div>
  );
}


const TiffinCalendar: FC<TiffinCalendarProps> = ({
  tiffinLog,
  onDayClick,
  month,
  setMonth,
}) => {
  return (
    <DayPicker
      month={month}
      onMonthChange={setMonth}
      onDayClick={(day, modifiers) => !modifiers.disabled && onDayClick(day)}
      modifiers={{ tiffinLog: tiffinLog as any }}
      modifiersClassNames={{ tiffinLog: '' }}
      components={{
        DayContent: CustomDayContent,
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
        cell: "h-20 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-20 w-full p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-accent/20 text-accent-foreground rounded-md focus:bg-accent/20 focus:text-primary",
        day_today: "bg-primary/20 text-primary-foreground rounded-md",
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
