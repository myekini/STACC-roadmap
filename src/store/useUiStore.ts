import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TreeView = 'canvas' | 'rail';

interface UiState {
  /** Node whose detail sheet is open (null = closed) */
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  /** Desktop roadmap rendering: pan/zoom canvas or vertical rail (mobile is always rail) */
  treeView: TreeView;
  setTreeView: (view: TreeView) => void;
  /** Desktop sidebar: icon-only collapse, persisted across sessions */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeNodeId: null,
      setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
      treeView: 'canvas',
      setTreeView: (treeView) => set({ treeView }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'stacc.ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, treeView: state.treeView }),
    },
  ),
);
