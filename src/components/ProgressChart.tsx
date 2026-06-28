'use client';

export default function ProgressChart() {
  // Weekly XP data
  const data = [
    { day: 'Mon', xp: 120, hours: 1.5 },
    { day: 'Tue', xp: 180, hours: 2.0 },
    { day: 'Wed', xp: 90,  hours: 1.0 },
    { day: 'Thu', xp: 240, hours: 3.2 },
    { day: 'Fri', xp: 190, hours: 2.5 },
    { day: 'Sat', xp: 320, hours: 4.5 },
    { day: 'Sun', xp: 210, hours: 2.8 },
  ];

  const maxXp = 400; // Cap for Y-axis scaling
  const chartHeight = 150;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate coordinates for SVG points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * graphWidth;
    // Invert Y because SVG coordinates start from top-left (0,0)
    const y = paddingTop + graphHeight - (d.xp / maxXp) * graphHeight;
    return { x, y, ...d };
  });

  // Generate path string for the line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate path string for the filled area under the line
  const areaPath = `
    ${linePath} 
    L ${points[points.length - 1].x} ${paddingTop + graphHeight} 
    L ${points[0].x} ${paddingTop + graphHeight} 
    Z
  `;

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm h-full flex flex-col dark:bg-inverse-surface/10 dark:border-outline/25">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed">insights</span>
            Weekly Performance
          </h3>
          <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-outline-variant mt-0.5">
            Daily XP gains and study hours
          </p>
        </div>
        <div className="flex gap-3 text-[10px] font-code">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-on-surface-variant dark:text-outline-variant">XP</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-secondary inline-block"></span>
            <span className="text-on-surface-variant dark:text-outline-variant">Hours</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[160px]">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradient fill under the line */}
            <linearGradient id="chartAreaGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#004ac6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Glowing line shadow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + graphHeight * ratio;
            const xpVal = Math.round(maxXp * (1 - ratio));
            return (
              <g key={i} className="opacity-40 dark:opacity-20">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={chartWidth - paddingRight} 
                  y2={y} 
                  stroke="#c3c6d7" 
                  strokeWidth="0.75" 
                  strokeDasharray="4,4"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="fill-outline dark:fill-outline-variant font-code text-[8px] font-semibold"
                >
                  {xpVal}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          <path d={areaPath} fill="url(#chartAreaGradient)" />

          {/* Glowing Line */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="#004ac6" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#glow)"
            className="dark:stroke-primary-fixed"
          />

          {/* Interactive Data Dots & Labels */}
          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              {/* Outer hover ring */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="6" 
                className="fill-primary/20 opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150 dark:fill-primary-fixed/20"
              />
              {/* Inner core dot */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="3" 
                className="fill-primary stroke-white stroke-[1.5] dark:fill-primary-fixed dark:stroke-background" 
              />
              
              {/* Tooltip value on hover */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="fill-primary font-code text-[9px] font-bold opacity-0 group-hover/dot:opacity-100 transition-opacity duration-150 pointer-events-none dark:fill-primary-fixed"
              >
                {p.xp} XP ({p.hours}h)
              </text>

              {/* X-Axis Day Labels */}
              <text 
                x={p.x} 
                y={chartHeight - 8} 
                textAnchor="middle" 
                className="fill-outline dark:fill-outline-variant font-code text-[9px] font-semibold"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
