'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-none border border-outline-variant/60 bg-surface-container-high', className)} {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full rounded-none bg-cyan transition-transform duration-500"
      style={{ transform: `translateX(-${100 - Math.max(0, Math.min(100, value || 0))}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
