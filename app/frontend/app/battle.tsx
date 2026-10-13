import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { UserCircle, Robot, Trophy, X, Scissors, Clock, Heart, Lightbulb, Lightning, CaretRight } from "phosphor-react-native";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth";
import { AnswerOptions } from "@/src/components/answer-options";
import { WordAssembly } from "@/src/components/word-assembly";
import { TactileButton } from "@/src/components/tactile-button";
import { useToast } from "@/src/components/toast";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

type Question = {
  id: string; level: string; type: string; prompt?: string;
  options?: string[]; answer?: string; words?: string[]; correct_order?: string[]; tr_hint?: string;
};
type Opponent = { name: string; avatar_url: string; accuracy: number; is_bot: boolean };

const WINDOW: Record<string, number> = { word_match: 10, fill_blank: 15, word_order: 20 };
const TYPE_LABEL: Record<string, string> = { word_match: "Hızlı Kelime Eşleştirme", fill_blank: "Boşluk Doldurma", word_order: "Kelimeleri Sırala" };

const JOKER_DEFS = [
  { id: "joker_50_50", icon: Scissors, label: "%50" },
  { id: "joker_extra_time", icon: Clock, label: "+10sn" },
  { id: "joker_double_chance", icon: Heart, label: "Çift" },
  { id: "joker_hint", icon: Lightbulb, label: "İpucu" },
];

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  searchIcon: { width: 110, height: 110, borderRadius: radius.pill, backgroundColor: c.surfaceSecondary, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: c.brandTertiary },
  searchText: { color: c.onSurface, fontSize: 20, fontWeight: "900", marginTop: spacing.xl, textAlign: "center" },
  searchSub: { color: c.muted, fontSize: 14, marginTop: spacing.sm },
  close: { position: "absolute", left: spacing.lg, zIndex: 10 },
  // scoreboard
  board: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, gap: spacing.md },
  player: { flex: 1, alignItems: "center" },
  avatar: { width: 54, height: 54, borderRadius: radius.pill, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c.borderStrong, overflow: "hidden" },
  avatarImg: { width: 54, height: 54 },
  pName: { color: c.onSurface, fontWeight: "800", fontSize: 13, marginTop: 4 },
  score: { color: c.brand, fontWeight: "900", fontSize: 22 },
  vs: { color: c.muted, fontWeight: "900", fontSize: 16 },
  barTrack: { height: 8, backgroundColor: c.surfaceSecondary, borderRadius: radius.pill, width: "100%", marginTop: 6, overflow: "hidden" },
  barFillP: { height: "100%", backgroundColor: c.brandPrimary },
  barFillO: { height: "100%", backgroundColor: c.error },
  // timer
  timerWrap: { alignItems: "center", marginTop: spacing.lg },
  timerCircle: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 3 },
  timerText: { fontWeight: "900", fontSize: 20 },
  qType: { color: c.brandSecondary, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textAlign: "center", marginTop: spacing.lg },
  qCard: { marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 2, borderColor: c.border },
  qText: { color: c.onSurface, fontSize: 22, fontWeight: "800", lineHeight: 28, marginBottom: spacing.xl, textAlign: "center" },
  hintBanner: { marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: c.surfaceTertiary, borderRadius: radius.md, padding: spacing.md, borderWidth: 2, borderColor: c.info, flexDirection: "row", gap: spacing.sm },
  hintText: { color: c.onSurfaceTertiary, fontSize: 13, flex: 1, fontStyle: "italic" },
  jokerBar: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  jokerBtn: { flex: 1, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center", borderWidth: 2, borderColor: c.border, gap: 2 },
  jokerLabel: { color: c.muted, fontSize: 10, fontWeight: "800" },
  jokerCount: { position: "absolute", top: 2, right: 6, color: c.brand, fontWeight: "900", fontSize: 10 },
  jokerNote: { color: c.muted, fontSize: 11, textAlign: "center", marginTop: spacing.sm },
  // result
  resultIcon: { width: 110, height: 110, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", borderBottomWidth: 8 },
  resultTitle: { color: c.onSurface, fontSize: 32, fontWeight: "900", marginTop: spacing.xl },
  resultScore: { color: c.muted, fontSize: 16, marginTop: spacing.sm, fontWeight: "700" },
  rewardChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.surfaceTertiary, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.xl, borderWidth: 2, borderColor: c.borderStrong },
  rewardText: { color: c.brand, fontWeight: "900", fontSize: 20 },
}));

