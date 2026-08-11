import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TreeView = 'canvas' | 'rail';
export type Theme = 'dark' | 'light';

interface UiState {
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
