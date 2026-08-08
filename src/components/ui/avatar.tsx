'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      default: 'h-10 w-10',
      sm: 'h-8 w-8',
      lg: 'h-14 w-14',
    },
  },
  defaultVariants: { size: 'default' },
});

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn(avatarVariants({ size }), className)} {...props} />;
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn('aspect-square h-full w-full object-cover', className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('flex h-full w-full items-center justify-center rounded-[inherit] bg-surface-container-high text-on-surface-variant', className)}
      {...props}
    />
  );
}

/** Small status/role indicator pinned to the bottom-right corner of an Avatar. */
function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-secondary',
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="avatar-group" className={cn('flex items-center -space-x-2.5', className)} {...props} />;
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-group-count"
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background bg-surface-container-high font-code text-xs font-semibold text-on-surface-variant',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount, avatarVariants };
