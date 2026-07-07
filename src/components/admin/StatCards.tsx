import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MemberRow } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';

function daysSince(iso: string | null) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: LucideIcon; tone: string }) {
  return (
    <Card className="rounded-none bg-surface">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="micro-label text-outline">{label}</CardTitle>
        <span className={cn('flex h-6 w-6 items-center justify-center border', tone)}><Icon className="h-3.5 w-3.5" /></span>
      </CardHeader>
      <CardContent>
        <p className="font-display text-2xl font-bold text-on-surface">{value}</p>
        <p className="mt-1 font-code text-[10px] lowercase text-on-surface-variant">{`// ${sub}`}</p>
      </CardContent>
    </Card>
  );
}

export function StatCards({ members }: { members: MemberRow[] }) {
  const total = members.length;
  const stuck = members.filter((m) => m.isStuck).length;
  const activeWeek = members.filter((m) => daysSince(m.lastActiveAt) <= 7).length;
  const avgPct = total ? Math.round(members.reduce((sum, m) => sum + m.overallPct, 0) / total) : 0;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-outline-variant bg-outline-variant lg:grid-cols-4">
      <Stat label="total members" value={String(total)} sub="across all cohorts" icon={Users} tone="border-cyan/40 bg-cyan/10 text-cyan" />
      <Stat label="active this week" value={String(activeWeek)} sub="roadmap activity in 7d" icon={TrendingUp} tone="border-secondary/40 bg-secondary/10 text-secondary" />
      <Stat label="avg. completion" value={`${avgPct}%`} sub="mean across members" icon={Zap} tone="border-tertiary/40 bg-tertiary/10 text-tertiary" />
      <Stat label="stuck" value={String(stuck)} sub="14+ days no activity" icon={AlertTriangle} tone="border-error/40 bg-error/10 text-error" />
    </div>
  );
}
