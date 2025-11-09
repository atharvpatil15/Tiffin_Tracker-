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
        <div className="absolute bottom-1.5 z-10 flex w-full justify-center gap-1.5">
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
        months: "flex flex-col",
        month: "flex flex-col",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: "text-muted-foreground font-normal text-sm",
        row: "grid grid-cols-7 w-full mt-2",
        cell: "flex-1 p-0 text-center text-sm relative focus-within:relative focus-within:z-20 aspect-square",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full p-0 font-normal aria-selected:opacity-100 rounded-lg flex-1 hover:bg-white/10"
        ),
        day_selected:
          "bg-accent/20 text-accent-foreground rounded-lg focus:bg-accent/30 focus:text-primary",
        day_today: "bg-primary text-primary-foreground rounded-lg",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-xl font-medium font-headline",
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
