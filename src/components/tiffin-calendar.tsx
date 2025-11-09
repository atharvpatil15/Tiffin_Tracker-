"use client";

import type { FC } from "react";
import { DayPicker, type DayContentProps } from "react-day-picker";
import { format } from "date-fns";

import type { TiffinLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function CustomDayContent(props: DayContentProps) {
  const dayFormatted = format(props.date, "yyyy-MM-dd");
  const meals = (props.activeModifiers.tiffinLog as any)?.[dayFormatted];

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center p-1",
        props.activeModifiers.today && "font-bold"
      )}
    >
      <div className="z-10">{format(props.date, "d")}</div>
      {meals && (
        <div className="absolute bottom-1 z-10 flex w-full justify-center gap-1">
          {meals.breakfast && <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--indicator-breakfast))]" />}
          {meals.lunch && <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--indicator-lunch))]" />}
          {meals.dinner && <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--indicator-dinner))]" />}
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
        modifiersClassNames={{ tiffinLog: "" }}
        components={{
          DayContent: CustomDayContent,
        }}
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4",
          month: "space-y-4 w-full",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell:
            "text-muted-foreground rounded-md w-[14.28%] font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-[14.28%] text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
        }}
        showOutsideDays
      />
  );
};

export default TiffinCalendar;
