import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sword, ChatCircleDots, Gift, Lightning } from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth";
import { usesNativeTabs } from "@/src/navigation";
import { GameHeader } from "@/src/components/game-header";
import { TactileButton } from "@/src/components/tactile-button";
import { useToast } from "@/src/components/toast";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  hero: {
    marginHorizontal: spacing.lg,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: c.border,
    alignItems: "center",
  },
  heroIcon: {
    width: 88, height: 88, borderRadius: radius.lg, backgroundColor: c.brandPrimary, alignItems: "center", justifyContent: "center",
    borderBottomWidth: 6, borderColor: c.brandPrimaryShadow, marginBottom: spacing.lg,
  },
  heroTitle: { color: c.onSurface, fontSize: 26, fontWeight: "900", textAlign: "center" },
  heroSub: { color: c.muted, fontSize: 14, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  card: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 2, borderColor: c.border, flexDirection: "row", alignItems: "center", gap: spacing.md,
  },
  cardIconWrap: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: c.onSurface, fontWeight: "900", fontSize: 17 },
  cardSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  sectionLabel: { color: c.muted, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.xs },
  streakCard: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: c.surfaceTertiary, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 2, borderColor: c.borderStrong,
  },
  streakTitle: { color: c.onSurfaceTertiary, fontWeight: "900", fontSize: 16 },
  streakSub: { color: c.muted, fontSize: 13, marginTop: 2, marginBottom: spacing.md },
}));

export default function BattleHome() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [claiming, setClaiming] = useState(false);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const claim = async () => {
    setClaiming(true);
    try {
      const r = await api.post("/streak/claim");
      await refreshUser();
      toast.show(r.message, r.claimed ? "success" : "info");
    } catch (e: any) {
      toast.show(e.message || "Hata", "error");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={styles.root}>
      <GameHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Sword color={colors.onBrandPrimary} weight="fill" size={48} />
          </View>
          <Text style={styles.heroTitle}>Kapışmaya hazır mısın?</Text>
          <Text style={styles.heroSub}>Seviye {user?.level} rakiplerinle 5 soruluk düelloya gir!</Text>
          <TactileButton
            testID="find-match-button"
            label="Rakip Bul"
            onPress={() => router.push("/battle")}
            variant="primary"
            icon={<Lightning color={colors.onBrandPrimary} weight="fill" size={22} />}
            style={{ alignSelf: "stretch" }}
          />
        </Animated.View>

        <Text style={styles.sectionLabel}>Günlük Ödül</Text>
        <View style={styles.streakCard}>
          <Text style={styles.streakTitle}>🔥 {user?.streak_count || 0} günlük seri</Text>
          <Text style={styles.streakSub}>Her gün giriş yap, +20 coin kap!</Text>
          <TactileButton testID="claim-streak-button" label="Günlük Ödülü Al" small variant="secondary" loading={claiming} onPress={claim} icon={<Gift color={colors.onBrandSecondary} weight="fill" size={18} />} />
        </View>

        <Text style={styles.sectionLabel}>Tek Başına Pratik</Text>
        <Animated.View entering={FadeInDown.delay(150)}>
          <View style={styles.card}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.brandTertiary }]}>
              <ChatCircleDots color={colors.onBrandTertiary} weight="fill" size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>AI ile Sohbet</Text>
              <Text style={styles.cardSub}>Seviyene uygun İngilizce pratik yap</Text>
            </View>
            <TactileButton testID="ai-chat-button" label="Başla" small variant="surface" onPress={() => router.push("/chat")} />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
