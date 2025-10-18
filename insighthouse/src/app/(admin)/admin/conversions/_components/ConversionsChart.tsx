'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@ui/chart";
import { Pie, PieChart, Cell } from "recharts";

interface ConversionType {
  name: string;
  value: number;
  color: string;
}

interface ConversionsChartProps {
  data: ConversionType[];
}

export function ConversionsChart({ data }: ConversionsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        value: { label: "Conversões" },
      }}
      className="h-[300px] w-full"
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${value})`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}
