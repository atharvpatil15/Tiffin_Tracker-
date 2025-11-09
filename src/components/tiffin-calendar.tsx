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
        "relative flex h-full w-full flex-col items-center justify-center p-1",
        props.activeModifiers.today && "font-bold"
      )}
    >
      <div className="z-10">{format(props.date, "d")}</div>
      {meals && (
        <div className="absolute bottom-1.5 z-10 flex w-full justify-center gap-1">
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
      modifiersClassNames={{ tiffinLog: "" }}
      components={{
        DayContent: CustomDayContent,
      }}
      className="h-full w-full"
      classNames={{
        months: "h-full",
        month: "flex flex-col h-full",
        table: "flex-1 w-full border-collapse",
        head_row: "flex",
        head_cell: "w-full text-muted-foreground font-normal text-sm",
        row: "flex w-full mt-2",
        cell: "flex-1 h-full p-0 text-center text-sm relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full p-0 font-normal aria-selected:opacity-100 rounded-lg flex-1"
        ),
        day_selected:
          "bg-accent/20 text-accent-foreground rounded-lg focus:bg-accent/30 focus:text-primary",
        day_today: "bg-primary text-primary-foreground rounded-lg",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-medium font-headline",
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
