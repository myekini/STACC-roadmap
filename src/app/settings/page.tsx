'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Copy,
  ExternalLink,
  Flame,
  Hourglass,
  LogOut,
  Pencil,
  Route,
  Shield,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function MemberSettingsPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const userData = useUserData();
  const {
    user,
    streak,
    progress,
    nodes,
    paths,
    activePath,
    renameUsername,
    signOut,
    isSupabaseConnected,
  } = userData;

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const completedCount = Object.keys(progress.completedNodes).length;
  const hoursInvested = nodes
    .filter((n) => progress.completedNodes[n.id])
    .reduce((sum, n) => sum + n.est_hours, 0);

  const activePathInfo = paths.find((p) => p.id === activePath);
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${encodeURIComponent(user.username)}` : `/u/${user.username}`;

  const handleSaveUsername = async () => {
    if (newUsername.trim() === user.username) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      await renameUsername(newUsername.trim());
      setEditing(false);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to update username');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="space-y-8 py-8 md:py-12">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-on-surface sm:text-4xl">
          Your Member Settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Manage your account identity, inspect your learning activity, and access your public portfolio.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main 2-column info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Identity Card */}
          <section className="border border-outline-variant bg-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
              <User className="h-5 w-5 text-cyan" />
              Member Identity
            </h2>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 rounded-none border-2 border-cyan/40 shrink-0">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                <AvatarFallback className="rounded-none bg-surface-container-high font-display text-2xl font-bold text-cyan">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-3">
                {!editing ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-2xl font-bold text-on-surface">{user.username}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewUsername(user.username);
                        setErrorMsg(null);
                        setEditing(true);
                      }}
                      className="h-7 gap-1 px-2 font-code text-xs text-on-surface-variant hover:text-cyan"
                    >
                      <Pencil className="h-3 w-3" /> Edit handle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        disabled={busy}
                        className="h-9 w-48 border border-cyan bg-surface px-2.5 font-code text-sm text-on-surface focus:outline-none"
                        placeholder="new-handle"
                      />
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={handleSaveUsername}
                        size="sm"
                        className="h-9 gap-1 bg-cyan text-navy font-semibold hover:bg-cyan/90"
                      >
                        <Check className="h-4 w-4" /> Save
                      </Button>
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditing(false)}
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {errorMsg && <p className="font-code text-xs text-error">{errorMsg}</p>}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1 font-code text-xs">
                  <Badge variant="outline" className="border-cyan/40 bg-cyan/10 text-cyan">
                    <UserCheck className="h-3 w-3 mr-1" /> {user.role === 'admin' ? 'Admin' : 'Scholar'}
                  </Badge>
                  <span className="text-on-surface-variant">
                    {isSupabaseConnected ? 'Cloud Authenticated' : 'Local Demo Mode'}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-outline-variant/60 my-6" />

            <div className="space-y-2">
              <label className="micro-label text-outline">Public Portfolio Link</label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[220px] border border-outline-variant bg-surface-container-low px-3 py-2 font-code text-xs text-on-surface truncate">
                  {publicUrl}
                </div>
                <Button type="button" variant="outline" onClick={handleCopyLink} className="gap-1.5 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button asChild variant="default" className="gap-1.5 text-xs">
                  <Link href={`/u/${encodeURIComponent(user.username)}`} target="_blank">
                    View <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Activity & Signals Card (DataCamp Inspired) */}
          <section className="border border-outline-variant bg-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
              <Flame className="h-5 w-5 text-tertiary" />
              Learning Activity Signals
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="border border-tertiary/30 bg-tertiary/[0.05] p-4 text-center">
                <div className="flex justify-center">
                  <Flame className="h-6 w-6 text-tertiary fill-tertiary" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-on-surface">{streak} days</p>
                <p className="micro-label mt-1 text-outline">Daily Streak</p>
              </div>

              <div className="border border-secondary/30 bg-secondary/[0.05] p-4 text-center">
                <div className="flex justify-center">
                  <CircleCheck className="h-6 w-6 text-secondary" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-on-surface">{completedCount}</p>
                <p className="micro-label mt-1 text-outline">Modules Shipped</p>
              </div>

              <div className="border border-cyan/30 bg-cyan/[0.05] p-4 text-center col-span-2 sm:col-span-1">
                <div className="flex justify-center">
                  <Hourglass className="h-6 w-6 text-cyan" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-on-surface">{hoursInvested}h</p>
                <p className="micro-label mt-1 text-outline">Hours Invested</p>
              </div>
            </div>

            <div className="mt-6 border border-outline-variant/60 bg-surface-container-low p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="micro-label text-outline">Active Track</p>
                  <p className="mt-1 font-display text-base font-semibold text-on-surface">
                    {activePathInfo?.title ?? 'Foundations'}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                  <Link href="/paths">
                    <Route className="h-3.5 w-3.5" /> Switch path
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar 1-column card */}
        <div className="space-y-6">
          <section className="border border-cyan/30 bg-gradient-to-br from-cyan/[0.08] to-transparent p-6">
            <h3 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-cyan" />
              Public Portfolio Page
            </h3>
            <p className="mt-2 text-xs leading-5 text-on-surface-variant">
              Every completed module and shipped project evidence URL is automatically showcased on your public portfolio page. Share it with recruiters or peers.
            </p>
            <Button asChild className="mt-5 w-full gap-2">
              <Link href={`/u/${encodeURIComponent(user.username)}`}>
                Open Public Portfolio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          <section className="border border-outline-variant bg-surface p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
              <Shield className="h-4 w-4 text-outline" />
              Account & Session
            </h3>
            <p className="text-xs leading-5 text-on-surface-variant">
              Sign out of your session on this device or return to your active roadmap.
            </p>
            <div className="space-y-2 pt-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link href="/roadmap">
                  <Route className="h-4 w-4 text-cyan" /> Go to Roadmap
                </Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleSignOut}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
