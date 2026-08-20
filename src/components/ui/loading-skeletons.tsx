import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function MetricSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border border-outline-variant bg-surface p-4', className)} aria-label="Loading metric">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-32 max-w-full" />
    </div>
  );
}

function CardListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)} role="status" aria-label="Loading content">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border border-outline-variant bg-surface p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-6 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
          <Skeleton className="mt-6 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading rows">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}
    </div>
  );
}

export { CardListSkeleton, MetricSkeleton, TableSkeleton };
