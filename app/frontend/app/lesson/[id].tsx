import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { X, BookOpen, ArrowRight, Trophy, Lightning, CaretRight } from "phosphor-react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth";
import { AnswerOptions } from "@/src/components/answer-options";
import { WordAssembly } from "@/src/components/word-assembly";
import { TactileButton } from "@/src/components/tactile-button";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { queryClient } from "@/src/query-client";

type Question = { id: string; type: string; prompt?: string; options?: string[]; answer?: string; words?: string[]; correct_order?: string[] };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  hTitle: { flex: 1, color: c.onSurface, fontWeight: "900", fontSize: 18, textAlign: "center" },
  kicker: { color: c.brandSecondary, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginHorizontal: spacing.lg },
  bigTitle: { color: c.onSurface, fontWeight: "900", fontSize: 26, marginHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.lg },
  teachCard: { marginHorizontal: spacing.lg, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 2, borderColor: c.border, marginBottom: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.lg },
  en: { color: c.brand, fontWeight: "900", fontSize: 18 },
  tr: { color: c.muted, fontSize: 14, marginTop: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  qCard: { marginHorizontal: spacing.lg, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 2, borderColor: c.border },
  qText: { color: c.onSurface, fontSize: 22, fontWeight: "800", lineHeight: 28, marginBottom: spacing.xl, textAlign: "center" },
  progress: { color: c.muted, fontWeight: "700", textAlign: "center", marginVertical: spacing.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  resultIcon: { width: 110, height: 110, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", borderBottomWidth: 8 },
  resultTitle: { color: c.onSurface, fontSize: 28, fontWeight: "900", marginTop: spacing.xl, textAlign: "center" },
  resultSub: { color: c.muted, fontSize: 15, marginTop: spacing.sm, textAlign: "center" },
}));

export default function Lesson() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refreshUser } = useAuth();

  const [phase, setPhase] = useState<"learn" | "quiz" | "result">("learn");
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number; reward: number; pass_bar: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["lesson", id], queryFn: () => api.get(`/lessons/${id}`) });
  const unit = data?.unit;
  const quiz: Question[] = data?.quiz || [];
  const q = quiz[qIndex];

  const advance = async (isCorrect: boolean) => {
    const newCorrect = correct + (isCorrect ? 1 : 0);
    setCorrect(newCorrect);
    setTimeout(async () => {
      if (qIndex + 1 < quiz.length) {
        setQIndex(qIndex + 1);
        setSelected(null);
        setOrder([]);
        setRevealed(false);
      } else {
        setSubmitting(true);
        try {
          const r = await api.post("/lessons/complete", { unit_id: id, correct: newCorrect, total: quiz.length });
          setResult(r);
          await refreshUser();
          queryClient.invalidateQueries({ queryKey: ["lessons"] });
        } finally {
          setSubmitting(false);
          setPhase("result");
        }
      }
    }, 1200);
  };

  const onChoice = (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    advance(opt === q.answer);
  };

  const onConfirm = () => {
    if (revealed) return;
    const built = order.map((t) => t.split("@@")[0]);
    const isCorrect = JSON.stringify(built) === JSON.stringify(q.correct_order);
    setSelected(isCorrect ? "correct" : "wrong");
    setRevealed(true);
    advance(isCorrect);
  };

  if (isLoading || !unit) {
    return <View style={[styles.root, styles.center]}><ActivityIndicator color={colors.brand} size="large" /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} testID="lesson-close"><X color={colors.muted} weight="bold" size={26} /></Pressable>
        <Text style={styles.hTitle}>{unit.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      {phase === "learn" ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>Seviye {unit.level} • Öğren</Text>
          <Text style={styles.bigTitle}>{unit.desc}</Text>
          {unit.teach.map((t: any, i: number) => (
            <Animated.View key={i} entering={FadeIn.delay(i * 60)} style={styles.teachCard}>
              <View style={styles.iconCircle}><BookOpen color={colors.brandSecondary} weight="fill" size={22} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.en}>{t.en}</Text>
                <Text style={styles.tr}>{t.tr}</Text>
              </View>
            </Animated.View>
          ))}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <TactileButton testID="start-quiz-button" label="Sınava Başla (%80 baraj)" variant="primary" onPress={() => setPhase("quiz")} icon={<ArrowRight color={colors.onBrandPrimary} weight="bold" size={20} />} />
          </View>
        </ScrollView>
      ) : phase === "quiz" ? (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }} showsVerticalScrollIndicator={false}>
          <Text style={styles.progress}>Soru {qIndex + 1} / {quiz.length}  •  Doğru: {correct}</Text>
          <View style={styles.qCard}>
            {q.type === "word_order" ? (
              <>
                {q.prompt ? <Text style={styles.qText}>{q.prompt}</Text> : null}
                <WordAssembly words={q.words || []} selectedOrder={order} onChange={setOrder} disabled={revealed} revealed={revealed} isCorrect={selected === "correct"} />
                <View style={{ height: spacing.lg }} />
                {!revealed ? (
                  <TactileButton testID="lesson-confirm-order" label="Onayla" variant="secondary" disabled={order.length !== (q.words || []).length} onPress={onConfirm} icon={<CaretRight color={colors.onBrandSecondary} weight="bold" size={18} />} />
                ) : (
                  <Text style={{ color: colors.muted, textAlign: "center", fontSize: 13 }}>Doğru: {(q.correct_order || []).join(" ")}</Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.qText}>{q.prompt}</Text>
                <AnswerOptions options={q.options || []} selected={selected} correctAnswer={q.answer} revealed={revealed} onSelect={onChoice} />
              </>
            )}
          </View>
          {submitting ? <View style={{ padding: spacing.xl }}><ActivityIndicator color={colors.brand} /></View> : null}
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <View style={[styles.resultIcon, { backgroundColor: result?.passed ? colors.brandSecondary : colors.surfaceSecondary, borderColor: result?.passed ? colors.brandSecondaryShadow : colors.surfaceSecondaryShadow }]}>
            <Trophy color={result?.passed ? colors.onBrandSecondary : colors.muted} weight="fill" size={52} />
          </View>
          <Text style={styles.resultTitle}>{result?.passed ? "Ünite Tamamlandı! 🎉" : "Baraja takıldın"}</Text>
          <Text style={styles.resultSub}>Skorun: %{result?.score} (Baraj: %{result?.pass_bar})</Text>
          {result?.passed && (result?.reward || 0) > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.lg }}>
              <Lightning color={colors.brand} weight="fill" size={22} />
              <Text style={{ color: colors.brand, fontWeight: "900", fontSize: 20 }}>+{result?.reward} coin</Text>
            </View>
          ) : null}
          <View style={{ height: spacing["2xl"] }} />
          <View style={{ width: "100%", gap: spacing.md }}>
            {!result?.passed ? (
              <TactileButton testID="retry-lesson" label="Tekrar Dene" variant="primary" onPress={() => { setPhase("learn"); setQIndex(0); setCorrect(0); setSelected(null); setOrder([]); setRevealed(false); }} />
            ) : null}
            <TactileButton testID="lesson-done" label="Derslere Dön" variant={result?.passed ? "primary" : "surface"} onPress={() => router.back()} />
          </View>
        </View>
      )}
    </View>
  );
}
