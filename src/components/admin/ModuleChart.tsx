'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { NodeAnalytics } from '@/hooks/useAdminData';
import type { NodeRow } from '@/lib/database.types';

const chartConfig: ChartConfig = {
  starts: { label: 'Started', color: '#00d9ff' },
  completions: { label: 'Completed', color: '#10b981' },
};

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

  return (
    <Card className="rounded-none bg-surface">
      <CardHeader>
        <CardTitle className="micro-label text-outline">most-started modules</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center font-code text-xs lowercase text-outline">{'// no module activity yet'}</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={data} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke="#2a3547" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={56}
                tick={{ fill: '#8395ac', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="starts" fill="var(--color-starts)" radius={0} />
              <Bar dataKey="completions" fill="var(--color-completions)" radius={0} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
