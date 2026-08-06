import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TreeView = 'canvas' | 'rail';
export type Theme = 'dark' | 'light';

interface UiState {
  /** Node whose detail sheet is open (null = closed) */
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  /** Node the floating field-notes popover describes (last hovered/focused card; not persisted) */
  focusedNodeId: string | null;
  setFocusedNodeId: (nodeId: string | null) => void;
  /** Desktop roadmap rendering: pan/zoom canvas or vertical rail (mobile is always rail) */
  treeView: TreeView;
  setTreeView: (view: TreeView) => void;
  /** Desktop sidebar: icon-only collapse, persisted across sessions */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  /** Theme: dark (default) | light */
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeNodeId: null,
      setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
      focusedNodeId: null,
      setFocusedNodeId: (focusedNodeId) => set({ focusedNodeId }),
      treeView: 'canvas',
      setTreeView: (treeView) => set({ treeView }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'stacc.ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        treeView: state.treeView,
        theme: state.theme,
      }),
    },
  ),
);
