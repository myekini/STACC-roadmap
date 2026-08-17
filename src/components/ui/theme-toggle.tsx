'use client';

import { Moon, Sun } from 'lucide-react';

import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';

type ThemeToggleProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useUiStore();
  const dark = theme === 'dark';
  const nextTheme = dark ? 'light' : 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={`Dark mode ${dark ? 'on' : 'off'}. Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-10 w-[4.5rem] shrink-0 items-center rounded-full border border-outline-variant bg-surface-card p-1 text-on-surface-variant shadow-sm transition-colors hover:border-cyan/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-1 top-1 size-8 rounded-full border border-cyan/25 bg-surface-container-high shadow-[0_3px_10px_rgba(2,8,23,0.18)] transition-transform duration-200 motion-reduce:transition-none',
          dark && 'translate-x-8',
        )}
      />
      <span className="relative z-10 flex size-8 items-center justify-center">
        <Sun className={cn('size-4 transition-colors', dark ? 'text-outline' : 'text-warning')} />
      </span>
      <span className="relative z-10 flex size-8 items-center justify-center">
        <Moon className={cn('size-4 transition-colors', dark ? 'text-cyan' : 'text-outline')} />
      </span>
    </button>
  );
}

export { ThemeToggle };
