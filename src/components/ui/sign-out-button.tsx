'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button, type ButtonProps } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type SignOutHandler = () => Promise<void> | void;

function useSignOutAction(onSignOut: SignOutHandler) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onSignOut();
      router.replace('/');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out. Try again.');
      setPending(false);
    }
  };

  return { pending, run };
}

interface SignOutButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'loadingText'> {
  onSignOut: SignOutHandler;
  compact?: boolean;
}

function SignOutButton({ onSignOut, compact = false, className, variant = 'ghost', ...props }: SignOutButtonProps) {
  const { pending, run } = useSignOutAction(onSignOut);

  return (
    <Button
      type="button"
      variant={variant}
      size={compact ? 'icon' : props.size}
      onClick={run}
      loading={pending}
      loadingText={compact ? '' : 'Signing out…'}
      aria-label={compact ? (pending ? 'Signing out' : 'Sign out') : undefined}
      className={cn('text-error hover:bg-error-container/20 hover:text-error', className)}
      {...props}
    >
      <LogOut aria-hidden="true" />
      {!compact ? 'Sign out' : null}
    </Button>
  );
}

function SignOutMenuItem({ onSignOut, className }: { onSignOut: SignOutHandler; className?: string }) {
  const { pending, run } = useSignOutAction(onSignOut);

  return (
    <DropdownMenuItem
      disabled={pending}
      onSelect={(event) => {
        event.preventDefault();
        void run();
      }}
      className={cn('flex cursor-pointer items-center gap-2.5 rounded-none py-2 text-xs text-error focus:bg-error-container/20 focus:text-error', className)}
    >
      {pending ? <Spinner aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
      <span>{pending ? 'Signing out…' : 'Sign out'}</span>
    </DropdownMenuItem>
  );
}

export { SignOutButton, SignOutMenuItem };
