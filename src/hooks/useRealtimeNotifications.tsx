import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'meeting' | 'client';
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        setNotifications(
          data.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as Notification['type'],
            read: n.read,
            createdAt: new Date(n.created_at),
            metadata: n.metadata as Record<string, any> || {},
          }))
        );
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type as Notification['type'],
            read: payload.new.read,
            createdAt: new Date(payload.new.created_at),
            metadata: payload.new.metadata || {},
          };

          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast(newNotification.title, {
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [user]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }, [user]);

  const createNotification = useCallback(async (
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    const { error } = await supabase.from('notifications').insert({
      user_id: user.id,
      title,
      message,
      type,
      metadata: metadata || {},
    });

    if (error) {
      console.error('Error creating notification:', error);
    }
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
};

export default useRealtimeNotifications;
