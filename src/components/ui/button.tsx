import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-none font-code text-sm font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white shadow-sm hover:bg-primary-neon',
        secondary: 'border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high',
        outline: 'border border-outline-variant bg-surface text-on-surface hover:border-cyan/45 hover:text-cyan',
        ghost: 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        destructive: 'bg-error text-white hover:bg-error/90',
      },
      size: {
        default: 'px-4 py-2 text-xs',
        sm: 'min-h-9 px-3 text-[11px]',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
