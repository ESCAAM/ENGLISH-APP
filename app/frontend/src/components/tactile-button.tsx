import React from "react";
import { Pressable, Text, View, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";

import { makeStyles, useTheme, radius, spacing } from "@/src/theme";

type Variant = "primary" | "secondary" | "tertiary" | "error" | "surface";

type Props = {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
};

const useStyles = makeStyles((c) => ({
  wrap: { borderRadius: radius.lg },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  innerSmall: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  label: { fontSize: 18, fontWeight: "900", letterSpacing: 0.3 },
  labelSmall: { fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.45 },
}));

export function TactileButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  testID,
  icon,
  style,
  small,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [pressed, setPressed] = React.useState(false);

  const map: Record<Variant, { bg: string; fg: string; shadow: string }> = {
    primary: { bg: colors.brandPrimary, fg: colors.onBrandPrimary, shadow: colors.brandPrimaryShadow },
    secondary: { bg: colors.brandSecondary, fg: colors.onBrandSecondary, shadow: colors.brandSecondaryShadow },
    tertiary: { bg: colors.brandTertiary, fg: colors.onBrandTertiary, shadow: colors.brandTertiaryShadow },
    error: { bg: colors.error, fg: colors.onError, shadow: colors.errorShadow },
    surface: { bg: colors.surfaceSecondary, fg: colors.onSurfaceSecondary, shadow: colors.surfaceSecondaryShadow },
  };
  const v = map[variant];
  const depth = small ? 4 : 6;

  return (
    <View style={[styles.wrap, { backgroundColor: v.shadow }, disabled && styles.disabled, style]}>
      <Pressable
        testID={testID}
        disabled={disabled || loading}
        onPressIn={() => {
          setPressed(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        style={[
          styles.inner,
          small && styles.innerSmall,
          { backgroundColor: v.bg, marginBottom: pressed ? 0 : depth, transform: [{ translateY: pressed ? depth : 0 }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.fg} />
        ) : (
          <>
            {icon}
            {label ? <Text style={[small ? styles.labelSmall : styles.label, { color: v.fg }]}>{label}</Text> : null}
          </>
        )}
      </Pressable>
    </View>
  );
}