export default function Battle() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [phase, setPhase] = useState<"searching" | "playing" | "result">("searching");
  const [matchId, setMatchId] = useState<string>("");
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [doubleChance, setDoubleChance] = useState(false);
  const [doubleUsed, setDoubleUsed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [jokersUsed, setJokersUsed] = useState(0);

  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [playerCorrect, setPlayerCorrect] = useState(0);
  const [oppCorrect, setOppCorrect] = useState(0);
  const [result, setResult] = useState<{ won: boolean; coins_earned: number } | null>(null);

  const intervalRef = useRef<any>(null);
  const botTimeoutRef = useRef<any>(null);
  const advanceRef = useRef<any>(null);
  const answeredRef = useRef(false);

  const q = questions[qIndex];
  const total = questions.length || 5;
  const maxScore = Math.max(playerScore, oppScore, 500);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    if (advanceRef.current) clearTimeout(advanceRef.current);
  }, []);

  // Start match
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.post("/match/start");
        if (cancelled) return;
        setMatchId(data.match_id);
        setOpponent(data.opponent);
        setQuestions(data.questions);
        // simulate matchmaking search
        setTimeout(() => {
          if (cancelled) return;
          toast.show(`Rakip bulundu: ${data.opponent.name}! ⚔️`, "announce");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setPhase("playing");
        }, 2600);
      } catch (e: any) {
        toast.show(e.message || "Bağlantı hatası", "error");
        router.back();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const advance = useCallback(() => {
    clearTimers();
    setQIndex((i) => {
      if (i + 1 >= total) {
        finishMatch();
        return i;
      }
      return i + 1;
    });
  }, [total]);

  const reveal = useCallback(() => {
    if (answeredRef.current && revealed) return;
    setRevealed(true);
    clearInterval(intervalRef.current);
    advanceRef.current = setTimeout(advance, 1800);
  }, [advance, revealed]);

  const finalizePlayer = useCallback((isCorrect: boolean, usedTime: number) => {
    answeredRef.current = true;
    if (isCorrect) {
      const pts = 100 + Math.max(0, Math.round(usedTime * 5));
      setPlayerScore((s) => s + pts);
      setPlayerCorrect((n) => n + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    reveal();
  }, [reveal]);

  // Per-question setup
  useEffect(() => {
    if (phase !== "playing" || !q) return;
    answeredRef.current = false;
    setSelected(null);
    setOrder([]);
    setRevealed(false);
    setEliminated([]);
    setDoubleChance(false);
    setDoubleUsed(false);
    setHint(null);

    const windowSec = WINDOW[q.type] || 15;
    setTimeLeft(windowSec);

    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, windowSec - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        if (!answeredRef.current) {
          answeredRef.current = true;
          reveal();
        }
      }
    }, 100);

    // Bot behaviour
    const acc = opponent?.accuracy ?? 0.55;
    const botCorrect = Math.random() < acc;
    const botAt = 1.2 + Math.random() * (windowSec * 0.6);
    botTimeoutRef.current = setTimeout(() => {
      if (botCorrect) {
        const left = Math.max(0, windowSec - botAt);
        setOppScore((s) => s + 100 + Math.round(left * 5));
        setOppCorrect((n) => n + 1);
        toast.show(`${opponent?.name} hızlı davrandı! ✅`, "announce");
      } else {
        toast.show(`${opponent?.name} yanıldı! 😅`, "announce");
      }
    }, botAt * 1000);

    return () => clearTimers();
  }, [phase, qIndex]);

  const onSelectChoice = (opt: string) => {
    if (revealed || answeredRef.current) return;
    const isCorrect = opt === q.answer;
    setSelected(opt);
    if (!isCorrect && doubleChance && !doubleUsed) {
      setDoubleUsed(true);
      setEliminated((prev) => [...prev, opt]);
      toast.show("Çift Hak: Bir şans daha! 💪", "info");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setTimeout(() => setSelected(null), 150);
      return;
    }
    finalizePlayer(isCorrect, timeLeft);
  };

  const onConfirmOrder = () => {
    if (revealed || answeredRef.current || !q) return;
    const built = order.map((t) => t.split("@@")[0]);
    const isCorrect = JSON.stringify(built) === JSON.stringify(q.correct_order);
    setSelected(isCorrect ? "correct" : "wrong");
    if (!isCorrect && doubleChance && !doubleUsed) {
      setDoubleUsed(true);
      setOrder([]);
      setSelected(null);
      toast.show("Çift Hak: Tekrar dene! 💪", "info");
      return;
    }
    finalizePlayer(isCorrect, timeLeft);
  };

  const finishMatch = useCallback(async () => {
    clearTimers();
    setPhase("result");
    try {
      const r = await api.post("/match/finish", {
        match_id: matchId,
        player_correct: playerCorrect,
        opponent_correct: oppCorrect,
        player_score: playerScore,
        opponent_score: oppScore,
      });
      setResult({ won: r.won, coins_earned: r.coins_earned });
      await refreshUser();
      Haptics.notificationAsync(r.won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch (e: any) {
      setResult({ won: playerScore > oppScore, coins_earned: 0 });
    }
  }, [matchId, playerCorrect, oppCorrect, playerScore, oppScore]);

  const useJoker = async (id: string) => {
    if (revealed) return;
    if (jokersUsed >= 2) {
      toast.show("Bir maçta en fazla 2 joker kullanabilirsin!", "error");
      return;
    }
    if ((user?.inventory?.[id] || 0) <= 0) {
      toast.show("Bu jokerden yok, mağazadan al!", "error");
      return;
    }
    if (id === "joker_50_50") {
      if (q.type === "word_order") {
        toast.show("Bu soru tipinde %50 kullanılamaz", "info");
        return;
      }
      const wrongs = (q.options || []).filter((o) => o !== q.answer && !eliminated.includes(o));
      const toRemove = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
      setEliminated((prev) => [...prev, ...toRemove]);
    } else if (id === "joker_extra_time") {
      setTimeLeft((t) => t + 10);
    } else if (id === "joker_double_chance") {
      setDoubleChance(true);
      toast.show("Çift Hak aktif! Yanlışta ikinci şans 💜", "info");
    } else if (id === "joker_hint") {
      setHintLoading(true);
      try {
        const r = await api.post("/ai/hint", { prompt: q.prompt || (q.words || []).join(" "), options: q.options, qtype: q.type });
        setHint(r.hint);
      } catch {
        setHint("Cümlenin zamanına ve öznesine dikkat et!");
      } finally {
        setHintLoading(false);
      }
    }
    try {
      await api.post("/joker/use", { joker_id: id });
      await refreshUser();
    } catch {}
    setJokersUsed((n) => n + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ---------- Searching ----------
  if (phase === "searching") {
    return (
      <View style={[styles.root, styles.center]}>
        <Pressable style={[styles.close, { top: insets.top + spacing.md }]} onPress={() => router.back()} testID="battle-close">
          <X color={colors.muted} weight="bold" size={28} />
        </Pressable>
        <Animated.View entering={FadeIn} style={styles.searchIcon}>
          <ActivityIndicator color={colors.brandTertiary} size="large" />
        </Animated.View>
        <Text style={styles.searchText}>Rakip aranıyor...</Text>
        <Text style={styles.searchSub}>Seviye {user?.level} oyuncular taranıyor</Text>
      </View>
    );
  }

  // ---------- Result ----------
  if (phase === "result") {
    const won = result?.won;
    return (
      <View style={[styles.root, styles.center]}>
        <Animated.View entering={FadeInDown.springify()} style={[styles.resultIcon, { backgroundColor: won ? colors.brandSecondary : colors.surfaceSecondary, borderColor: won ? colors.brandSecondaryShadow : colors.surfaceSecondaryShadow }]}>
          <Trophy color={won ? colors.onBrandSecondary : colors.muted} weight="fill" size={56} />
        </Animated.View>
        <Text style={styles.resultTitle}>{won ? "KAZANDIN! 🎉" : "KAYBETTİN"}</Text>
        <Text style={styles.resultScore}>{playerScore} - {oppScore} • {playerCorrect}/{total} doğru</Text>
        <View style={styles.rewardChip}>
          <Lightning color={colors.brand} weight="fill" size={22} />
          <Text style={styles.rewardText}>+{result?.coins_earned ?? 0} coin</Text>
        </View>
        <View style={{ height: spacing["2xl"] }} />
        <View style={{ width: "100%", gap: spacing.md }}>
          <TactileButton testID="rematch-button" label="Tekrar Oyna" variant="primary" onPress={() => router.replace("/battle")} />
          <TactileButton testID="back-home-button" label="Ana Menü" variant="surface" onPress={() => router.replace("/(tabs)")} />
        </View>
      </View>
    );
  }

  // ---------- Playing ----------
  const windowSec = WINDOW[q?.type || "fill_blank"] || 15;
  const timerColor = timeLeft <= 3 ? colors.error : timeLeft <= 6 ? colors.warning : colors.brandSecondary;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <Pressable onPress={() => router.back()} testID="battle-exit">
          <X color={colors.muted} weight="bold" size={24} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: "center", color: colors.onSurface, fontWeight: "900", fontSize: 15 }}>Soru {qIndex + 1} / {total}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scoreboard */}
      <View style={styles.board}>
        <View style={styles.player}>
          <View style={styles.avatar}>
            {user?.avatar_url ? <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} /> : <UserCircle color={colors.brand} weight="fill" size={54} />}
          </View>
          <Text style={styles.pName} numberOfLines={1}>Sen</Text>
          <Text style={styles.score}>{playerScore}</Text>
          <View style={styles.barTrack}><View style={[styles.barFillP, { width: `${(playerScore / maxScore) * 100}%` }]} /></View>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.player}>
          <View style={styles.avatar}><Robot color={colors.error} weight="fill" size={40} /></View>
          <Text style={styles.pName} numberOfLines={1}>{opponent?.name}</Text>
          <Text style={[styles.score, { color: colors.error }]}>{oppScore}</Text>
          <View style={styles.barTrack}><View style={[styles.barFillO, { width: `${(oppScore / maxScore) * 100}%` }]} /></View>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerWrap}>
        <View style={[styles.timerCircle, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{Math.ceil(timeLeft)}s</Text>
        </View>
      </View>

      <Text style={styles.qType}>{TYPE_LABEL[q?.type || ""]}</Text>

      {hint ? (
        <Animated.View entering={FadeIn} style={styles.hintBanner}>
          <Lightbulb color={colors.info} weight="fill" size={18} />
          <Text style={styles.hintText}>{hint}</Text>
        </Animated.View>
      ) : null}

      {/* Question */}
      <View style={styles.qCard}>
        {q?.type === "word_order" ? (
          <>
            {q.prompt ? <Text style={styles.qText}>{q.prompt}</Text> : null}
            <WordAssembly words={q.words || []} selectedOrder={order} onChange={setOrder} disabled={revealed} revealed={revealed} isCorrect={selected === "correct"} />
            <View style={{ height: spacing.lg }} />
            {!revealed ? (
              <TactileButton testID="confirm-order-button" label="Onayla" variant="secondary" disabled={order.length !== (q.words || []).length} onPress={onConfirmOrder} icon={<CaretRight color={colors.onBrandSecondary} weight="bold" size={18} />} />
            ) : (
              <Text style={{ color: colors.muted, textAlign: "center", fontSize: 13 }}>Doğru: {(q.correct_order || []).join(" ")}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.qText} testID="battle-prompt">{q?.prompt}</Text>
            <AnswerOptions options={q?.options || []} eliminated={eliminated} selected={selected} correctAnswer={q?.answer} revealed={revealed} onSelect={onSelectChoice} />
          </>
        )}
      </View>

      {/* Jokers */}
      <View style={styles.jokerBar}>
        {JOKER_DEFS.map((j) => {
          const Icon = j.icon;
          const count = user?.inventory?.[j.id] || 0;
          const disabled = revealed || jokersUsed >= 2 || count <= 0 || (j.id === "joker_hint" && hintLoading);
          return (
            <Pressable key={j.id} testID={`joker-${j.id}`} style={[styles.jokerBtn, disabled && { opacity: 0.4 }]} disabled={disabled} onPress={() => useJoker(j.id)}>
              <Text style={styles.jokerCount}>{count}</Text>
              {j.id === "joker_hint" && hintLoading ? <ActivityIndicator color={colors.brandSecondary} /> : <Icon color={colors.brandSecondary} weight="fill" size={22} />}
              <Text style={styles.jokerLabel}>{j.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.jokerNote}>Kullanılan joker: {jokersUsed}/2</Text>
    </View>
  );
}
