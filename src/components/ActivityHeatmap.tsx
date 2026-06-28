'use client';

import { useUserData } from '@/hooks/useUserData';

export default function ActivityHeatmap() {
  const { heatmapData } = useUserData();

  // Generate the last 365 days (53 weeks)
  const getGridData = () => {
    const data: { date: string; count: number; dayOfWeek: number }[] = [];
    const today = new Date();
    
    // We want to start the grid on a Sunday 365 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    
    // Adjust to the previous Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const tempDate = new Date(startDate);
    
    while (tempDate <= today || data.length < 371) { // 53 weeks * 7 days = 371
      const dateString = tempDate.toISOString().split('T')[0];
      const count = heatmapData[dateString] || 0;
      
      data.push({
        date: dateString,
        count: count,
        dayOfWeek: tempDate.getDay(),
      });
      
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Group into 53 weeks
    const weeks: typeof data[] = [];
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7));
    }
    
    return weeks;
  };

  const weeks = getGridData();

  // Color mapping based on activity count
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-surface-container-high dark:bg-inverse-surface/30';
    if (count <= 2) return 'bg-secondary/20 dark:bg-secondary-fixed-dim/20 text-secondary';
    if (count <= 4) return 'bg-secondary/40 dark:bg-secondary-fixed-dim/40';
    if (count <= 7) return 'bg-secondary/70 dark:bg-secondary-fixed-dim/70';
    return 'bg-secondary dark:bg-secondary-fixed-dim'; // Max intensity
  };

  // Month labels helper
  const getMonthLabels = () => {
    const labels: { text: string; colSpan: number }[] = [];
    let currentMonth = '';
    let colCount = 0;

    weeks.forEach((week) => {
      // Look at the middle day of the week to decide month
      const midDay = new Date(week[3].date);
      const monthName = midDay.toLocaleString('default', { month: 'short' });
      
      if (monthName !== currentMonth) {
        if (currentMonth !== '') {
          labels.push({ text: currentMonth, colSpan: colCount });
        }
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
    <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm dark:bg-inverse-surface/10 dark:border-outline/25">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed-dim">calendar_today</span>
          Study Consistency
        </h3>
        <span className="text-xs text-on-surface-variant dark:text-outline-variant font-medium">
          Last 12 Months
        </span>
      </div>

      {/* Heatmap Grid Wrapper */}
      <div className="overflow-x-auto no-scrollbar pb-2">
        <div className="min-w-[620px] flex flex-col">
          {/* Month Labels Row */}
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
            {/* Day of Week Labels Column */}
            <div className="flex flex-col justify-between text-[9px] text-outline font-code pr-1 h-[76px] py-0.5 select-none">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Grid Columns (Weeks) */}
            <div className="flex-1 grid grid-flow-col auto-cols-max gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-rows-7 gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] rounded-[1.5px] transition-all duration-200 cursor-pointer ${getCellColor(
                        day.count
                      )}`}
                      title={`${day.count} activity points on ${new Date(day.date).toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-end items-center gap-1.5 mt-3 text-[10px] text-on-surface-variant dark:text-outline-variant font-code select-none">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-surface-container-high dark:bg-inverse-surface/30"></div>
        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-secondary/20 dark:bg-secondary-fixed-dim/20"></div>
        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-secondary/40 dark:bg-secondary-fixed-dim/40"></div>
        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-secondary/70 dark:bg-secondary-fixed-dim/70"></div>
        <div className="w-2.5 h-2.5 rounded-[1.5px] bg-secondary dark:bg-secondary-fixed-dim"></div>
        <span>More</span>
      </div>
    </div>
  );
}
