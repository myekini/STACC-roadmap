import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-none font-code font-semibold uppercase tracking-[0.08em] transition-[background-color,border-color,color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border border-transparent bg-primary text-primary-foreground hover:bg-primary-neon',
        secondary: 'border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high',
        outline: 'border border-outline-variant bg-transparent text-on-surface hover:border-cyan/55 hover:bg-cyan/[0.06] hover:text-cyan',
        ghost: 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        destructive: 'border border-error-action bg-error-action text-on-error hover:bg-error-action/90',
      },
      size: {
        default: 'px-4 py-2 text-xs',
        sm: 'min-h-9 px-3 text-xs',
        lg: 'min-h-12 px-6 text-sm',
        icon: 'h-11 w-11 min-h-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-busy={loading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner aria-hidden="true" /> : null}
        {loading && loadingText !== undefined ? loadingText : children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
