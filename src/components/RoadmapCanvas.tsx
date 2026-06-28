'use client';

import { useEffect, useRef, useState } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { useUserData } from '@/hooks/useUserData';
import { PATHS, RoadmapNode } from '@/config/roadmapData';

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export default function RoadmapCanvas() {
  const { activePath, completedNodes } = useUserData();
  const { activeNodeId, setActiveNodeId, setAssistantOpen } = useUiStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  
  const pathInfo = PATHS[activePath] || PATHS['data-engineering'];

  // Calculate coordinates of all nodes relative to the container
  const updatePositions = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const newPositions: Record<string, NodePosition> = {};
    
    Object.keys(nodeRefs.current).forEach((nodeId) => {
      const nodeEl = nodeRefs.current[nodeId];
      if (nodeEl) {
        const nodeRect = nodeEl.getBoundingClientRect();
        newPositions[nodeId] = {
          id: nodeId,
          // Calculate center point of the node relative to container
          x: nodeRect.left - containerRect.left + nodeRect.width / 2,
          y: nodeRect.top - containerRect.top + nodeRect.height / 2,
        };
      }
    });
    
    setPositions(newPositions);
  };

  // Recalculate on mount, path change, or resize
  useEffect(() => {
    updatePositions();
    
    window.addEventListener('resize', updatePositions);
    
    // Create a ResizeObserver to catch layout shifts
    const observer = new ResizeObserver(() => {
      updatePositions();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
    };
  }, [activePath, pathInfo]);

  // Determine node status
  const getNodeStatus = (nodeId: string, node: RoadmapNode) => {
    if (completedNodes.includes(nodeId)) {
      return 'completed';
    }
    
    // A node is unlocked if all its prerequisites are completed
    const allPrereqsMet = node.prerequisites.every((prereq) =>
      completedNodes.includes(prereq)
    );
    
    if (allPrereqsMet) {
      return 'unlocked';
    }
    
    return 'locked';
  };

  const handleNodeClick = (nodeId: string, status: 'completed' | 'unlocked' | 'locked') => {
    if (status === 'locked') return; // Cannot focus locked nodes
    setActiveNodeId(nodeId);
    setAssistantOpen(true);
  };

  // Helper to generate bezier curve path between two points
  const getBezierPath = (fromId: string, toId: string) => {
    const from = positions[fromId];
    const to = positions[toId];
    if (!from || !to) return '';

    // Draw a smooth S-curve (horizontal flow)
    const dx = to.x - from.x;
    const controlX1 = from.x + dx * 0.4;
    const controlX2 = from.x + dx * 0.6;
    
    return `M ${from.x} ${from.y} C ${controlX1} ${from.y}, ${controlX2} ${to.y}, ${to.x} ${to.y}`;
  };

  // Layout nodes in columns based on their column level
  // Foundations (no prereqs) -> Column 1
  // Nodes with 1 prereq -> Column 2
  // Nodes with 2+ prereqs or dependent on Column 2 -> Column 3
  const getColumns = () => {
    const col1: RoadmapNode[] = [];
    const col2: RoadmapNode[] = [];
    const col3: RoadmapNode[] = [];

    pathInfo.nodes.forEach((node) => {
      if (node.prerequisites.length === 0) {
        col1.push(node);
      } else if (node.prerequisites.length === 1 && node.prerequisites[0] === 'foundations') {
        col2.push(node);
      } else {
        col3.push(node);
      }
    });

    return [col1, col2, col3];
  };

  const [column1, column2, column3] = getColumns();

  return (
    <div 
      ref={containerRef} 
      className="relative flex-1 min-h-[550px] w-full max-w-5xl mx-auto flex flex-col md:flex-row items-stretch justify-between py-8 px-4"
    >
      {/* SVG Connections Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="activeGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#006c49" />
            <stop offset="100%" stopColor="#004ac6" />
          </linearGradient>
          <linearGradient id="completedGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#4edea3" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {/* Draw connection lines */}
        {positions && pathInfo.connections.map((conn, index) => {
          const fromStatus = completedNodes.includes(conn.from);
          const toStatus = completedNodes.includes(conn.to);
          const pathD = getBezierPath(conn.from, conn.to);

          if (!pathD) return null;

          let strokeColor = '#c3c6d7'; // default locked
          let strokeDash = '6,6';
          let strokeWidth = 2;
          let isAnimated = false;

          if (fromStatus && toStatus) {
            // Completed path
            strokeColor = 'url(#completedGradient)';
            strokeDash = '0';
            strokeWidth = 3.5;
            isAnimated = true;
          } else if (fromStatus) {
            // Active focus path
            strokeColor = 'url(#activeGradient)';
            strokeDash = '0';
            strokeWidth = 3;
            isAnimated = true;
          }

          return (
            <path
              key={`${conn.from}-${conn.to}-${index}`}
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
              className={isAnimated ? 'path-draw' : ''}
            />
          );
        })}
      </svg>

      {/* Column 1: Foundations */}
      <div className="flex-1 flex flex-col justify-center items-center gap-16 z-10 py-8">
        {column1.map((node) => {
          const status = getNodeStatus(node.id, node);
          const isActive = activeNodeId === node.id;
          
          return (
            <div
              key={node.id}
              ref={(el) => { nodeRefs.current[node.id] = el; }}
              onClick={() => handleNodeClick(node.id, status)}
              className={`group relative cursor-pointer select-none transition-all duration-300 ${
                status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
              }`}
            >
              {/* Card Node */}
              <div
                className={`w-20 h-20 rounded-2xl bg-surface border flex items-center justify-center shadow-md relative z-10 overflow-hidden dark:bg-background ${
                  isActive
                    ? 'border-primary ring-2 ring-primary/20 dark:border-primary-fixed'
                    : status === 'completed'
                    ? 'border-secondary dark:border-secondary-fixed-dim'
                    : 'border-outline-variant dark:border-outline/40'
                } ${status === 'unlocked' && !isActive ? 'node-active' : ''}`}
              >
                {/* Visual backdrop color */}
                <div
                  className={`absolute inset-0 opacity-10 ${
                    status === 'completed'
                      ? 'bg-secondary'
                      : isActive
                      ? 'bg-primary'
                      : 'bg-transparent'
                  }`}
                ></div>

                {/* Status bottom bar */}
                <div
                  className={`absolute bottom-0 left-0 h-1.5 w-full ${
                    status === 'completed'
                      ? 'bg-secondary dark:bg-secondary-fixed-dim'
                      : isActive
                      ? 'bg-primary dark:bg-primary-fixed'
                      : 'bg-outline-variant dark:bg-outline/30'
                  }`}
                ></div>

                <span
                  className={`material-symbols-outlined text-3xl ${
                    status === 'completed'
                      ? 'text-secondary icon-fill dark:text-secondary-fixed-dim'
                      : isActive
                      ? 'text-primary dark:text-primary-fixed'
                      : 'text-on-surface-variant dark:text-outline-variant'
                  }`}
                >
                  {node.icon}
                </span>
              </div>

              {/* Status Badge Overlay */}
              <div
                className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-20 border-2 border-surface dark:border-background text-xs ${
                  status === 'completed'
                    ? 'bg-secondary text-on-secondary'
                    : status === 'locked'
                    ? 'bg-surface-variant text-outline dark:bg-inverse-surface dark:text-outline-variant'
                    : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm font-bold">
                  {status === 'completed' ? 'check' : status === 'locked' ? 'lock' : 'play_arrow'}
                </span>
              </div>

              {/* Title Labels */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center w-36">
                <h3
                  className={`font-label-md text-sm ${
                    isActive
                      ? 'text-primary font-bold dark:text-primary-fixed'
                      : 'text-on-surface dark:text-on-surface'
                  }`}
                >
                  {node.title}
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-outline-variant mt-0.5">
                  {node.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Column 2: Branches */}
      <div className="flex-1 flex flex-col justify-around items-center gap-16 z-10 py-8">
        {column2.map((node) => {
          const status = getNodeStatus(node.id, node);
          const isActive = activeNodeId === node.id;
          
          return (
            <div
              key={node.id}
              ref={(el) => { nodeRefs.current[node.id] = el; }}
              onClick={() => handleNodeClick(node.id, status)}
              className={`group relative cursor-pointer select-none transition-all duration-300 ${
                status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
              }`}
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-surface border flex items-center justify-center shadow-md relative z-10 overflow-hidden dark:bg-background ${
                  isActive
                    ? 'border-primary ring-2 ring-primary/20 dark:border-primary-fixed'
                    : status === 'completed'
                    ? 'border-secondary dark:border-secondary-fixed-dim'
                    : 'border-outline-variant dark:border-outline/40'
                } ${status === 'unlocked' && !isActive ? 'node-active' : ''}`}
              >
                <div
                  className={`absolute inset-0 opacity-10 ${
                    status === 'completed'
                      ? 'bg-secondary'
                      : isActive
                      ? 'bg-primary'
                      : 'bg-transparent'
                  }`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 h-1.5 w-full ${
                    status === 'completed'
                      ? 'bg-secondary dark:bg-secondary-fixed-dim'
                      : isActive
                      ? 'bg-primary dark:bg-primary-fixed'
                      : 'bg-outline-variant dark:bg-outline/30'
                  }`}
                ></div>
                <span
                  className={`material-symbols-outlined text-3xl ${
                    status === 'completed'
                      ? 'text-secondary icon-fill dark:text-secondary-fixed-dim'
                      : isActive
                      ? 'text-primary dark:text-primary-fixed'
                      : 'text-on-surface-variant dark:text-outline-variant'
                  }`}
                >
                  {node.icon}
                </span>
              </div>

              <div
                className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-20 border-2 border-surface dark:border-background text-xs ${
                  status === 'completed'
                    ? 'bg-secondary text-on-secondary'
                    : status === 'locked'
                    ? 'bg-surface-variant text-outline dark:bg-inverse-surface dark:text-outline-variant'
                    : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm font-bold">
                  {status === 'completed' ? 'check' : status === 'locked' ? 'lock' : 'play_arrow'}
                </span>
              </div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center w-36">
                <h3
                  className={`font-label-md text-sm ${
                    isActive
                      ? 'text-primary font-bold dark:text-primary-fixed'
                      : 'text-on-surface dark:text-on-surface'
                  }`}
                >
                  {node.title}
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-outline-variant mt-0.5">
                  {status === 'locked' ? `Requires: ${node.prerequisites.join(', ')}` : node.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Column 3: Advanced */}
      <div className="flex-1 flex flex-col justify-center items-center gap-16 z-10 py-8">
        {column3.map((node) => {
          const status = getNodeStatus(node.id, node);
          const isActive = activeNodeId === node.id;
          
          return (
            <div
              key={node.id}
              ref={(el) => { nodeRefs.current[node.id] = el; }}
              onClick={() => handleNodeClick(node.id, status)}
              className={`group relative cursor-pointer select-none transition-all duration-300 ${
                status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'
              }`}
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-surface border flex items-center justify-center shadow-md relative z-10 overflow-hidden dark:bg-background ${
                  isActive
                    ? 'border-primary ring-2 ring-primary/20 dark:border-primary-fixed'
                    : status === 'completed'
                    ? 'border-secondary dark:border-secondary-fixed-dim'
                    : 'border-outline-variant dark:border-outline/40'
                } ${status === 'unlocked' && !isActive ? 'node-active' : ''}`}
              >
                <div
                  className={`absolute inset-0 opacity-10 ${
                    status === 'completed'
                      ? 'bg-secondary'
                      : isActive
                      ? 'bg-primary'
                      : 'bg-transparent'
                  }`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 h-1.5 w-full ${
                    status === 'completed'
                      ? 'bg-secondary dark:bg-secondary-fixed-dim'
                      : isActive
                      ? 'bg-primary dark:bg-primary-fixed'
                      : 'bg-outline-variant dark:bg-outline/30'
                  }`}
                ></div>
                <span
                  className={`material-symbols-outlined text-3xl ${
                    status === 'completed'
                      ? 'text-secondary icon-fill dark:text-secondary-fixed-dim'
                      : isActive
                      ? 'text-primary dark:text-primary-fixed'
                      : 'text-on-surface-variant dark:text-outline-variant'
                  }`}
                >
                  {node.icon}
                </span>
              </div>

              <div
                className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-20 border-2 border-surface dark:border-background text-xs ${
                  status === 'completed'
                    ? 'bg-secondary text-on-secondary'
                    : status === 'locked'
                    ? 'bg-surface-variant text-outline dark:bg-inverse-surface dark:text-outline-variant'
                    : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm font-bold">
                  {status === 'completed' ? 'check' : status === 'locked' ? 'lock' : 'play_arrow'}
                </span>
              </div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center w-36">
                <h3
                  className={`font-label-md text-sm ${
                    isActive
                      ? 'text-primary font-bold dark:text-primary-fixed'
                      : 'text-on-surface dark:text-on-surface'
                  }`}
                >
                  {node.title}
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-outline-variant mt-0.5">
                  {status === 'locked' ? 'Locked' : node.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
