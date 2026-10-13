// Design tokens for English Clash & Learn — a gamified, dark-first learning game.
// Values come from /app/design_guidelines.json. The app is always dark, so the
// dark palette lives in `light` (the default scheme) to avoid system switching.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // Surfaces (deep purple/night-blue gaming palette)
  surface: "#130B24",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#241744",
  onSurfaceSecondary: "#FFFFFF",
  surfaceTertiary: "#342261",
  onSurfaceTertiary: "#EAE4FD",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#130B24",
  muted: "#9687BC",

  // Brand — vivid yellow primary, neon green secondary, electric purple tertiary
  brand: "#FFE600",
  onBrand: "#332E00",
  brandPrimary: "#FFE600",
  onBrandPrimary: "#332E00",
  brandSecondary: "#00FF66",
  onBrandSecondary: "#003314",
  brandTertiary: "#9D00FF",
  onBrandTertiary: "#FFFFFF",

  // Status
  success: "#00FF66",
  onSuccess: "#003314",
  warning: "#FF9900",
  onWarning: "#331E00",
  error: "#FF1744",
  onError: "#FFFFFF",
  info: "#00E5FF",
  onInfo: "#00333A",

  // Lines
  border: "#342261",
  borderStrong: "#4F368F",
  divider: "#2A1B50",

  // Extra tactile-button shadow shades (darker variants for 3D bottom borders)
  brandPrimaryShadow: "#B39F00",
  brandSecondaryShadow: "#00B347",
  brandTertiaryShadow: "#6A00AD",
  surfaceSecondaryShadow: "#160D2B",
  errorShadow: "#B3002E",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 } as const;
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 } as const;
export const font = { display: "System", text: "System" } as const;
