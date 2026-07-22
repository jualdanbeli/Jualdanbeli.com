import { Feather } from "@expo/vector-icons";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform,
  Pressable, RefreshControl, ScrollView, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

interface SupportConv {
  id: number;
  user: { id: number; name: string; role: string } | null;
  lastMessage: string | null;
  unreadCount: number;
  updatedAt: string;
}

function useSupportConversations(token: string) {
  return useQuery<SupportConv[]>({
    queryKey: ["support-conversations-admin"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/support/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 5000,
  });
}

export default function AdminSupport() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const { data: convs, isLoading, refetch, isRefetching } = useSupportConversations(token ?? "");
  const [selectedConv, setSelectedConv] = useState<SupportConv | null>(null);
  const [content, setContent] = useState("");

  const { data: messages, isLoading: msgsLoading } = useGetMessages(
    selectedConv?.id ?? 0,
    { query: { enabled: !!selectedConv, refetchInterval: 3000 } as any }
  );
  const sendMessage = useSendMessage();

  const convList: SupportConv[] = Array.isArray(convs) ? convs : [];
  const msgList: any[] = Array.isArray(messages) ? messages : [];
  const totalUnread = convList.reduce((s, c) => s + (c.unreadCount || 0), 0);

  useEffect(() => {
    if (msgList.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [msgList.length]);

  const handleSend = () => {
    if (!content.trim() || !selectedConv) return;
    sendMessage.mutate(
      { conversationId: selectedConv.id, data: { content } },
      {
        onSuccess: () => {
          setContent("");
          qc.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedConv.id) });
          qc.invalidateQueries({ queryKey: ["support-conversations-admin"] });
        },
      }
    );
  };

  const formatTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Chat view
  if (selectedConv) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Chat header */}
        <View style={{
          backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: "row", alignItems: "center", gap: 12,
        }}>
          <Pressable
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
            }}
            onPress={() => setSelectedConv(null)}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{
            width: 42, height: 42, borderRadius: 12,
            backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#2563eb" }}>
              {selectedConv.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground }}>
              {selectedConv.user?.name ?? "Pengguna"}
            </Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#16a34a" }}>
              {selectedConv.user?.role === "seller" ? "Penjual" : "Pembeli"} · Chat Aktif
            </Text>
          </View>
        </View>

        {/* Messages */}
        {msgsLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={msgList}
            keyExtractor={(item: any) => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                  Belum ada pesan
                </Text>
              </View>
            }
            renderItem={({ item }: { item: any }) => {
              const isAdmin = item.senderId === user?.id;
              return (
                <View style={{ flexDirection: "row", justifyContent: isAdmin ? "flex-end" : "flex-start", gap: 8 }}>
                  {!isAdmin && (
                    <View style={{
                      width: 30, height: 30, borderRadius: 9,
                      backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center",
                    }}>
                      <Feather name="user" size={14} color="#2563eb" />
                    </View>
                  )}
                  <View style={{
                    maxWidth: "75%", borderRadius: 16,
                    backgroundColor: isAdmin ? "#2563eb" : colors.card,
                    paddingHorizontal: 14, paddingVertical: 10,
                    borderBottomRightRadius: isAdmin ? 4 : 16,
                    borderBottomLeftRadius: isAdmin ? 16 : 4,
                    borderWidth: isAdmin ? 0 : 1, borderColor: colors.border,
                  }}>
                    {isAdmin && (
                      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)", marginBottom: 3 }}>
                        Admin CS
                      </Text>
                    )}
                    <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: isAdmin ? "#fff" : colors.foreground, lineHeight: 20 }}>
                      {item.content}
                    </Text>
                    <Text style={{ fontSize: 10, marginTop: 4, color: isAdmin ? "rgba(255,255,255,0.6)" : colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "right" }}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                  {isAdmin && (
                    <View style={{
                      width: 30, height: 30, borderRadius: 9,
                      backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center",
                    }}>
                      <Feather name="shield" size={13} color="#fff" />
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}

        {/* Input */}
        <View style={{
          paddingHorizontal: 16, paddingVertical: 12, paddingBottom: insets.bottom + 12,
          backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border,
          flexDirection: "row", gap: 10, alignItems: "flex-end",
        }}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Balas sebagai Admin CS..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={{
              flex: 1, backgroundColor: colors.muted, borderRadius: 14,
              paddingHorizontal: 14, paddingVertical: 10,
              fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground,
              maxHeight: 100,
            }}
          />
          <Pressable
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: content.trim() ? (pressed ? "#1e40af" : "#2563eb") : colors.muted,
              alignItems: "center", justifyContent: "center",
            })}
            onPress={handleSend}
            disabled={!content.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="send" size={18} color={content.trim() ? "#fff" : colors.mutedForeground} />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Conversation list
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Banner */}
      {totalUnread > 0 && (
        <View style={{
          backgroundColor: "#fee2e2", paddingHorizontal: 16, paddingVertical: 10,
          flexDirection: "row", alignItems: "center", gap: 8,
          borderBottomWidth: 1, borderBottomColor: "#fecaca",
        }}>
          <Feather name="bell" size={15} color="#dc2626" />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#dc2626" }}>
            {totalUnread} pesan belum dibaca
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
      >
        {/* Count */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
            {convList.length} percakapan aktif · Auto-refresh 5 detik
          </Text>
        </View>

        {convList.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
              <Feather name="message-square" size={34} color={colors.mutedForeground} />
            </View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground }}>Belum ada pengaduan</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, textAlign: "center" }}>
              Pesan dari pengguna akan muncul di sini
            </Text>
          </View>
        ) : (
          convList.map(conv => (
            <Pressable
              key={conv.id}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.muted : colors.card,
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: 1, borderBottomColor: colors.border,
                flexDirection: "row", alignItems: "center", gap: 14,
              })}
              onPress={() => setSelectedConv(conv)}
            >
              {/* Avatar */}
              <View style={{
                width: 50, height: 50, borderRadius: 14,
                backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: "#2563eb" }}>
                  {conv.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground }}>
                    {conv.user?.name ?? "Pengguna"}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                    {formatDate(conv.updatedAt)}
                  </Text>
                </View>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground }} numberOfLines={1}>
                  {conv.lastMessage ?? "Belum ada pesan"}
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>
                  {conv.user?.role === "seller" ? "🏪 Penjual" : "🛒 Pembeli"}
                </Text>
              </View>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <View style={{
                  backgroundColor: "#dc2626", borderRadius: 99,
                  minWidth: 22, height: 22, alignItems: "center", justifyContent: "center",
                  paddingHorizontal: 6,
                }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" }}>
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </Text>
                </View>
              )}

              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
