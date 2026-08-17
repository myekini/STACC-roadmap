import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4',
  {
    variants: {
      variant: {
        default: 'border-outline-variant bg-surface-container-low text-on-surface [&>svg]:text-cyan',
        destructive: 'border-error/45 bg-error/10 text-on-surface [&>svg]:text-error',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, role = 'alert', ...props }, ref) => (
    <div ref={ref} role={role} className={cn(alertVariants({ variant }), className)} {...props} />
  ),
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('col-start-2 font-semibold leading-5', className)} {...props} />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('col-start-2 text-sm leading-5 text-on-surface-variant [&_p]:leading-relaxed', className)}
      {...props}
    />
  ),
);
AlertDescription.displayName = 'AlertDescription';

const AlertAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('col-span-2 mt-2 sm:col-start-2 sm:col-span-1 sm:mt-1', className)} {...props} />
  ),
);
AlertAction.displayName = 'AlertAction';

export { Alert, AlertAction, AlertDescription, AlertTitle };
