import React, { useRef, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { PaperPlaneRight, CaretLeft, ChatCircleDots, Robot } from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

type Msg = { role: "user" | "assistant"; text: string };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 2, borderBottomColor: c.divider },
  hAvatar: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: c.brandTertiary, alignItems: "center", justifyContent: "center" },
  hTitle: { color: c.onSurface, fontWeight: "900", fontSize: 16 },
  hSub: { color: c.brandSecondary, fontSize: 12, fontWeight: "700" },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: c.brandPrimary, borderRadius: radius.lg, borderBottomRightRadius: radius.sm, padding: spacing.md, maxWidth: "82%", marginVertical: spacing.xs },
  bubbleAI: { alignSelf: "flex-start", backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, borderBottomLeftRadius: radius.sm, padding: spacing.md, maxWidth: "82%", marginVertical: spacing.xs, borderWidth: 1, borderColor: c.border },
  userText: { color: c.onBrandPrimary, fontSize: 15, fontWeight: "600" },
  aiText: { color: c.onSurfaceSecondary, fontSize: 15 },
  grammar: { color: c.info, fontSize: 13, fontStyle: "italic", marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.sm },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  input: { flex: 1, backgroundColor: c.surfaceTertiary, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: c.onSurfaceTertiary, fontSize: 15, maxHeight: 120, borderWidth: 2, borderColor: c.border },
  send: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: c.brandSecondary, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", padding: spacing["3xl"], gap: spacing.md },
  emptyText: { color: c.muted, fontSize: 14, textAlign: "center", lineHeight: 20 },
}));

function parseReply(text: string) {
  const idx = text.search(/\(Grammar Note:/i);
  if (idx === -1) return { main: text.trim(), note: null as string | null };
  return { main: text.slice(0, idx).trim(), note: text.slice(idx).trim() };
}

export default function Chat() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = `chat_${user?.user_id || "guest"}`;
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/ai/chat/history?session_id=${sessionId}`);
        if (r.messages?.length) setMessages(r.messages);
      } catch {}
    })();
  }, [sessionId]);

  const send = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setText("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const r = await api.post("/ai/chat", { session_id: sessionId, message: msg });
      setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, something went wrong. Try again!" }]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} testID="chat-back"><CaretLeft color={colors.onSurface} weight="bold" size={26} /></Pressable>
        <View style={styles.hAvatar}><Robot color={colors.onBrandTertiary} weight="fill" size={24} /></View>
        <View>
          <Text style={styles.hTitle}>AI Pratik Koçu</Text>
          <Text style={styles.hSub}>● Seviye {user?.level} • Çevrimiçi</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "translate-with-padding"}
        keyboardVerticalOffset={insets.top + 56}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ChatCircleDots color={colors.brandTertiary} weight="fill" size={56} />
              <Text style={styles.emptyText}>Merhaba! Let's practice English together. 🎯{"\n"}İngilizce bir şeyler yaz, hatalarını nazikçe düzeltirim.</Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.role === "user") {
              return (
                <Animated.View entering={FadeInDown} style={styles.bubbleUser}>
                  <Text style={styles.userText}>{item.text}</Text>
                </Animated.View>
              );
            }
            const { main, note } = parseReply(item.text);
            return (
              <Animated.View entering={FadeInDown} style={styles.bubbleAI}>
                <Text style={styles.aiText}>{main}</Text>
                {note ? <Text style={styles.grammar}>{note}</Text> : null}
              </Animated.View>
            );
          }}
        />
        {sending ? (
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xs, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ActivityIndicator color={colors.muted} size="small" />
            <Text style={{ color: colors.muted, fontSize: 12 }}>yazıyor...</Text>
          </View>
        ) : null}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + spacing.md }]}>
          <TextInput
            testID="chat-input"
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type in English..."
            placeholderTextColor={colors.muted}
            multiline
            onSubmitEditing={send}
          />
          <Pressable style={[styles.send, (!text.trim() || sending) && { opacity: 0.5 }]} onPress={send} disabled={!text.trim() || sending} testID="chat-send">
            <PaperPlaneRight color={colors.onBrandSecondary} weight="fill" size={22} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
