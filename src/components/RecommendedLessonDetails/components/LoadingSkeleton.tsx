import {
  SkeletonText,
  SkeletonRounded,
  SkeletonTable,
} from '../../Skeleton/Skeleton';

/**
 * Loading skeleton component for RecommendedLessonDetails
 * Uses the shared Skeleton components from the library
 */
export const LoadingSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Breadcrumb skeleton */}
    <SkeletonText width={256} />

    {/* Header skeleton */}
    <div className="bg-background rounded-xl border border-border-50 p-6">
      <div className="flex flex-col gap-3">
        <SkeletonText width="75%" height={28} />
        <SkeletonText width="50%" />
      </div>
    </div>

    {/* Results section skeleton */}
    <div className="flex flex-col gap-4">
      <SkeletonText width={192} height={20} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonRounded height={140} />
        <SkeletonRounded height={140} />
        <SkeletonRounded height={140} />
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-background rounded-xl border border-border-50 p-4">
      <SkeletonTable rows={4} columns={5} />
    </div>
  </div>
);

export default LoadingSkeleton;
