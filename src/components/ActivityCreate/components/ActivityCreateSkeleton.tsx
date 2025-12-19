import { SkeletonText, Skeleton, SkeletonCard } from '../../..';

/**
 * Loading skeleton component for ActivityCreate page
 *
 * @returns Skeleton JSX element
 */
export const ActivityCreateSkeleton = () => {
  return (
    <div
      data-testid="create-activity-page"
      className="flex flex-col w-full h-screen overflow-hidden p-5 bg-background"
    >
      {/* Header Section Skeleton */}
      <div className="w-full h-[80px] flex flex-row items-center justify-between px-6 gap-3 flex-shrink-0">
        <section className="text-text-950">
          <Skeleton variant="rectangular" width={32} height={32} />
        </section>

        <section className="flex flex-col gap-0.5 w-full">
          <div className="flex flex-row items-center justify-between w-full text-text-950">
            <SkeletonText width={180} height={24} />
            <div className="flex flex-row gap-4 items-center">
              <SkeletonText width={150} height={16} />
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={140} height={32} />
            </div>
          </div>
          <SkeletonText width={400} height={16} />
        </section>
      </div>

      {/* Main Content with 3 columns - Skeleton */}
      <div className="flex flex-row w-full flex-1 overflow-hidden gap-5 min-h-0">
        {/* First Column - Filters Skeleton */}
        <div className="flex flex-col gap-3 overflow-hidden h-full min-h-0 max-h-full relative w-[400px] flex-shrink-0 p-4 bg-background">
          <SkeletonText width={150} height={20} />
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-3">
              <SkeletonText width={120} height={16} />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    variant="rounded"
                    key={i}
                    width="100%"
                    height={32}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SkeletonText width={140} height={16} />
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <Skeleton
                    variant="rounded"
                    key={i}
                    width="100%"
                    height={40}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SkeletonText width={80} height={16} />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2].map((i) => (
                  <Skeleton
                    variant="rounded"
                    key={i}
                    width="100%"
                    height={60}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <Skeleton variant="rounded" width="100%" height={40} />
          </div>
        </div>

        {/* Second Column - Question List Skeleton */}
        <div className="flex-1 min-w-0 overflow-hidden h-full p-4">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <Skeleton variant="rectangular" width={24} height={24} />
                <SkeletonText width={150} height={20} />
              </div>
              <Skeleton variant="rounded" width={180} height={32} />
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} lines={3} />
              ))}
            </div>
          </div>
        </div>

        {/* Third Column - Activity Preview Skeleton */}
        <div className="w-[470px] flex-shrink-0 overflow-hidden h-full min-h-0 p-4">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-2">
              <SkeletonText width={200} height={20} />
              <SkeletonText width={150} height={16} />
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-border-200 rounded-lg"
                >
                  <SkeletonText lines={2} spacing="small" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton variant="rounded" width="100%" height={36} />
          </div>
        </div>
      </div>
    </div>
  );
};
