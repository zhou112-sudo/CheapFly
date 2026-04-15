import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function parseYmd(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(ymd) {
  const d = parseYmd(ymd);
  if (!d) return "请选择日期";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthCells(monthStart) {
  const month = monthStart.getMonth();
  const firstWeekday = monthStart.getDay();
  const gridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
}

function MonthView({ monthStart, selectedDate, onSelect }) {
  const cells = useMemo(() => buildMonthCells(monthStart), [monthStart]);
  const today = new Date();

  return (
    <div className="space-y-2">
      <h4 className="text-center text-sm font-semibold text-foreground">
        {monthStart.getFullYear()} 年 {monthStart.getMonth() + 1} 月
      </h4>
      <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {cells.map(({ date, isCurrentMonth }) => {
          const selected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={cn(
                "mx-auto h-7 w-7 rounded-md text-[13px] font-medium transition-colors",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground/45",
                selected ? "bg-foreground text-background" : "hover:bg-muted",
                isToday && !selected && "ring-1 ring-border"
              )}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DepartureDatePicker({ id, value, onChange, className }) {
  const selectedDate = parseYmd(value) ?? new Date();
  const [monthCursor, setMonthCursor] = useState(startOfMonth(selectedDate));
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-8 w-full items-center rounded-md px-0 text-left text-sm font-medium text-foreground",
            className
          )}
        >
          {formatDisplay(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-[min(92vw,560px)] p-3 md:p-3.5">
        <div className="mb-2 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setMonthCursor((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setMonthCursor((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <MonthView
            monthStart={monthCursor}
            selectedDate={selectedDate}
            onSelect={(date) => {
              onChange(formatYmd(date));
              setOpen(false);
            }}
          />
          <div className="hidden md:block">
            <MonthView
              monthStart={addMonths(monthCursor, 1)}
              selectedDate={selectedDate}
              onSelect={(date) => {
                onChange(formatYmd(date));
                setOpen(false);
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
