"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  name: string;
  value: number;
  date: string;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxValue = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-amber-100/40 text-base font-light">
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-64 px-2">
        {data.map((item) => {
          const heightPercent = (item.value / maxValue) * 100;

          return (
            <div
              key={item.name + item.date}
              className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 min-w-0"
            >
              <span className="text-[10px] text-amber-400 font-semibold shrink-0">
                {formatCurrency(item.value)}
              </span>
              <div
                className="w-full rounded-t-md bg-amber-500/70 hover:bg-amber-400 transition-all duration-300 min-h-[4px]"
                style={{ height: `${Math.max(heightPercent, 2)}%` }}
                title={`${item.name}: ${formatCurrency(item.value)}`}
              />
              <span className="text-[10px] text-amber-100/40 mt-1 shrink-0 truncate w-full text-center">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
