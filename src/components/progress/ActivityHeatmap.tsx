'use client';

import { CalendarDays } from 'lucide-react';
import { localDateKey } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ActivityDay = { date: string; count: number; isFuture: boolean };
type ActivityWeek = ActivityDay[];

function parseLocalDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function buildWeeks(activity: Record<string, number>, weekCount: number): ActivityWeek[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - ((weekCount - 1) * 7 + today.getDay()));

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start);
      date.setDate(start.getDate() + weekIndex * 7 + dayIndex);
      const key = localDateKey(date);
      return { date: key, count: activity[key] ?? 0, isFuture: date > today };
    }),
  );
}

function cellTone(count: number) {
  if (count === 0) return 'bg-surface-container-high';
  if (count === 1) return 'bg-cyan/20';
  if (count === 2) return 'bg-cyan/40';
  if (count === 3) return 'bg-cyan/65';
  return 'bg-cyan';
}

function monthLabels(weeks: ActivityWeek[]) {
  const labels: { text: string; span: number }[] = [];
  let activeMonth = '';

  weeks.forEach((week) => {
    const month = parseLocalDateKey(week[3].date).toLocaleString('default', { month: 'short' });
    const previous = labels.at(-1);
    if (month === activeMonth && previous) previous.span += 1;
    else {
      activeMonth = month;
      labels.push({ text: month, span: 1 });
    }
  });

  return labels;
}

function HeatmapGrid({ weeks }: { weeks: ActivityWeek[] }) {
  const labels = monthLabels(weeks);

  return (
    <div>
      <div className="mb-2 grid pl-7 font-code text-[10px] font-semibold text-on-surface-variant" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {labels.map((label, index) => (
          <span key={`${label.text}-${index}`} className="truncate" style={{ gridColumn: `span ${label.span}` }}>
            {label.text}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex w-5 shrink-0 flex-col justify-between py-0.5 font-code text-[10px] text-on-surface-variant" aria-hidden>
          <span>Sun</span>
          <span>Tue</span>
          <span>Thu</span>
          <span>Sat</span>
        </div>
        <div className="grid min-w-0 flex-1 grid-flow-col gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid min-w-0 grid-rows-7 gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={day.isFuture ? undefined : `${day.count} activities on ${parseLocalDateKey(day.date).toLocaleDateString()}`}
                  aria-hidden
                  className={cn(
                    'aspect-square min-w-0 border border-transparent',
                    day.isFuture ? 'bg-transparent' : cellTone(day.count),
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActivityHeatmap({ activity }: { activity: Record<string, number> }) {
  const recentWeeks = buildWeeks(activity, 16);
  const yearWeeks = buildWeeks(activity, 53);
  const activeDays = Object.values(activity).filter((count) => count > 0).length;

  return (
    <section aria-labelledby="activity-heading" className="border border-outline-variant bg-surface-card p-4 sm:p-5">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="activity-heading" className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
            <CalendarDays className="h-5 w-5 text-cyan" aria-hidden /> Learning activity
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">{activeDays} active {activeDays === 1 ? 'day' : 'days'} recorded.</p>
        </div>
        <span className="font-code text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          <span className="md:hidden">Last 16 weeks</span>
          <span className="hidden md:inline">Last 12 months</span>
        </span>
      </div>

      <div className="md:hidden">
        <HeatmapGrid weeks={recentWeeks} />
      </div>
      <div className="hidden md:block">
        <HeatmapGrid weeks={yearWeeks} />
      </div>

      <div className="mt-5 flex items-center justify-end gap-1.5 font-code text-[10px] text-on-surface-variant" aria-label="Activity intensity from less to more">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((count) => (
          <span key={count} className={cn('h-2.5 w-2.5', cellTone(count))} aria-hidden />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
