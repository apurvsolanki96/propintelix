import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type AgentType = 'coordinator' | 'marketpulse' | 'coach';

interface UseAgentChatOptions {
  agentType: AgentType;
  onNewMessage?: (message: ChatMessage) => void;
}

export const useAgentChat = ({ agentType, onNewMessage }: UseAgentChatOptions) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const initializeChat = useCallback(async (clientId?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_chats')
        .insert({
          user_id: user.id,
          agent_id: user.id, // For now, user is their own agent
          agent_type: agentType,
          client_id: clientId || null,
        })
        .select()
        .single();

      if (error) throw error;
      setChatId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error initializing chat:', error);
      return null;
    }
  }, [user, agentType]);

  const sendMessage = useCallback(async (content: string, context?: ChatMessage[]) => {
    if (!user || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
        body: {
          agent_type: agentType,
          message: content,
          chat_id: chatId,
          context: context?.map((m) => ({ role: m.role, content: m.content })) || 
                   messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onNewMessage?.(assistantMessage);

      return assistantMessage;
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      if (error.message?.includes('429')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else if (error.message?.includes('402')) {
        toast.error('Credits required. Please add credits to continue.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }

      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
      return fallbackMessage;
    } finally {
      setIsTyping(false);
    }
  }, [user, agentType, chatId, messages, onNewMessage]);

  const evaluateSession = useCallback(async () => {
    if (!user || messages.length < 2) return null;

    try {
      const { data, error } = await supabase.functions.invoke('coach-evaluate', {
        body: {
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error evaluating session:', error);
      toast.error('Failed to evaluate session');
      return {
        tone: 7,
        objectionHandling: 7,
        factUsage: 7,
        overall: 7,
        feedback: "Session completed. Keep practicing to improve your skills.",
      };
    }
  }, [user, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setChatId(null);
  }, []);

  const setInitialMessage = useCallback((message: ChatMessage) => {
    setMessages([message]);
  }, []);

  return {
    messages,
    isTyping,
    chatId,
    sendMessage,
    initializeChat,
    evaluateSession,
    clearMessages,
    setInitialMessage,
  };
};

export default useAgentChat;
