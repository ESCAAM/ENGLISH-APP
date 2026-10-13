import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { Sword, MapTrifold, Storefront } from "phosphor-react-native";

import { usesNativeTabs } from "@/src/navigation";
import { useTheme } from "@/src/theme";

export default function TabsLayout() {
  const { colors } = useTheme();

  if (usesNativeTabs) {
    const { NativeTabs } = require("expo-router/unstable-native-tabs");
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="gamecontroller.fill" />
          <NativeTabs.Trigger.Label>Yarış</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="lessons">
          <NativeTabs.Trigger.Icon sf="map.fill" />
          <NativeTabs.Trigger.Label>Dersler</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="store">
          <NativeTabs.Trigger.Icon sf="cart.fill" />
          <NativeTabs.Trigger.Label>Mağaza</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopWidth: 2,
          borderTopColor: colors.borderStrong,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Yarış",
          tabBarIcon: ({ color, focused }) => <Sword color={color} weight={focused ? "fill" : "regular"} size={26} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "Dersler",
          tabBarIcon: ({ color, focused }) => <MapTrifold color={color} weight={focused ? "fill" : "regular"} size={26} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: "Mağaza",
          tabBarIcon: ({ color, focused }) => <Storefront color={color} weight={focused ? "fill" : "regular"} size={26} />,
        }}
      />
    </Tabs>
  );
}
