import React from "react";
import { View, Text } from "react-native";
import { Coins } from "phosphor-react-native";

import { makeStyles, useTheme, radius, spacing } from "@/src/theme";

const useStyles = makeStyles((c) => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.surfaceTertiary,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: c.borderStrong,
  },
  text: { color: c.brand, fontWeight: "900", fontSize: 15 },
}));

export function CoinBadge({ coins, testID }: { coins: number; testID?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.chip} testID={testID}>
      <Coins color={colors.brand} weight="fill" size={18} />
      <Text style={styles.text}>{coins}</Text>
    </View>
  );
}
