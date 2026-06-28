import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  code?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface UiState {
  theme: 'light' | 'dark';
  currentPath: string | null;
  activeNodeId: string | null;
  isAssistantOpen: boolean;
  chatMessages: Record<string, ChatMessage[]>; // Map of nodeId -> messages
  activeQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    answeredIndex: number | null;
  } | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentPath: (path: string | null) => void;
  setActiveNodeId: (nodeId: string | null) => void;
  setAssistantOpen: (open: boolean) => void;
  addChatMessage: (nodeId: string, message: Omit<ChatMessage, 'id'>) => void;
  clearChatMessages: (nodeId: string) => void;
  setActiveQuiz: (quiz: UiState['activeQuiz']) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  currentPath: null,
  activeNodeId: null,
  isAssistantOpen: false,
  chatMessages: {},
  activeQuiz: null,

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  },
  
  setCurrentPath: (currentPath) => set({ currentPath }),
  
  setActiveNodeId: (activeNodeId) => set({ activeNodeId, activeQuiz: null }),
  
  setAssistantOpen: (isAssistantOpen) => set({ isAssistantOpen }),
  
  addChatMessage: (nodeId, message) =>
    set((state) => {
      const nodeMessages = state.chatMessages[nodeId] || [];
      const newMessage: ChatMessage = {
        ...message,
        id: Math.random().toString(36).substring(7),
      };
      return {
        chatMessages: {
          ...state.chatMessages,
          [nodeId]: [...nodeMessages, newMessage],
        },
      };
    }),
    
  clearChatMessages: (nodeId) =>
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [nodeId]: [],
      },
    })),
    
  setActiveQuiz: (activeQuiz) => set({ activeQuiz }),
}));
