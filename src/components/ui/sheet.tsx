'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('font-display text-base font-semibold text-on-surface', className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-on-surface/25 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn('fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l border-outline-variant bg-surface shadow-[-20px_0_60px_rgba(0,0,0,0.5)]', className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-none border border-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle };
