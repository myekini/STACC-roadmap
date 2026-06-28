'use client';

import { useUiStore } from '@/store/useUiStore';
import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';

export default function TopBar() {
  const { theme, setTheme, isAssistantOpen, setAssistantOpen } = useUiStore();
  const { user } = useUserData();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-surface-bright/80 backdrop-blur-md border-b border-outline-variant fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-lg h-16 dark:bg-background/80 dark:border-outline/30">
      <div className="flex items-center gap-lg">
        <Link href="/dashboard" className="font-headline-md text-headline-md font-extrabold tracking-tight text-primary hover:opacity-90 transition-opacity dark:text-primary-fixed">
          Roadmap Tracker
        </Link>
        <nav className="hidden md:flex gap-md">
          <Link href="/roadmap" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md dark:text-outline-variant dark:hover:text-primary-fixed">
            Learn
          </Link>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md dark:text-outline-variant dark:hover:text-primary-fixed">
            Practice
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md dark:text-outline-variant dark:hover:text-primary-fixed">
            Mentors
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-md">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search paths..."
            className="pl-10 pr-4 py-1.5 bg-surface-container rounded-full border-transparent focus:border-primary focus:ring-1 focus:ring-primary text-body-sm font-body-sm transition-all w-48 focus:w-64 placeholder:text-outline outline-none dark:bg-inverse-surface/30 dark:text-on-surface dark:placeholder:text-outline-variant"
          />
        </div>

        {/* Continue Learning Link */}
        <Link href="/roadmap">
          <button className="bg-primary text-on-primary font-label-md text-label-md px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary-container/80">
            Continue Learning
          </button>
        </Link>

        {/* Notifications */}
        <button
          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container dark:hover:bg-inverse-surface/40"
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container dark:hover:bg-inverse-surface/40"
          title="Toggle Light/Dark Mode"
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* AI Study Assistant Toggle (Visible on mobile/tablet or for opening sidebar) */}
        <button
          onClick={() => setAssistantOpen(!isAssistantOpen)}
          className={`p-2 rounded-full transition-all ${
            isAssistantOpen
              ? 'bg-primary/10 text-primary dark:bg-primary-container/20 dark:text-primary-fixed'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface-container dark:hover:bg-inverse-surface/40'
          }`}
          title="Toggle Study Assistant"
        >
          <span className="material-symbols-outlined">smart_toy</span>
        </button>

        {/* User Profile Avatar */}
        <div className="h-8 w-8 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden shrink-0 dark:border-outline/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
