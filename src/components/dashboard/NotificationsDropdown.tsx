import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import useSound from '@/hooks/useSound';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const NotificationsDropdown = () => {
  const { playNotification, playClick } = useSound();
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useRealtimeNotifications();

  const [prevUnreadCount, setPrevUnreadCount] = useState(0);

  // Play notification sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadCount && prevUnreadCount !== 0) {
      playNotification();
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount, playNotification]);

  const handleOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      playNotification();
    }
  };

  const handleMarkAsRead = (id: string) => {
    playClick();
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    playClick();
    markAllAsRead();
  };

  const handleDelete = (id: string) => {
    playClick();
    deleteNotification(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-accent/20 text-accent';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'meeting':
        return 'bg-primary/20 text-primary';
      case 'client':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={14} />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-3 py-2.5 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 ${getTypeColor(notification.type)}`}
                    >
                      {notification.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check size={12} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
