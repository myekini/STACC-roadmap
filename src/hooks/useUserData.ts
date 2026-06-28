/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

// Define TS types
export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  xp: number;
  rank: string;
}

export interface Quest {
  id: string;
  title: string;
  xp_reward: number;
  completed: boolean;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}

// Helper to check if Supabase is active
const isSupabaseActive = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== ''
  );
};

// Default Mock Data for Local Storage Mode
const DEFAULT_PROFILE: UserProfile = {
  id: 'mock-user',
  username: 'Scholar Guest',
  avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYkuijmrEa8PzAVOpaV11h4xCY2A_NFFrRuG3zCc4_awnN-3tKkhxxNv2J9XE0RfcrPDa79lXg-03bMcE55bMQEhhz3_KuQEcAoYUBLgmTxow16seXeq_oFPHAqFyIVDG03DQ4pYuzZCxgaQPVafKxNWoNemyZedMFcTbap3sFl-tdxSTmPF4T65z81XZyG2AW25BqYnRdISpu-vcrdA5riy3MCtFFWqzDKwuxqASqmf6EvwkgLmywNjIR22szzasMJ-vynmfgLctE',
  xp: 2450,
  rank: 'Gold',
};

const DEFAULT_QUESTS: Quest[] = [
  { id: 'q1', title: 'Complete 1 node in your roadmap', xp_reward: 100, completed: false },
  { id: 'q2', title: 'Take an AI Assistant Quiz', xp_reward: 50, completed: false },
  { id: 'q3', title: 'Explore another learning path', xp_reward: 50, completed: false },
];

const DEFAULT_COMPLETED_NODES: Record<string, string[]> = {
  'data-engineering': ['foundations'],
  'data-analysis': ['foundations'],
  'data-science': ['foundations'],
  'ai-llm': ['foundations'],
  'mlops': ['foundations'],
};

const DEFAULT_HEATMAP: Record<string, number> = {
  // Populate some historical mock activity
  '2026-06-25': 2,
  '2026-06-26': 5,
  '2026-06-27': 8,
};

// Simple LocalStorage Helpers
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const setLocalStorage = <T>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Calculate Rank based on XP
const calculateRank = (xp: number): string => {
  if (xp < 500) return 'Bronze';
  if (xp < 1500) return 'Silver';
  if (xp < 3000) return 'Gold';
  if (xp < 6000) return 'Platinum';
  return 'Diamond';
};

