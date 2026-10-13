import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Target } from "phosphor-react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth";
import { AnswerOptions } from "@/src/components/answer-options";
import { TactileButton } from "@/src/components/tactile-button";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

type PQ = { id: string; prompt: string; options: string[] };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  kicker: { color: c.brandSecondary, fontWeight: "800", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" },
  title: { color: c.onSurface, fontWeight: "900", fontSize: 26, marginTop: spacing.xs },
  progressWrap: { height: 10, backgroundColor: c.surfaceSecondary, borderRadius: radius.pill, marginTop: spacing.lg, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: c.brandSecondary, borderRadius: radius.pill },
  count: { color: c.muted, marginTop: spacing.sm, fontWeight: "700" },
  qCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: c.border,
    marginBottom: spacing.xl,
  },
  qText: { color: c.onSurface, fontSize: 22, fontWeight: "800", marginBottom: spacing.xl, lineHeight: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
}));

export default function Placement() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { refreshUser } = useAuth();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["placement"],
    queryFn: () => api.get("/placement/questions"),
  });

  const questions: PQ[] = data?.questions || [];
  const q = questions[idx];
  const progress = questions.length ? (idx + 1) / questions.length : 0;

  const submit = async (finalAnswers: Record<string, string>) => {
    setSubmitting(true);
    try {
      await api.post("/placement/submit", { answers: finalAnswers });
      await refreshUser();
    } finally {
      setSubmitting(false);
    }
  };

  const onSelect = (opt: string) => {
    if (!q) return;
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    setTimeout(() => {
      if (idx + 1 < questions.length) setIdx(idx + 1);
      else submit(next);
    }, 180);
  };

  if (isLoading || !q) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={{ color: colors.muted }}>Sınav hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Target color={colors.brandSecondary} weight="fill" size={20} />
          <Text style={styles.kicker}>Seviye Belirleme</Text>
        </View>
        <Text style={styles.title}>Seviyeni ölçelim! 🎯</Text>
        <View style={styles.progressWrap}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.count}>Soru {idx + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xl }} showsVerticalScrollIndicator={false}>
        <Animated.View key={q.id} entering={FadeIn} style={styles.qCard}>
          <Text style={styles.qText} testID="placement-prompt">{q.prompt}</Text>
          <AnswerOptions options={q.options} selected={answers[q.id]} onSelect={onSelect} disabled={submitting} />
        </Animated.View>
        {submitting ? (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <TactileButton label="Sonuç hesaplanıyor..." loading onPress={() => {}} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
