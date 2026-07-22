import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Send, Loader2, HeadphonesIcon, ShieldCheck, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { formatDateTime } from "@/lib/format";

const API_BASE = "/api";

async function getOrCreateSupportChat(token: string, message?: string) {
  const res = await fetch(`${API_BASE}/support/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ initialMessage: message }),
  });
  if (!res.ok) throw new Error("Gagal memulai chat dukungan");
  return res.json() as Promise<{ id: number; adminId: number; participants: any[] }>;
}

async function getSupportChat(token: string) {
  const res = await fetch(`${API_BASE}/support/chat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal mengambil chat dukungan");
  return res.json() as Promise<{ id: number; adminId: number } | null>;
}

export default function SupportChat() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [convId, setConvId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token") || "";

  const { data: messages, isLoading: msgsLoading } = useGetMessages(convId ?? 0, {
    query: { enabled: !!convId, refetchInterval: 3000 } as any,
  });

  const sendMessage = useSendMessage();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Try to load existing support chat on mount
  useEffect(() => {
    if (!isAuthenticated || !token) { setLoading(false); return; }
    getSupportChat(token)
      .then(conv => { if (conv) setConvId(conv.id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, token]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const conv = await getOrCreateSupportChat(token);
      setConvId(conv.id);
    } catch {
      toast({ title: "Gagal memulai chat", variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !convId) return;
    sendMessage.mutate({ conversationId: convId, data: { content } }, {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(convId) });
      },
    });
  };

  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto text-center py-20">
          <HeadphonesIcon className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
          <p className="text-muted-foreground mb-4">Silakan login untuk menghubungi tim CS kami.</p>
          <Button onClick={() => setLocation("/login")}>Login Sekarang</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <HeadphonesIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Bantuan & Pengaduan
              <Badge className="bg-green-500 text-white text-xs">Live</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Chat langsung dengan tim admin jualdanbeli</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Tim CS kami siap membantu.</strong> Rata-rata waktu respons: &lt;30 menit pada jam kerja (Senin–Jumat, 08.00–17.00 WIB).
            Pesan dibalas otomatis di luar jam kerja.
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !convId ? (
          // No existing chat — show start screen
          <Card className="p-10 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Belum ada percakapan</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Hubungi tim CS kami untuk bantuan seputar pesanan, pembayaran, sengketa, atau pertanyaan lainnya.
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto mb-6 text-left">
              {[
                "Masalah pesanan & pengiriman",
                "Sengketa pembeli vs penjual",
                "Pertanyaan pembayaran & refund",
                "Akun diblokir atau diretas",
                "Laporan produk palsu / penipuan",
              ].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
            <Button size="lg" onClick={handleStart} disabled={starting} className="w-full max-w-sm">
              {starting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Memulai...</> : <>
                <HeadphonesIcon className="w-4 h-4 mr-2" />Mulai Chat dengan CS
              </>}
            </Button>
          </Card>
        ) : (
          // Chat window
          <Card className="h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Admin jualdanbeli</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Online • Memperbarui otomatis setiap 3 detik
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
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Kirim pesan pertama Anda ke tim CS kami.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                        {!isMe && <p className="text-[10px] font-semibold mb-1 opacity-70">Admin CS</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
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
                  placeholder="Ketik pesan Anda..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" disabled={!content.trim() || sendMessage.isPending}>
                  {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
