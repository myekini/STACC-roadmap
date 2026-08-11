import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NodeAnalytics } from '@/hooks/useAdminData';
import type { NodeRow } from '@/lib/database.types';

export function ModuleChart({ analytics, nodeById }: { analytics: NodeAnalytics[]; nodeById: Record<string, NodeRow> }) {
  const data = analytics
    .filter((a) => a.starts > 0)
    .sort((a, b) => b.starts - a.starts)
    .slice(0, 8)
    .map((a) => ({
      name: nodeById[a.nodeId]?.name ?? a.nodeId,
      starts: a.starts,
      completions: a.completions,
    }));
  const maxStarts = Math.max(1, ...data.map((item) => item.starts));

  return (
    <Card className="rounded-none bg-surface">
      <CardHeader>
        <CardTitle className="micro-label text-outline">most-started modules</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center font-code text-xs lowercase text-outline">{'// no module activity yet'}</p>
        ) : (
          <ol className="space-y-4" aria-label="Most-started modules">
            {data.map((item) => (
              <li key={item.name}>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="min-w-0 truncate font-medium text-on-surface">{item.name}</span>
                  <span className="shrink-0 text-on-surface-variant">{item.completions}/{item.starts} completed</span>
                </div>
                <div className="relative mt-2 h-2 overflow-hidden bg-surface-container-high" title={`${item.starts} started; ${item.completions} completed`}>
                  <div className="absolute inset-y-0 left-0 bg-cyan/35" style={{ width: `${(item.starts / maxStarts) * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-secondary" style={{ width: `${(item.completions / maxStarts) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
