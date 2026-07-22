import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ShoppingBag, MessageSquare, AlertTriangle, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const { data: notifications, isLoading } = useGetNotifications();
  const { user } = useAuth();
  
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    });
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ notificationId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_update': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-primary" />;
      case 'dispute': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No notifications</h2>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <Card 
              key={notif.id} 
              className={`transition-colors ${notif.isRead ? 'opacity-70' : 'border-primary/50 bg-primary/5'}`}
            >
              <CardContent className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.body}</p>
                </div>
                {!notif.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notif.id)} className="h-8">
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