export function useUserData() {
  const queryClient = useQueryClient();
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const active = isSupabaseActive();

  // Listen to Supabase Auth State
  useEffect(() => {
    if (!active) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    });

    return () => subscription.unsubscribe();
  }, [active, queryClient]);

  // 1. User Profile Query
  const userProfile = useQuery<UserProfile>({
    queryKey: ['userProfile', supabaseSession?.user?.id],
    queryFn: async () => {
      if (active && supabaseSession?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseSession.user.id)
          .single();

        if (error) {
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            const newProfile = {
              id: supabaseSession.user.id,
              username: supabaseSession.user.user_metadata.custom_claims?.global_name || supabaseSession.user.user_metadata.full_name || 'Scholar',
              avatar_url: supabaseSession.user.user_metadata.avatar_url || '',
              xp: 100,
              rank: 'Bronze',
            };
            await supabase.from('profiles').insert(newProfile);
            return newProfile;
          }
          throw error;
        }
        return data;
      } else {
        // Local Storage fallback
        return getLocalStorage<UserProfile>('stacc_profile', DEFAULT_PROFILE);
      }
    },
  });

  // 2. Active Path Query
  const activePath = useQuery<string | null>({
    queryKey: ['activePath', supabaseSession?.user?.id],
    queryFn: async () => {
      if (active && supabaseSession?.user) {
        const { data, error } = await supabase
          .from('user_paths')
          .select('path_id')
          .eq('user_id', supabaseSession.user.id)
          .order('selected_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        return data.length > 0 ? data[0].path_id : 'data-engineering';
      } else {
        return getLocalStorage<string | null>('stacc_active_path', 'data-engineering');
      }
    },
  });

  // 3. Completed Nodes Query
  const completedNodes = useQuery<string[]>({
    queryKey: ['completedNodes', supabaseSession?.user?.id, activePath.data],
    queryFn: async () => {
      const currentPathId = activePath.data || 'data-engineering';
      if (active && supabaseSession?.user) {
        const { data, error } = await supabase
          .from('completed_nodes')
          .select('node_id')
          .eq('user_id', supabaseSession.user.id)
          .eq('path_id', currentPathId);

        if (error) throw error;
        return data.map((d: any) => d.node_id);
      } else {
        const localCompleted = getLocalStorage<Record<string, string[]>>('stacc_completed_nodes', DEFAULT_COMPLETED_NODES);
        return localCompleted[currentPathId] || [];
      }
    },
    enabled: !!activePath.data || !active,
  });

  // 4. Quests Query
  const quests = useQuery<Quest[]>({
    queryKey: ['quests', supabaseSession?.user?.id],
    queryFn: async () => {
      if (active && supabaseSession?.user) {
        const { data, error } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_id', supabaseSession.user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // If no quests are loaded, insert default ones
        if (data.length === 0) {
          const insertedQuests = DEFAULT_QUESTS.map(q => ({
            user_id: supabaseSession.user.id,
            quest_title: q.title,
            xp_reward: q.xp_reward,
            completed: q.completed,
          }));
          const { data: freshData } = await supabase.from('user_quests').insert(insertedQuests).select();
          return (freshData || []).map((fd: any) => ({
            id: fd.id,
            title: fd.quest_title,
            xp_reward: fd.xp_reward,
            completed: fd.completed
          }));
        }
        
        return data.map((d: any) => ({
          id: d.id,
          title: d.quest_title,
          xp_reward: d.xp_reward,
          completed: d.completed
        }));
      } else {
        return getLocalStorage<Quest[]>('stacc_quests', DEFAULT_QUESTS);
      }
    },
  });

  // 5. Heatmap Query
  const heatmapData = useQuery<Record<string, number>>({
    queryKey: ['heatmapData', supabaseSession?.user?.id],
    queryFn: async () => {
      if (active && supabaseSession?.user) {
        // Query database stats or aggregated node completions
        const { data, error } = await supabase
          .from('completed_nodes')
          .select('completed_at')
          .eq('user_id', supabaseSession.user.id);

        if (error) throw error;

        const counts: Record<string, number> = {};
        data.forEach((item: any) => {
          const dateStr = new Date(item.completed_at).toISOString().split('T')[0];
          counts[dateStr] = (counts[dateStr] || 0) + 2; // Arbitrary 2 points per completed node
        });
        return counts;
      } else {
        return getLocalStorage<Record<string, number>>('stacc_heatmap', DEFAULT_HEATMAP);
      }
    },
  });

  // MUTATIONS

  // A. Select Path Mutation
  const selectPathMutation = useMutation({
    mutationFn: async (pathId: string) => {
      if (active && supabaseSession?.user) {
        const { error } = await supabase.from('user_paths').insert({
          user_id: supabaseSession.user.id,
          path_id: pathId,
        });
        if (error) throw error;
      } else {
        setLocalStorage('stacc_active_path', pathId);
      }
      return pathId;
    },
    onSuccess: (pathId) => {
      queryClient.setQueryData(['activePath', supabaseSession?.user?.id], pathId);
      queryClient.invalidateQueries({ queryKey: ['completedNodes'] });
    },
  });

  // B. Complete Node Mutation
  const completeNodeMutation = useMutation({
    mutationFn: async ({ nodeId, xpReward }: { nodeId: string; xpReward: number }) => {
      const currentPathId = activePath.data || 'data-engineering';
      
      // Update local storage or DB
      if (active && supabaseSession?.user) {
        // Insert into completed_nodes
        const { error: nodeError } = await supabase.from('completed_nodes').insert({
          user_id: supabaseSession.user.id,
          path_id: currentPathId,
          node_id: nodeId,
        });
        if (nodeError) throw nodeError;

        // Update profile XP
        const currentXp = userProfile.data?.xp || 0;
        const newXp = currentXp + xpReward;
        const newRank = calculateRank(newXp);
        
        await supabase
          .from('profiles')
          .update({ xp: newXp, rank: newRank })
          .eq('id', supabaseSession.user.id);
      } else {
        // Local completed nodes
        const localCompleted = getLocalStorage<Record<string, string[]>>('stacc_completed_nodes', DEFAULT_COMPLETED_NODES);
        const pathNodes = localCompleted[currentPathId] || [];
        if (!pathNodes.includes(nodeId)) {
          localCompleted[currentPathId] = [...pathNodes, nodeId];
          setLocalStorage('stacc_completed_nodes', localCompleted);
        }

        // Local profile XP
        const profile = userProfile.data || DEFAULT_PROFILE;
        const newXp = profile.xp + xpReward;
        const updatedProfile = {
          ...profile,
          xp: newXp,
          rank: calculateRank(newXp),
        };
        setLocalStorage('stacc_profile', updatedProfile);

        // Local heatmap
        const localHeatmap = getLocalStorage<Record<string, number>>('stacc_heatmap', DEFAULT_HEATMAP);
        const todayStr = new Date().toISOString().split('T')[0];
        localHeatmap[todayStr] = (localHeatmap[todayStr] || 0) + 3; // add activity points
        setLocalStorage('stacc_heatmap', localHeatmap);
      }
      return { nodeId, xpReward };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedNodes'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['heatmapData'] });
    },
  });

  // C. Toggle Quest Mutation
  const toggleQuestMutation = useMutation({
    mutationFn: async ({ questId, completed }: { questId: string; completed: boolean }) => {
      const targetQuest = quests.data?.find(q => q.id === questId);
      if (!targetQuest) return;

      const xpChange = completed ? targetQuest.xp_reward : -targetQuest.xp_reward;

      if (active && supabaseSession?.user) {
        // Update quest
        await supabase
          .from('user_quests')
          .update({ completed })
          .eq('id', questId);

        // Update profile XP
        const currentXp = userProfile.data?.xp || 0;
        const newXp = Math.max(0, currentXp + xpChange);
        const newRank = calculateRank(newXp);

        await supabase
          .from('profiles')
          .update({ xp: newXp, rank: newRank })
          .eq('id', supabaseSession.user.id);
      } else {
        // Local quests
        const localQuests = quests.data || DEFAULT_QUESTS;
        const updatedQuests = localQuests.map(q => q.id === questId ? { ...q, completed } : q);
        setLocalStorage('stacc_quests', updatedQuests);

        // Local profile
        const profile = userProfile.data || DEFAULT_PROFILE;
        const newXp = Math.max(0, profile.xp + xpChange);
        const updatedProfile = {
          ...profile,
          xp: newXp,
          rank: calculateRank(newXp),
        };
        setLocalStorage('stacc_profile', updatedProfile);

        // Local heatmap
        if (completed) {
          const localHeatmap = getLocalStorage<Record<string, number>>('stacc_heatmap', DEFAULT_HEATMAP);
          const todayStr = new Date().toISOString().split('T')[0];
          localHeatmap[todayStr] = (localHeatmap[todayStr] || 0) + 1;
          setLocalStorage('stacc_heatmap', localHeatmap);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['heatmapData'] });
    },
  });

  // D. Auth Actions
  const signInWithDiscord = async () => {
    if (!active) {
      alert('Supabase is not configured yet. Sign-in is simulated in Local Storage mode!');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error('Error signing in:', error.message);
  };

  const signOut = async () => {
    if (active) {
      await supabase.auth.signOut();
    }
    setSupabaseSession(null);
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  return {
    isSupabaseConnected: active,
    isAuthenticated: !!supabaseSession,
    user: userProfile.data || DEFAULT_PROFILE,
    isLoading: userProfile.isLoading || activePath.isLoading || completedNodes.isLoading || quests.isLoading,
    activePath: activePath.data || 'data-engineering',
    completedNodes: completedNodes.data || [],
    quests: quests.data || [],
    heatmapData: heatmapData.data || {},
    selectPath: selectPathMutation.mutate,
    completeNode: completeNodeMutation.mutateAsync,
    toggleQuest: toggleQuestMutation.mutate,
    signInWithDiscord,
    signOut,
  };
}
