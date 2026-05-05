import { SkeletonCard } from '../Skeleton/Skeleton';

export function ComparatorLoadingState() {
  return (
    <div
      className="flex flex-col gap-6"
      data-testid="comparator-loading-skeleton"
    >
      <SkeletonCard className="h-12 w-full" />
      <SkeletonCard className="h-64 w-full" />
      <SkeletonCard className="h-64 w-full" />
    </div>
  );
}
