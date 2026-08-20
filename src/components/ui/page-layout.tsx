import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

function PageFrame({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl space-y-7 py-5 md:space-y-8 md:py-8', className)}>{children}</div>;
}

function PageHeader({
  title,
  description,
  context,
  action,
  className,
}: {
  title: string;
  description?: string;
  context?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('grid gap-5 border-b border-outline-variant pb-6 min-[1000px]:grid-cols-[minmax(0,1fr)_auto] min-[1000px]:items-end', className)}>
      <div className="max-w-3xl">
        {context ? <div className="font-code text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{context}</div> : null}
        <h1 className={cn('text-balance font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-4xl', context && 'mt-2')}>
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="min-w-0">{action}</div> : null}
    </header>
  );
}

export { PageFrame, PageHeader };
