import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductSkeleton({ count = 6, className }: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-amber-500/10 bg-[#1a0f07] overflow-hidden"
        >
          <div className="relative aspect-square bg-amber-500/[0.03] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.05] to-transparent animate-pulse" />
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full border-2 border-amber-500/10" />
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="h-5 bg-amber-500/[0.06] rounded animate-pulse w-3/4" />
            <div className="h-4 bg-amber-500/[0.04] rounded animate-pulse w-1/2" />
            <div className="flex items-center gap-2">
              <div className="h-4 bg-amber-500/[0.04] rounded animate-pulse w-16" />
              <div className="w-1 h-1 rounded-full bg-amber-500/20" />
              <div className="h-4 bg-amber-500/[0.04] rounded animate-pulse w-14" />
            </div>
            <div className="h-8 bg-amber-500/[0.08] rounded animate-pulse w-28 mt-1" />
          </div>
          <div className="px-4 pb-4 mt-auto">
            <div className="h-10 bg-amber-500/[0.08] rounded animate-pulse w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
