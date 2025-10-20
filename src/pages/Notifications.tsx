import { useState } from 'react';
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GhostAvatar from '@/components/GhostAvatar';
import SpeechBubble from '@/components/SpeechBubble';

interface Notification {
  id: number;
  type: 'achievement' | 'reminder' | 'milestone';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'achievement',
      title: '🔥 7-Day Streak!',
      message: 'Amazing! You\'ve maintained your learning streak for a whole week!',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'reminder',
      title: '📚 Daily Challenge Available',
      message: 'Your daily vocabulary challenge is ready. Complete it to maintain your streak!',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'milestone',
      title: '🎉 50 Words Learned!',
      message: 'Congratulations! You\'ve learned 50 new words this month.',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'reminder',
      title: '📖 Continue Reading',
      message: 'You left off at Chapter 3 of "The Little Prince". Ready to continue?',
      time: '2 days ago',
      read: true
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationGradient = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'var(--gradient-success)';
      case 'reminder':
        return 'var(--gradient-primary)';
      case 'milestone':
        return 'var(--gradient-secondary)';
      default:
        return 'var(--gradient-card)';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-secondary-light/15 to-accent-light/20"
         style={{ background: 'var(--gradient-hero)' }}>
      <div className="relative z-10 p-4 max-w-md mx-auto pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <GhostAvatar size="sm" variant="happy" className="w-8 h-8" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-white">
                {unreadCount}
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="w-5 h-5" />
          </Button>
        </header>

        {/* Intro Message */}
        <div className="mb-6 flex items-start space-x-3">
          <GhostAvatar size="md" variant="winking" floating />
          <SpeechBubble variant="default" position="left" className="flex-1">
            <p className="font-body text-sm">
              Stay updated with your learning progress! 👻
            </p>
          </SpeechBubble>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="backdrop-blur border-0" style={{ background: 'var(--gradient-card)' }}>
              <CardContent className="p-6 text-center">
                <GhostAvatar size="lg" variant="sleepy" className="mx-auto mb-4" />
                <p className="font-body text-muted-foreground">
                  No notifications yet. Keep learning! 📚
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`backdrop-blur border-0 card-hover ${!notification.read ? 'ring-2 ring-primary/50' : ''}`}
                style={{ background: getNotificationGradient(notification.type) }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-heading font-bold text-white drop-shadow">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge className="bg-white/20 text-white border-white/30 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/90 mb-2 drop-shadow">
                        {notification.message}
                      </p>
                      <p className="text-xs text-white/70">
                        {notification.time}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
