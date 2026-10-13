import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaretLeft, UserCircle, Fire, Coins, SignOut, Scissors, Clock, Heart, Lightbulb } from "phosphor-react-native";

import { useAuth } from "@/src/auth";
import { TactileButton } from "@/src/components/tactile-button";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

const JOKER_META: Record<string, { icon: any; name: string }> = {
  joker_50_50: { icon: Scissors, name: "%50 Eleme" },
  joker_extra_time: { icon: Clock, name: "Ekstra Zaman" },
  joker_double_chance: { icon: Heart, name: "Çift Hak" },
  joker_hint: { icon: Lightbulb, name: "AI İpucu" },
};

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  hTitle: { flex: 1, color: c.onSurface, fontWeight: "900", fontSize: 18, textAlign: "center" },
  avatar: { width: 96, height: 96, borderRadius: radius.pill, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center", alignSelf: "center", borderWidth: 3, borderColor: c.brandTertiary, overflow: "hidden" },
  avatarImg: { width: 96, height: 96 },
  name: { color: c.onSurface, fontWeight: "900", fontSize: 24, textAlign: "center", marginTop: spacing.md },
  email: { color: c.muted, fontSize: 13, textAlign: "center", marginTop: 2 },
  levelPill: { backgroundColor: c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 6, alignSelf: "center", marginTop: spacing.md },
  levelText: { color: c.onBrandTertiary, fontWeight: "900", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  statCard: { flex: 1, backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", borderWidth: 2, borderColor: c.border },
  statValue: { color: c.onSurface, fontWeight: "900", fontSize: 24, marginTop: spacing.sm },
  statLabel: { color: c.muted, fontSize: 12, marginTop: 2 },
  sectionLabel: { color: c.muted, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm },
  invRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: c.surfaceSecondary, borderRadius: radius.md, padding: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: c.border },
  invName: { color: c.onSurfaceSecondary, fontWeight: "700", fontSize: 14, flex: 1 },
  invCount: { color: c.brand, fontWeight: "900", fontSize: 16 },
}));

export default function Profile() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} testID="profile-back"><CaretLeft color={colors.onSurface} weight="bold" size={26} /></Pressable>
        <Text style={styles.hTitle}>Profil</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing["2xl"] }} showsVerticalScrollIndicator={false}>
        <View style={styles.avatar}>
          {user.avatar_url ? <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} /> : <UserCircle color={colors.muted} weight="fill" size={96} />}
        </View>
        <Text style={styles.name}>{user.display_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.levelPill}><Text style={styles.levelText}>Seviye {user.level || "A1"}</Text></View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Coins color={colors.brand} weight="fill" size={28} />
            <Text style={styles.statValue}>{user.coins}</Text>
            <Text style={styles.statLabel}>Coin</Text>
          </View>
          <View style={styles.statCard}>
            <Fire color={colors.warning} weight="fill" size={28} />
            <Text style={styles.statValue}>{user.streak_count}</Text>
            <Text style={styles.statLabel}>Günlük Seri</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Joker Envanterin</Text>
        {Object.entries(JOKER_META).map(([id, meta]) => {
          const Icon = meta.icon;
          return (
            <View key={id} style={styles.invRow} testID={`inv-${id}`}>
              <Icon color={colors.brandSecondary} weight="fill" size={22} />
              <Text style={styles.invName}>{meta.name}</Text>
              <Text style={styles.invCount}>x{user.inventory?.[id] || 0}</Text>
            </View>
          );
        })}

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <TactileButton testID="logout-button" label="Çıkış Yap" variant="error" onPress={logout} icon={<SignOut color={colors.onError} weight="bold" size={20} />} />
        </View>
      </ScrollView>
    </View>
  );
}
