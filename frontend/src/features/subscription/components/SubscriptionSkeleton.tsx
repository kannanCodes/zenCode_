/** Skeleton shimmer for the Plans page and Manage Subscription page. */

const Shimmer = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-[#1a1d26] ${className}`} />
);

export const PlanCardSkeleton = () => (
  <div className="flex flex-col gap-4 p-6 rounded-xl bg-[#111111] border border-[#272b3a]">
    <Shimmer className="h-5 w-24" />
    <Shimmer className="h-8 w-32" />
    <Shimmer className="h-4 w-full" />
    <div className="flex flex-col gap-2 mt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Shimmer className="h-4 w-4 rounded-full flex-shrink-0" />
          <Shimmer className="h-4 flex-1" />
        </div>
      ))}
    </div>
    <Shimmer className="h-10 w-full mt-4 rounded-md" />
  </div>
);

export const ManageSubscriptionSkeleton = () => (
  <div className="max-w-2xl mx-auto flex flex-col gap-6">
    <Shimmer className="h-7 w-48" />
    <div className="p-6 rounded-xl bg-[#111111] border border-[#272b3a] flex flex-col gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-4 w-36" />
        </div>
      ))}
    </div>
    <div className="flex gap-3">
      <Shimmer className="h-10 w-36 rounded-md" />
      <Shimmer className="h-10 w-36 rounded-md" />
    </div>
  </div>
);
