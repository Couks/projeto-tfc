"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

export type DateFilterValue = "DAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as DateFilterValue)}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Date range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DAY">Today</SelectItem>
        <SelectItem value="WEEK">This Week</SelectItem>
        <SelectItem value="MONTH">This Month</SelectItem>
        <SelectItem value="YEAR">This Year</SelectItem>
        <SelectItem value="CUSTOM" disabled>Custom (soon)</SelectItem>
      </SelectContent>
    </Select>
  );
}


