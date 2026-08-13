import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-xl border p-4 font-body text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-1px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-surface-card text-on-surface border-outline-variant/80 [&>svg]:text-cyan',
        destructive:
          'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 [&>svg]:text-red-500',
        warning:
          'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 [&>svg]:text-amber-500',
        success:
          'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 [&>svg]:text-emerald-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-display font-bold leading-none tracking-tight text-on-surface', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs leading-relaxed text-on-surface-variant [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

const AlertAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-3 flex items-center justify-end gap-2 sm:absolute sm:right-4 sm:top-3.5 sm:mt-0', className)}
    {...props}
  />
));
AlertAction.displayName = 'AlertAction';

export { Alert, AlertTitle, AlertDescription, AlertAction };
