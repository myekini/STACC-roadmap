import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-none border px-2 py-0.5 font-code text-[10px] font-semibold uppercase tracking-[0.12em]', {
  variants: {
    variant: {
      default: 'border-primary/35 bg-primary/10 text-primary-neon',
      success: 'border-secondary/35 bg-secondary/10 text-secondary',
      muted: 'border-outline-variant bg-surface-container text-on-surface-variant',
      outline: 'border-outline-variant bg-surface text-on-surface-variant',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
