import React from "react";
import { Pressable, Text, View } from "react-native";

import { makeStyles, useTheme, radius, spacing } from "@/src/theme";

type Props = {
  words: string[];
  selectedOrder: string[]; // indices? we track by word+index tokens
  onChange: (next: string[]) => void;
  disabled?: boolean;
  revealed?: boolean;
  isCorrect?: boolean;
};

// We track tokens as `${word}@@${originalIndex}` to allow duplicate words.
const useStyles = makeStyles((c) => ({
  tray: {
    minHeight: 64,
    borderWidth: 2,
    borderColor: c.borderStrong,
    borderStyle: "dashed",
    borderRadius: radius.md,
    backgroundColor: c.surfaceSecondary,
    padding: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pool: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  chip: {
    backgroundColor: c.surfaceTertiary,
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipText: { color: c.onSurfaceTertiary, fontWeight: "800", fontSize: 15 },
  placed: { backgroundColor: c.brandTertiary, borderColor: c.brandTertiaryShadow },
  placedText: { color: c.onBrandTertiary },
  used: { opacity: 0.25 },
  label: { color: c.muted, fontSize: 12, fontWeight: "700", marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 1 },
}));

export function WordAssembly({ words, selectedOrder, onChange, disabled, revealed, isCorrect }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tokens = words.map((w, i) => `${w}@@${i}`);

  const place = (tok: string) => {
    if (disabled || revealed) return;
    if (selectedOrder.includes(tok)) return;
    onChange([...selectedOrder, tok]);
  };
  const remove = (tok: string) => {
    if (disabled || revealed) return;
    onChange(selectedOrder.filter((t) => t !== tok));
  };

  const trayBorder = revealed ? (isCorrect ? colors.success : colors.error) : colors.borderStrong;

  return (
    <View>
      <Text style={styles.label}>Kelimeleri doğru sıraya koy</Text>
      <View style={[styles.tray, { borderColor: trayBorder, borderStyle: "solid" }]} testID="assembly-tray">
        {selectedOrder.map((tok) => (
          <Pressable key={tok} onPress={() => remove(tok)} style={[styles.chip, styles.placed]}>
            <Text style={[styles.chipText, styles.placedText]}>{tok.split("@@")[0]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.pool}>
        {tokens.map((tok) => {
          const used = selectedOrder.includes(tok);
          return (
            <Pressable key={tok} onPress={() => place(tok)} disabled={used} style={[styles.chip, used && styles.used]} testID={`word-${tok}`}>
              <Text style={styles.chipText}>{tok.split("@@")[0]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
