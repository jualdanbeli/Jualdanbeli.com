import { useGetConversations } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Store, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Messages() {
  const { data: conversations, isLoading } = useGetConversations();
  const { user } = useAuth();
  
  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Communicate with buyers and sellers.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : !conversations || conversations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No messages yet</h2>
          <p className="text-muted-foreground">Your conversations will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conversations.map(conv => {
            const otherParticipant = conv.participants?.find(p => p.id !== user?.id) || conv.participants?.[0];
            const isUnread = (conv.unreadCount || 0) > 0;
            
            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <Card className={`hover:border-primary transition-colors cursor-pointer ${isUnread ? 'bg-primary/5' : ''}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {otherParticipant?.avatarUrl ? (
                        <img src={otherParticipant.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : otherParticipant?.role === 'seller' ? (
                        <Store className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${isUnread ? 'text-foreground' : ''}`}>
                          {otherParticipant?.sellerInfo?.shopName || otherParticipant?.name || 'Unknown'}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(conv.updatedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {isUnread && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
