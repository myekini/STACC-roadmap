'use client';

import { useUserData } from '@/hooks/useUserData';
import { PATHS } from '@/config/roadmapData';
import RoadmapCanvas from '@/components/RoadmapCanvas';
import StudyAssistant from '@/components/StudyAssistant';
import Link from 'next/link';

export default function RoadmapPage() {
  const { activePath, completedNodes } = useUserData();
  const pathInfo = PATHS[activePath] || PATHS['data-engineering'];

  // Calculate completion percentage
  const totalNodesInPath = pathInfo.nodes.length;
  const completedNodesInPath = pathInfo.nodes.filter(n => completedNodes.includes(n.id)).length;
  const completionPercentage = totalNodesInPath > 0 
    ? Math.round((completedNodesInPath / totalNodesInPath) * 100)
    : 0;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] relative blueprint-grid bg-background/50 -mx-md md:-mx-xl dark:bg-background/20">
      {/* Canvas Area (Left) */}
      <div className="flex-1 relative overflow-y-auto no-scrollbar p-6 md:p-lg flex flex-col">
        
        {/* Path Header */}
        <div className="mb-8 max-w-4xl relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-xl dark:text-primary-fixed">{pathInfo.icon}</span>
                <span className="font-code text-xs text-primary font-semibold tracking-wider uppercase dark:text-primary-fixed">Learning Path</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface dark:text-on-surface">
                {pathInfo.title}
              </h1>
            </div>
            
            <Link href="/paths">
              <button className="flex items-center gap-1 text-xs text-primary font-label-md border border-primary/20 bg-surface/80 rounded-lg py-1.5 px-3 hover:bg-primary/5 transition-colors dark:text-primary-fixed dark:border-outline/30 dark:bg-inverse-surface/10">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                Change Path
              </button>
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-4 bg-surface/60 backdrop-blur-md p-3 border border-outline-variant rounded-xl dark:bg-inverse-surface/10 dark:border-outline/20">
            <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden dark:bg-inverse-surface/30">
              <div 
                className="h-full bg-secondary rounded-full relative transition-all duration-500 ease-out dark:bg-secondary-fixed-dim"
                style={{ width: `${completionPercentage}%` }}
              >
                {/* Diagonal strip pattern overlay */}
                <div 
                  className="absolute inset-0 bg-white/10" 
                  style={{ 
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)' 
                  }}
                ></div>
              </div>
            </div>
            <span className="font-label-md text-sm text-secondary font-bold shrink-0 dark:text-secondary-fixed-dim">
              {completionPercentage}% Completed
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Node Graph */}
        <RoadmapCanvas />

        {/* Bottom cushion for mobile devices */}
        <div className="h-16 md:hidden"></div>
      </div>

      {/* AI Study Assistant (Right panel, overlay on mobile, pinned on lg) */}
      <StudyAssistant />
    </div>
  );
}
