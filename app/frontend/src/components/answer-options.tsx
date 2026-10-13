import React from "react";
import { Pressable, Text, View } from "react-native";
import { Check, X } from "phosphor-react-native";

import { makeStyles, useTheme, radius, spacing } from "@/src/theme";

type Props = {
  options: string[];
  eliminated?: string[];
  selected?: string | null;
  correctAnswer?: string;
  revealed?: boolean;
  disabled?: boolean;
  onSelect: (opt: string) => void;
};

const useStyles = makeStyles((c) => ({
  wrap: { gap: spacing.md },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: c.surfaceSecondary,
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  optText: { color: c.onSurfaceSecondary, fontSize: 16, fontWeight: "700", flex: 1 },
  hidden: { opacity: 0, height: 0, paddingVertical: 0, marginVertical: 0, minHeight: 0, overflow: "hidden" },
}));

export function AnswerOptions({ options, eliminated = [], selected, correctAnswer, revealed, disabled, onSelect }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {options.map((opt, i) => {
        const isEliminated = eliminated.includes(opt);
        const isSelected = selected === opt;
        const isCorrect = correctAnswer === opt;
        let borderColor = colors.border;
        let bg = colors.surfaceSecondary;
        let textColor = colors.onSurfaceSecondary;
        if (revealed) {
          if (isCorrect) {
            borderColor = colors.success;
            bg = colors.success;
            textColor = colors.onSuccess;
          } else if (isSelected) {
            borderColor = colors.error;
            bg = colors.error;
            textColor = colors.onError;
          }
        } else if (isSelected) {
          borderColor = colors.brand;
        }
        return (
          <Pressable
            key={`${opt}-${i}`}
            testID={`answer-option-${i}`}
            disabled={disabled || isEliminated || revealed}
            onPress={() => onSelect(opt)}
            style={[styles.opt, { borderColor, backgroundColor: bg }, isEliminated && styles.hidden]}
          >
            <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
            {revealed && isCorrect ? <Check color={colors.onSuccess} weight="bold" size={22} /> : null}
            {revealed && isSelected && !isCorrect ? <X color={colors.onError} weight="bold" size={22} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
