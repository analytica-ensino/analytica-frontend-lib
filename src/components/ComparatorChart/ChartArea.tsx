export interface ChartAreaProps {
  readonly children: React.ReactNode;
}

export function ChartArea({ children }: ChartAreaProps) {
  return (
    <div className="relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex items-stretch pointer-events-none gap-4">
        {/* Spacer for label column (matches BarChartRow label width) */}
        <div className="w-64 shrink-0" />
        <div className="flex-1 flex">
          <div className="w-1/4 border-r border-dashed border-border-200" />
          <div className="w-1/4 border-r border-dashed border-border-200" />
          <div className="w-1/4 border-r border-dashed border-border-200" />
          <div className="w-1/4" />
        </div>
      </div>
      {/* Content */}
      <div className="relative space-y-6">{children}</div>
    </div>
  );
}
