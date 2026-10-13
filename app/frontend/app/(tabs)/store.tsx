import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Scissors, Clock, Heart, Lightbulb, Coins } from "phosphor-react-native";

import { api } from "@/src/api";
import { useAuth } from "@/src/auth";
import { usesNativeTabs } from "@/src/navigation";
import { GameHeader } from "@/src/components/game-header";
import { TactileButton } from "@/src/components/tactile-button";
import { useToast } from "@/src/components/toast";
import { makeStyles, useTheme, spacing, radius } from "@/src/theme";
import { queryClient } from "@/src/query-client";

type Item = { id: string; name: string; desc: string; cost: number; icon: string };

const ICONS: Record<string, any> = { scissors: Scissors, clock: Clock, heart: Heart, lightbulb: Lightbulb };

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.surface },
  intro: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  introTitle: { color: c.onSurface, fontWeight: "900", fontSize: 22 },
  introSub: { color: c.muted, fontSize: 13, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.lg, gap: spacing.md },
  card: {
    width: "47%", backgroundColor: c.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 2, borderColor: c.border, alignItems: "center",
  },
  iconWrap: { width: 60, height: 60, borderRadius: radius.md, backgroundColor: c.surfaceTertiary, alignItems: "center", justifyContent: "center", borderBottomWidth: 4, borderColor: c.borderStrong },
  owned: { position: "absolute", top: spacing.sm, right: spacing.sm, backgroundColor: c.brandTertiary, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  ownedText: { color: c.onBrandTertiary, fontWeight: "900", fontSize: 11 },
  name: { color: c.onSurface, fontWeight: "900", fontSize: 15, marginTop: spacing.md, textAlign: "center" },
  desc: { color: c.muted, fontSize: 11, textAlign: "center", marginTop: 2, marginBottom: spacing.md, minHeight: 30 },
  costRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing.md },
  costText: { color: c.brand, fontWeight: "900", fontSize: 16 },
  center: { padding: spacing["3xl"], alignItems: "center" },
}));

export default function StoreTab() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [buying, setBuying] = useState<string | null>(null);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const { data, isLoading } = useQuery({ queryKey: ["store"], queryFn: () => api.get("/store/items") });
  const items: Item[] = data?.items || [];
  const inventory: Record<string, number> = user?.inventory || {};

  const buy = async (item: Item) => {
    if ((user?.coins || 0) < item.cost) {
      toast.show("Yetersiz coin! Maç kazanarak coin topla 💪", "error");
      return;
    }
    setBuying(item.id);
    try {
      await api.post("/store/buy", { joker_id: item.id, quantity: 1 });
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["store"] });
      toast.show(`${item.name} satın alındı!`, "success");
    } catch (e: any) {
      toast.show(e.message || "Hata", "error");
    } finally {
      setBuying(null);
    }
  };

  return (
    <View style={styles.root}>
      <GameHeader />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brand} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl, paddingTop: spacing.sm }} showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={styles.introTitle}>Joker Mağazası 🛒</Text>
            <Text style={styles.introSub}>Coin'lerini harca, maçlarda avantaj kazan! (Maç başına en fazla 2 joker)</Text>
          </View>
          <View style={styles.grid}>
            {items.map((item) => {
              const Icon = ICONS[item.icon] || Lightbulb;
              const count = inventory[item.id] || 0;
              return (
                <View key={item.id} style={styles.card} testID={`store-item-${item.id}`}>
                  {count > 0 ? (
                    <View style={styles.owned}>
                      <Text style={styles.ownedText}>x{count}</Text>
                    </View>
                  ) : null}
                  <View style={styles.iconWrap}>
                    <Icon color={colors.brandSecondary} weight="fill" size={30} />
                  </View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                  <View style={styles.costRow}>
                    <Coins color={colors.brand} weight="fill" size={16} />
                    <Text style={styles.costText}>{item.cost}</Text>
                  </View>
                  <TactileButton testID={`buy-${item.id}`} label="Satın Al" small variant="primary" loading={buying === item.id} onPress={() => buy(item)} style={{ alignSelf: "stretch" }} />
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
