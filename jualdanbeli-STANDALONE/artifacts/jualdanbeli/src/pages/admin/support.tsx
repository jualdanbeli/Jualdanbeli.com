import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, HeadphonesIcon, User, ShieldCheck, MessageSquare } from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { formatDateTime } from "@/lib/format";

const API_BASE = "/api";

interface SupportConv {
  id: number;
  user: { id: number; name: string; role: string; avatarUrl: string | null } | null;
  lastMessage: string | null;
  unreadCount: number;
  updatedAt: string;
}

function useSupportConversations(token: string) {
  return useQuery<SupportConv[]>({
    queryKey: ["support-conversations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/support/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil daftar percakapan support");
      return res.json();
    },
    refetchInterval: 4000,
  });
}

export default function AdminSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("token") || "";
  const { data: convs, isLoading } = useSupportConversations(token);

  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<SupportConv["user"] | null>(null);
  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: msgsLoading } = useGetMessages(selectedConvId ?? 0, {
    query: { enabled: !!selectedConvId, refetchInterval: 3000 } as any,
  });

  const sendMessage = useSendMessage();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (conv: SupportConv) => {
    setSelectedConvId(conv.id);
    setSelectedUser(conv.user);
    queryClient.invalidateQueries({ queryKey: ["support-conversations"] });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedConvId) return;
    sendMessage.mutate({ conversationId: selectedConvId, data: { content } }, {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedConvId) });
        queryClient.invalidateQueries({ queryKey: ["support-conversations"] });
      },
      onError: () => {
        toast({ title: "Gagal mengirim pesan", variant: "destructive" });
      },
    });
  };

  const totalUnread = convs?.reduce((s, c) => s + (c.unreadCount || 0), 0) ?? 0;

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeadphonesIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Inbox CS / Pengaduan</h1>
          {totalUnread > 0 && (
            <Badge variant="destructive">{totalUnread} belum dibaca</Badge>
          )}
        </div>
        <Badge className="bg-green-500 text-white">Auto-refresh 4 detik</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
        {/* Sidebar: list of conversations */}
        <div className="border rounded-xl overflow-hidden bg-white flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <p className="text-sm font-semibold text-muted-foreground">
              {convs?.length ?? 0} percakapan aktif
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : !convs || convs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Belum ada pengaduan masuk
              </div>
            ) : (
              convs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv)}
                  className={`w-full text-left p-3 border-b hover:bg-muted/30 transition-colors ${selectedConvId === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">{conv.user?.name ?? "Pengguna"}</p>
                        {conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 ml-1 flex-shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {conv.user?.role === "seller" ? "Penjual" : "Pembeli"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="md:col-span-2 border rounded-xl overflow-hidden bg-white flex flex-col">
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <HeadphonesIcon className="w-14 h-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-semibold text-muted-foreground">Pilih percakapan</h3>
                <p className="text-sm text-muted-foreground mt-1">Klik salah satu tiket di sebelah kiri untuk membalas</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedUser?.name ?? "Pengguna"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {selectedUser?.role === "seller" ? "Penjual" : "Pembeli"} •{" "}
                    <span className="text-green-600">Chat Aktif</span>
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">Belum ada pesan</div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isAdmin ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                          {isAdmin && <p className="text-[10px] font-semibold mb-1 opacity-70">Admin CS</p>}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatDateTime(msg.createdAt)}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input
                    placeholder="Balas sebagai Admin CS..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!content.trim() || sendMessage.isPending}>
                    {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
