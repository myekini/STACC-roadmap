import { create } from 'zustand';

export type TreeView = 'canvas' | 'rail';

interface UiState {
  /** Node whose detail sheet is open (null = closed) */
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  /** Desktop roadmap rendering: pan/zoom canvas or vertical rail (mobile is always rail) */
  treeView: TreeView;
  setTreeView: (view: TreeView) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeNodeId: null,
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  treeView: 'canvas',
  setTreeView: (treeView) => set({ treeView }),
}));
