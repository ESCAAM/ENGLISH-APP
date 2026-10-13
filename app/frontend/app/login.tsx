import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sword, Lightning, GoogleLogo } from "phosphor-react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useAuth } from "@/src/auth";
import { TactileButton } from "@/src/components/tactile-button";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";

const { width } = Dimensions.get("window");

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  badge: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: c.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 8,
    borderColor: c.brandPrimaryShadow,
  },
  title: { color: c.onSurface, fontSize: 40, fontWeight: "900", textAlign: "center", marginTop: spacing.xl, lineHeight: 44 },
  accent: { color: c.brand },
  subtitle: { color: c.muted, fontSize: 16, textAlign: "center", marginTop: spacing.md, lineHeight: 22, maxWidth: width * 0.8 },
  pillRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.surfaceSecondary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  pillText: { color: c.onSurfaceSecondary, fontWeight: "700", fontSize: 13 },
  footer: { width: "100%", paddingHorizontal: spacing.xl, paddingBottom: spacing["3xl"] },
}));

export default function Login() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { login, signingIn } = useAuth();

  const levels = ["A1", "A2", "B1", "B2", "C1"];

  return (
    <LinearGradient colors={[colors.surface, colors.surfaceSecondary]} style={styles.root}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.springify()} style={styles.badge}>
          <Sword color={colors.onBrandPrimary} weight="fill" size={64} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(100)} style={styles.title}>
          English{"\n"}<Text style={styles.accent}>Clash & Learn</Text>
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(250)} style={styles.subtitle}>
          Rakiplerinle yarış, dersleri tamamla ve İngilizceni oyun oynayarak geliştir!
        </Animated.Text>
        <Animated.View entering={FadeIn.delay(400)} style={styles.pillRow}>
          {levels.map((l) => (
            <View key={l} style={styles.pill}>
              <Lightning color={colors.brandSecondary} weight="fill" size={14} />
              <Text style={styles.pillText}>{l}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <TactileButton
          testID="google-login-button"
          label={signingIn ? "Giriş yapılıyor..." : "Google ile Başla"}
          loading={signingIn}
          onPress={login}
          variant="primary"
          icon={<GoogleLogo color={colors.onBrandPrimary} weight="bold" size={22} />}
        />
      </View>
    </LinearGradient>
  );
}
