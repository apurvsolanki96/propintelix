import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface AgentChat {
  id: string;
  userId: string;
  agentId: string;
  clientId: string | null;
  agentType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  clientName?: string;
  messageCount?: number;
}

interface HandoffRequest {
  id: string;
  chatId: string;
  fromAgentId: string;
  toAgentId: string;
  reason: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
}

export const useAgentHandoff = () => {
  const { user } = useAuth();
  const [availableChats, setAvailableChats] = useState<AgentChat[]>([]);
  const [pendingHandoffs, setPendingHandoffs] = useState<HandoffRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available chats that can be taken over
  const fetchAvailableChats = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_chats')
        .select(`
          *,
          companies:client_id (name)
        `)
        .neq('agent_id', user.id)
        .eq('status', 'pending_handoff')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const chats = data.map((chat) => ({
        id: chat.id,
        userId: chat.user_id,
        agentId: chat.agent_id,
        clientId: chat.client_id,
        agentType: chat.agent_type,
        status: chat.status,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
        clientName: (chat.companies as any)?.name || 'Unknown Client',
      }));

      setAvailableChats(chats);
    } catch (error) {
      console.error('Error fetching available chats:', error);
    }
  }, [user]);

  // Fetch pending handoff requests
  const fetchPendingHandoffs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_handoffs')
        .select('*')
        .or(`from_agent_id.eq.${user.id},to_agent_id.eq.${user.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingHandoffs(
        data.map((h) => ({
          id: h.id,
          chatId: h.chat_id,
          fromAgentId: h.from_agent_id,
          toAgentId: h.to_agent_id,
          reason: h.reason,
          status: h.status,
          createdAt: new Date(h.created_at),
          completedAt: h.completed_at ? new Date(h.completed_at) : null,
        }))
      );
    } catch (error) {
      console.error('Error fetching handoffs:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAvailableChats();
    fetchPendingHandoffs();
  }, [fetchAvailableChats, fetchPendingHandoffs]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('agent_handoff_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_chats',
        },
        () => {
          fetchAvailableChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_handoffs',
        },
        () => {
          fetchPendingHandoffs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAvailableChats, fetchPendingHandoffs]);

  // Request handoff (when agent goes on leave)
  const requestHandoff = useCallback(async (chatId: string, reason: string) => {
    if (!user) return false;

    try {
      // Update chat status to pending handoff
      const { error: chatError } = await supabase
        .from('agent_chats')
        .update({ status: 'pending_handoff' })
        .eq('id', chatId)
        .eq('agent_id', user.id);

      if (chatError) throw chatError;

      // Create handoff request (to_agent_id is null until someone accepts)
      const { error: handoffError } = await supabase
        .from('agent_handoffs')
        .insert({
          chat_id: chatId,
          from_agent_id: user.id,
          to_agent_id: user.id, // Will be updated when accepted
          reason,
          status: 'pending',
        });

      if (handoffError) throw handoffError;

      toast.success('Handoff request created successfully');
      return true;
    } catch (error) {
      console.error('Error requesting handoff:', error);
      toast.error('Failed to create handoff request');
      return false;
    }
  }, [user]);

  // Accept handoff
  const acceptHandoff = useCallback(async (chatId: string, handoffId: string) => {
    if (!user) return false;

    try {
      // Update chat with new agent
      const { error: chatError } = await supabase
        .from('agent_chats')
        .update({ 
          agent_id: user.id,
          status: 'active',
        })
        .eq('id', chatId);

      if (chatError) throw chatError;

      // Update handoff status
      const { error: handoffError } = await supabase
        .from('agent_handoffs')
        .update({
          to_agent_id: user.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', handoffId);

      if (handoffError) throw handoffError;

      toast.success('Chat handoff accepted successfully');
      fetchAvailableChats();
      fetchPendingHandoffs();
      return true;
    } catch (error) {
      console.error('Error accepting handoff:', error);
      toast.error('Failed to accept handoff');
      return false;
    }
  }, [user, fetchAvailableChats, fetchPendingHandoffs]);

  // Get chat history for handoff review
  const getChatHistory = useCallback(async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at),
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }, []);

  return {
    availableChats,
    pendingHandoffs,
    loading,
    requestHandoff,
    acceptHandoff,
    getChatHistory,
    refreshChats: fetchAvailableChats,
  };
};

export default useAgentHandoff;
