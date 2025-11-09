"use client";

import type { FC } from "react";
import { DayPicker, type DayContentProps } from "react-day-picker";
import { format } from "date-fns";

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

  const getGradientStyle = () => {
    if (!meals) return {};

    const colors = [];
    if (meals.breakfast) colors.push("hsl(var(--indicator-breakfast))");
    if (meals.lunch) colors.push("hsl(var(--indicator-lunch))");
    if (meals.dinner) colors.push("hsl(var(--indicator-dinner))");

    if (colors.length === 0) return {};
    if (colors.length === 1) return { background: colors[0] };

    return {
      background: `linear-gradient(45deg, ${colors.join(", ")})`,
    };
  };
  
  const hasMeals = meals && (meals.breakfast || meals.lunch || meals.dinner);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        props.activeModifiers.today && "font-bold",
        hasMeals && "rounded-md text-white"
      )}
      style={getGradientStyle()}
    >
      <div className="z-10">{format(props.date, "d")}</div>
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
          cell: "h-9 w-[14.28%] text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "ring-2 ring-primary rounded-md",
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
