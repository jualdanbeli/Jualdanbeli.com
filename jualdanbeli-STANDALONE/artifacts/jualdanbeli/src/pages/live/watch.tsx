import { useParams, Link, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatIDR } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Eye, Radio, Send, ShoppingCart, Store, ArrowLeft, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

function useLiveSession(id: number) {
  return useQuery<any>({
    queryKey: ["live-session", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/live/${id}`);
      if (!res.ok) throw new Error("Live tidak ditemukan");
      return res.json();
    },
    refetchInterval: 5000,
    enabled: !!id,
  });
}

function useLiveChats(id: number) {
  const lastIdRef = useRef(0);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`${API_BASE}/live/${id}/chat?since=${lastIdRef.current}`);
        if (!res.ok) return;
        const newChats: any[] = await res.json();
        if (newChats.length > 0) {
          lastIdRef.current = newChats[newChats.length - 1].id;
          setChats(prev => [...prev, ...newChats].slice(-200));
        }
      } catch {}
    }
    poll();
    const interval = setInterval(poll, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id]);

  return chats;
}

function useSendChat(sessionId: number) {
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`${API_BASE}/live/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
  });
}

function useViewerCount(sessionId: number, active: boolean) {
  useEffect(() => {
    if (!active) return;
    fetch(`${API_BASE}/live/${sessionId}/viewers`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delta: 1 }) });
    return () => {
      fetch(`${API_BASE}/live/${sessionId}/viewers`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delta: -1 }) });
    };
  }, [sessionId, active]);
}

const CHAT_COLORS = ["text-blue-500","text-green-500","text-purple-500","text-pink-500","text-orange-500","text-teal-500"];
function nameColor(name: string) {
  let hash = 0;
  for (const ch of name) hash += ch.charCodeAt(0);
  return CHAT_COLORS[hash % CHAT_COLORS.length];
}

export default function WatchLive() {
  const { id } = useParams<{ id: string }>();
  const sessionId = parseInt(id || "0");
  const { data: session, isLoading } = useLiveSession(sessionId);
  const chats = useLiveChats(sessionId);
  const sendChat = useSendChat(sessionId);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [msg, setMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const addToCart = useAddToCart();
  const qc = useQueryClient();

  useViewerCount(sessionId, !!session?.isActive);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    if (!isAuthenticated) { toast({ title: "Login diperlukan" }); return; }
    sendChat.mutate(msg.trim(), { onSuccess: () => setMsg("") });
  };

  const handleAddToCart = (productId: number, name: string) => {
    if (!isAuthenticated) { toast({ title: "Login diperlukan" }); return; }
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Ditambahkan!", description: name });
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
    });
  };

  if (isLoading) {
    return <MainLayout><Skeleton className="w-full h-96 rounded-2xl" /></MainLayout>;
  }

  if (!session) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-4">Live tidak ditemukan</h2>
          <Button asChild><Link href="/live">Lihat Live Lain</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/live")}>
          <ArrowLeft className="w-4 h-4 mr-1" />Kembali ke Live
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main stream area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stream display */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-primary/20 to-gray-900 aspect-video flex items-center justify-center shadow-xl">
            {session.thumbnailUrl ? (
              <img src={session.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            ) : null}
            <div className="relative z-10 text-center text-white p-8">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                {(session.sellerName || "T")[0].toUpperCase()}
              </div>
              <p className="text-lg font-semibold opacity-80 mb-2">{session.sellerName}</p>
              <p className="text-2xl font-bold">{session.title}</p>
              {session.description && <p className="text-sm opacity-60 mt-2 max-w-sm mx-auto">{session.description}</p>}
              <div className="flex items-center justify-center gap-3 mt-6">
                {session.isActive ? (
                  <Badge className="bg-red-500 gap-1.5 px-3 py-1.5 text-sm animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full inline-block" />SEDANG LIVE
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1.5 text-sm">Live Telah Berakhir</Badge>
                )}
                <Badge variant="outline" className="bg-black/40 text-white border-white/20 gap-1">
                  <Eye className="w-3 h-3" />{session.viewerCount} penonton
                </Badge>
              </div>
            </div>
          </div>

          {/* Seller info */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {(session.sellerName || "T")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{session.sellerName}</p>
                  {session.sellerCity && <p className="text-xs text-muted-foreground">{session.sellerCity}</p>}
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/profile/${session.sellerId}`}><Store className="w-4 h-4 mr-1" />Kunjungi Toko</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Featured products */}
          {session.featuredProducts?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Produk Ditampilkan ({session.featuredProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {session.featuredProducts.map((p: any) => (
                    <div key={p.id} className="border rounded-xl overflow-hidden group">
                      <Link href={`/products/${p.id}`}>
                        <div className="aspect-square bg-muted overflow-hidden">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                          )}
                        </div>
                      </Link>
                      <div className="p-2">
                        <p className="text-xs font-medium line-clamp-1 mb-1">{p.name}</p>
                        <p className="text-xs font-bold text-primary mb-2">{formatIDR(p.price)}</p>
                        <Button size="sm" className="w-full text-xs h-7" onClick={() => handleAddToCart(p.id, p.name)}>
                          <ShoppingCart className="w-3 h-3 mr-1" />Beli
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat sidebar */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col h-[600px] lg:h-full sticky top-20">
            <CardHeader className="py-3 px-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-500" />Live Chat
                </CardTitle>
                <Badge variant="outline" className="text-xs gap-1">
                  <Eye className="w-2.5 h-2.5" />{session.viewerCount}
                </Badge>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chats.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
                  Belum ada pesan. Jadilah yang pertama!
                </div>
              )}
              {chats.map((c: any) => (
                <div key={c.id} className="text-sm">
                  <span className={`font-semibold mr-1.5 ${nameColor(c.userName)}`}>{c.userName}</span>
                  <span className="text-foreground/80">{c.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {session.isActive ? (
              <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <Input
                  placeholder={isAuthenticated ? "Tulis komentar..." : "Login untuk berkomentar"}
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  disabled={!isAuthenticated || sendChat.isPending}
                  className="flex-1 text-sm h-9"
                  maxLength={200}
                />
                <Button type="submit" size="sm" className="h-9 px-3" disabled={!msg.trim() || !isAuthenticated || sendChat.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="p-3 border-t text-center text-sm text-muted-foreground">
                Live telah berakhir
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
