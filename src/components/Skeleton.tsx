import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = '', style }) => (
  <div
    aria-hidden="true"
    className={`skeleton ${className}`}
    style={style}
  />
);

export const ToolViewSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-border bg-card p-5 sm:p-6" aria-label="Loading tool">
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 min-w-[180px]">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-3.5 w-72 max-w-full rounded-md mt-2.5" />
      </div>
    </div>
    <div className="mt-6">
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
    </div>
  </div>
);
