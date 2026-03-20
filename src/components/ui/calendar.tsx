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
      className={cn("p-3 sm:p-5 w-full", className)}
      formatters={{
        formatWeekdayName: (day) =>
          day.toLocaleDateString(props.locale ? undefined : "it-IT", { weekday: "short" }),
      }}
      classNames={{
        /* Root & container */
        root: "w-full",
        months: "flex flex-col gap-4 w-full",
        month: "w-full",

        /* Month caption (title + nav) */
        month_caption: "flex items-center justify-between px-1 pb-3 mb-1",
        caption_label: "text-base sm:text-lg font-bold text-foreground tracking-tight",

        /* Navigation */
        nav: "flex items-center gap-1",
        button_previous:
          "inline-flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground bg-muted/50 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:pointer-events-none",
        button_next:
          "inline-flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground bg-muted/50 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:pointer-events-none",
        chevron: "h-4 w-4",

        /* Month grid — the <table> element, must be full width */
        month_grid: "w-full border-collapse",

        /* Weekday header row — <thead> <tr> */
        weekdays: "",
        weekday:
          "text-center text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-primary/60 py-2 px-0",

        /* Weeks container (<tbody>) & individual week rows (<tr>) */
        weeks: "",
        week: "",

        /* Day cell (<td>) — spans full width, centers the button */
        day:
          "text-center p-1 relative focus-within:z-20",

        /* Day button — the clickable circle, smaller than the cell */
        day_button:
          "inline-flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 hover:bg-primary/15 hover:text-primary hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",

        /* Selection state — selected day */
        selected:
          "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:bg-primary hover:text-primary-foreground ring-2 ring-primary/20 ring-offset-1 ring-offset-background rounded-full",

        /* Day flags */
        today:
          "font-bold text-primary bg-primary/10 ring-2 ring-primary/40 ring-offset-1 ring-offset-background rounded-full",
        outside:
          "text-muted-foreground/20 hover:bg-transparent hover:text-muted-foreground/30 hover:scale-100",
        disabled:
          "text-muted-foreground/25 line-through decoration-muted-foreground/15 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground/25 hover:scale-100",
        hidden: "invisible",

        /* Range states */
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        range_start: "",
        range_end: "",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />;
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
