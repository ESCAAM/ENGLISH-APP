import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme, radius, spacing } from "@/src/theme";

type ToastType = "info" | "success" | "error" | "announce";
type ToastCtx = { show: (msg: string, type?: ToastType) => void };

const Ctx = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>("info");
  const timer = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const show = useCallback((m: string, t: ToastType = "info") => {
    setMsg(m);
    setType(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2400);
  }, []);

  const bg =
    type === "success" ? colors.success : type === "error" ? colors.error : type === "announce" ? colors.brandTertiary : colors.surfaceInverse;
  const fg =
    type === "success" ? colors.onSuccess : type === "error" ? colors.onError : type === "announce" ? colors.onBrandTertiary : colors.onSurfaceInverse;

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {msg ? (
        <Animated.View
          entering={FadeInUp.springify()}
          exiting={FadeOutUp}
          pointerEvents="none"
          style={[styles.toast, { top: insets.top + 8, backgroundColor: bg }]}
        >
          <Text testID="toast-message" style={[styles.text, { color: fg }]}>{msg}</Text>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
    alignItems: "center",
  },
  text: { fontWeight: "800", fontSize: 14, textAlign: "center" },
});
