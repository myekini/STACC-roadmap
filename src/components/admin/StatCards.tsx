import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OverviewStats } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';

function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: LucideIcon; tone: string }) {
  return (
    <Card className="rounded-none bg-surface">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="micro-label text-outline">{label}</CardTitle>
        <span className={cn('flex h-6 w-6 items-center justify-center border', tone)}><Icon className="h-3.5 w-3.5" /></span>
      </CardHeader>
      <CardContent>
        <p className="font-display text-2xl font-bold text-on-surface">{value}</p>
        <p className="mt-1 font-code text-xs lowercase text-on-surface-variant">{`// ${sub}`}</p>
      </CardContent>
    </Card>
  );
}

/** Stats are aggregated server-side (admin_overview_stats RPC) — the panel
 * never needs the full member list in the browser just to show four numbers. */
export function StatCards({ stats }: { stats: OverviewStats }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden border border-outline-variant bg-outline-variant sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="total members" value={String(stats.totalMembers)} sub="across all cohorts" icon={Users} tone="border-cyan/40 bg-cyan/10 text-cyan" />
      <Stat label="active this week" value={String(stats.activeThisWeek)} sub="roadmap activity in 7d" icon={TrendingUp} tone="border-secondary/40 bg-secondary/10 text-secondary" />
      <Stat label="avg. completion" value={`${stats.avgCompletionPct}%`} sub="mean across members" icon={Zap} tone="border-tertiary/40 bg-tertiary/10 text-tertiary" />
      <Stat label="stuck" value={String(stats.stuckCount)} sub="14+ days no activity" icon={AlertTriangle} tone="border-error/40 bg-error/10 text-error" />
    </div>
  );
}
