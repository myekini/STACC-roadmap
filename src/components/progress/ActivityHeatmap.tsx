'use client';

import { CalendarDays } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

/** activity: map of YYYY-MM-DD -> modules completed that day */
export default function ActivityHeatmap({ activity }: { activity: Record<string, number> }) {
  const heatmapData = activity;

  // Generate the last 365 days (53 weeks)
  const getGridData = () => {
    const data: { date: string; count: number; dayOfWeek: number }[] = [];
    const today = new Date();

    // Start on a Sunday ~365 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const tempDate = new Date(startDate);

    while (tempDate <= today || data.length < 371) {
      const dateString = tempDate.toISOString().split('T')[0];
      data.push({ date: dateString, count: heatmapData[dateString] || 0, dayOfWeek: tempDate.getDay() });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const weeks: typeof data[] = [];
    for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
    return weeks;
  };

  const weeks = getGridData();

  // Cyan = signal/focus/progress energy (design DNA)
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-surface-container-high';
    if (count === 1) return 'bg-cyan/15';
    if (count === 2) return 'bg-cyan/35';
    if (count === 3) return 'bg-cyan/60';
    return 'bg-cyan';
  };

  const getMonthLabels = () => {
    const labels: { text: string; colSpan: number }[] = [];
    let currentMonth = '';
    let colCount = 0;

    weeks.forEach((week) => {
      const midDay = new Date(week[3].date);
      const monthName = midDay.toLocaleString('default', { month: 'short' });
      if (monthName !== currentMonth) {
        if (currentMonth !== '') labels.push({ text: currentMonth, colSpan: colCount });
        currentMonth = monthName;
        colCount = 1;
      } else {
        colCount++;
      }
    });

    labels.push({ text: currentMonth, colSpan: colCount });
    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="border border-outline-variant bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-cyan" />
          Study Consistency
        </h3>
        <span className="micro-label text-outline">Last 12 Months</span>
      </div>

      {/* ScrollArea for consistent cross-browser scrollbar styling */}
      <ScrollArea className="w-full pb-2">
        <div className="min-w-[620px] flex flex-col">
          {/* Month Labels */}
          <div className="flex text-[10px] text-outline mb-1.5 font-code pl-6">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                style={{ width: `${(label.colSpan / weeks.length) * 100}%` }}
                className="truncate pr-1 text-left font-semibold"
              >
                {label.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day-of-week labels */}
            <div className="flex flex-col justify-between text-[9px] text-outline font-code pr-1 h-[76px] py-0.5 select-none">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Week columns */}
            <div className="flex-1 grid grid-flow-col auto-cols-max gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-rows-7 gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] rounded-none transition-colors duration-200 cursor-pointer ${getCellColor(day.count)}`}
                      title={`${day.count} activity on ${new Date(day.date).toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Legend */}
      <div className="flex justify-end items-center gap-1.5 mt-3 text-[10px] text-on-surface-variant font-code select-none">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-none bg-surface-container-high" />
        <div className="w-2.5 h-2.5 rounded-none bg-cyan/15" />
        <div className="w-2.5 h-2.5 rounded-none bg-cyan/35" />
        <div className="w-2.5 h-2.5 rounded-none bg-cyan/60" />
        <div className="w-2.5 h-2.5 rounded-none bg-cyan" />
        <span>More</span>
      </div>
    </div>
  );
}
