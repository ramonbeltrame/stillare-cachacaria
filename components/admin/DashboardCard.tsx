import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-6 rounded-xl border border-amber-500/20 bg-[#120a04]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-wider uppercase text-amber-100/50 font-medium">
            {title}
          </span>
          <span className="text-3xl font-display font-bold text-amber-100">
            {value}
          </span>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 shrink-0">
          <Icon className="h-5 w-5 text-amber-400" />
        </div>
      </div>
      {description && (
        <p className="text-xs text-amber-100/40 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
