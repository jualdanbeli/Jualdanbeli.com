import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/format";

export default function MessageDetail() {
  const { id } = useParams<{ id: string }>();
  const conversationId = parseInt(id || "0");
  const { user } = useAuth();
  
  const { data: messages, isLoading } = useGetMessages(conversationId, {
    query: { enabled: !!conversationId } as any
  });
  
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    sendMessage.mutate({
      conversationId,
      data: { content }
    }, {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(conversationId) });
      }
    });
  };

  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  return (
    <Layout>
      <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-bold text-lg">Conversation</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Send a message to start the conversation.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatDateTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!content.trim() || sendMessage.isPending}>
              {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </Layout>
  );
}
