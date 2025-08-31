"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({
  onSelect,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [date, setDate] = useState<Date>();

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onSelect(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-slate-500",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={{ before: new Date() }}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
