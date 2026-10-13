import React from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Lock, Check, Star, BookOpen } from "phosphor-react-native";

import { api } from "@/src/api";
import { usesNativeTabs } from "@/src/navigation";
import { GameHeader } from "@/src/components/game-header";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { queryClient } from "@/src/query-client";

type Unit = { id: string; level: string; order: number; title: string; desc: string; completed: boolean; unlocked: boolean; score: number | null };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  center: { padding: spacing["3xl"], alignItems: "center" },
  levelHeader: { marginTop: spacing.xl, marginBottom: spacing.sm, alignItems: "center" },
  levelBanner: { backgroundColor: c.surfaceTertiary, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderWidth: 2, borderColor: c.borderStrong },
  levelText: { color: c.brand, fontWeight: "900", fontSize: 15, letterSpacing: 1 },
  nodeRow: { marginVertical: spacing.md },
  node: { width: 84, height: 84, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", borderBottomWidth: 6 },
  nodeLabel: { color: c.onSurface, fontWeight: "800", fontSize: 13, marginTop: spacing.xs, textAlign: "center", maxWidth: 130 },
  nodeDesc: { color: c.muted, fontSize: 11, textAlign: "center", maxWidth: 140 },
  scoreTag: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  scoreText: { color: c.brandSecondary, fontWeight: "800", fontSize: 11 },
}));

export default function LessonsTab() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const { data, isLoading } = useQuery({ queryKey: ["lessons"], queryFn: () => api.get("/lessons") });

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    }, [])
  );

  const units: Unit[] = data?.units || [];

  // group by level for banners
  let lastLevel = "";

  return (
    <View style={styles.root}>
      <GameHeader />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brand} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: bottomChrome + spacing["3xl"], paddingHorizontal: spacing.lg }} showsVerticalScrollIndicator={false}>
          {units.map((u, i) => {
            const showBanner = u.level !== lastLevel;
            lastLevel = u.level;
            const align = i % 2 === 0 ? "flex-start" : "flex-end";

            let bg = colors.surfaceSecondary;
            let shadow = colors.surfaceSecondaryShadow;
            let icon = <Lock color={colors.muted} weight="fill" size={34} />;
            if (u.completed) {
              bg = colors.brandSecondary;
              shadow = colors.brandSecondaryShadow;
              icon = <Check color={colors.onBrandSecondary} weight="bold" size={36} />;
            } else if (u.unlocked) {
              bg = colors.brandPrimary;
              shadow = colors.brandPrimaryShadow;
              icon = <BookOpen color={colors.onBrandPrimary} weight="fill" size={34} />;
            }

            return (
              <View key={u.id}>
                {showBanner ? (
                  <View style={styles.levelHeader}>
                    <View style={styles.levelBanner}>
                      <Text style={styles.levelText}>SEVİYE {u.level}</Text>
                    </View>
                  </View>
                ) : null}
                <View style={[styles.nodeRow, { alignItems: align }]}>
                  <Pressable
                    testID={`unit-node-${u.id}`}
                    disabled={!u.unlocked && !u.completed}
                    onPress={() => router.push(`/lesson/${u.id}`)}
                    style={{ alignItems: "center", opacity: !u.unlocked && !u.completed ? 0.55 : 1 }}
                  >
                    <View style={[styles.node, { backgroundColor: bg, borderColor: shadow }]}>{icon}</View>
                    <Text style={styles.nodeLabel}>{u.title}</Text>
                    <Text style={styles.nodeDesc}>{u.desc}</Text>
                    {u.completed && u.score != null ? (
                      <View style={styles.scoreTag}>
                        <Star color={colors.brandSecondary} weight="fill" size={12} />
                        <Text style={styles.scoreText}>%{u.score}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
