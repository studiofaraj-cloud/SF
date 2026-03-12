"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      locale={props.locale}
      className={cn("p-4", className)}
      formatters={{
        formatWeekdayName: (day) =>
          day.toLocaleDateString("it-IT", { weekday: "short" }),
      }}
      classNames={{
        /* Layout */
        months: "flex flex-col gap-4",
        month: "space-y-4",

        /* Header */
        caption:
          "flex items-center justify-between px-2 pb-3 border-b border-border/40",
        caption_label: "text-lg font-semibold text-foreground",

        nav: "flex items-center gap-1",
        nav_button:
          "inline-flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30",
        nav_button_previous: "",
        nav_button_next: "",

        /* Table */
        table: "w-full border-collapse",

        head_row: "grid grid-cols-7",
        head_cell:
          "h-9 flex items-center justify-center text-xs font-medium uppercase tracking-wide text-muted-foreground",

        row: "grid grid-cols-7 gap-y-1",
        cell:
          "h-9 flex items-center justify-center relative focus-within:z-20",

        /* Day */
        day:
          "h-9 w-9 rounded-full text-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground hover:scale-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

        day_selected:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground",

        day_today:
          "font-semibold ring-2 ring-primary ring-offset-2",

        day_outside:
          "text-muted-foreground/40 aria-selected:bg-accent/30",

        day_disabled:
          "text-muted-foreground opacity-50 cursor-not-allowed",

        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",

        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
