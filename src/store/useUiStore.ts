import { create } from 'zustand';

interface UiState {
  /** Node whose detail sheet is open (null = closed) */
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeNodeId: null,
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
}));
