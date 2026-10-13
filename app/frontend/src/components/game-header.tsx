import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fire, UserCircle } from "phosphor-react-native";

import { useAuth } from "@/src/auth";
import { CoinBadge } from "@/src/components/coin-badge";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

const useStyles = makeStyles((c) => ({
  wrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: c.surface },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: c.surfaceTertiary, borderWidth: 2, borderColor: c.borderStrong, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: 40, height: 40 },
  name: { color: c.onSurface, fontWeight: "900", fontSize: 15 },
  levelPill: { backgroundColor: c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: "flex-start", marginTop: 2 },
  levelText: { color: c.onBrandTertiary, fontWeight: "900", fontSize: 11 },
  right: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  streak: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.surfaceTertiary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 2, borderColor: c.borderStrong },
  streakText: { color: c.warning, fontWeight: "900", fontSize: 15 },
}));

export function GameHeader() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  if (!user) return null;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <Pressable style={styles.left} onPress={() => router.push("/profile")} testID="header-profile-button">
          <View style={styles.avatar}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
            ) : (
              <UserCircle color={colors.muted} weight="fill" size={40} />
            )}
          </View>
          <View>
            <Text style={styles.name} numberOfLines={1}>{user.display_name}</Text>
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>Seviye {user.level || "A1"}</Text>
            </View>
          </View>
        </Pressable>
        <View style={styles.right}>
          <View style={styles.streak}>
            <Fire color={colors.warning} weight="fill" size={16} />
            <Text style={styles.streakText}>{user.streak_count}</Text>
          </View>
          <CoinBadge coins={user.coins} testID="header-coins" />
        </View>
      </View>
    </View>
  );
}
