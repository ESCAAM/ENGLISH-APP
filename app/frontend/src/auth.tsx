import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { api, loadToken, saveToken, clearToken, setTokenInMemory } from "@/src/api";

WebBrowser.maybeCompleteAuthSession();

export type User = {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  level: string | null;
  placement_done: boolean;
  coins: number;
  streak_count: number;
  inventory: Record<string, number>;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserLocal: (u: Partial<User>) => void;
};

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

const AUTH_BASE = "https://auth.emergentagent.com/?redirect=";

function extractSessionId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/[?#&]session_id=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const processed = useRef<Set<string>>(new Set());

  const exchangeSession = useCallback(async (sessionId: string) => {
    if (processed.current.has(sessionId)) return;
    processed.current.add(sessionId);
    const data = await api.post("/auth/session", { session_id: sessionId });
    await saveToken(data.session_token);
    setUser(data.user);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      await clearToken();
      setUser(null);
    }
  }, []);

  // Boot: process any session_id, then validate stored token
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "web") {
          const sid = extractSessionId(window.location.hash) || extractSessionId(window.location.search);
          if (sid) {
            try {
              await exchangeSession(sid);
              const url = new URL(window.location.href);
              url.hash = "";
              url.searchParams.delete("session_id");
              window.history.replaceState(window.history.state, "", url.toString());
            } catch {}
            setLoading(false);
            return;
          }
        } else {
          const initial = await Linking.getInitialURL();
          const sid = extractSessionId(initial);
          if (sid) {
            try {
              await exchangeSession(sid);
            } catch {}
            setLoading(false);
            return;
          }
        }
        await loadToken();
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [exchangeSession, refreshUser]);

  // Hot deep links (mobile)
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Linking.addEventListener("url", ({ url }) => {
      const sid = extractSessionId(url);
      if (sid) exchangeSession(sid).catch(() => {});
    });
    return () => sub.remove();
  }, [exchangeSession]);

  const login = useCallback(async () => {
    setSigningIn(true);
    try {
      if (Platform.OS === "web") {
        const redirect = window.location.origin + "/";
        window.location.href = AUTH_BASE + encodeURIComponent(redirect);
        return;
      }
      const redirect = Linking.createURL("");
      const authUrl = AUTH_BASE + encodeURIComponent(redirect);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
      let sid: string | null = null;
      if (result.type === "success" && (result as any).url) {
        sid = extractSessionId((result as any).url);
      }
      if (!sid) sid = extractSessionId(await Linking.getInitialURL());
      if (sid) await exchangeSession(sid);
    } finally {
      setSigningIn(false);
    }
  }, [exchangeSession]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    await clearToken();
    setTokenInMemory(null);
    setUser(null);
  }, []);

  const setUserLocal = useCallback((u: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...u } : prev));
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, signingIn, login, logout, refreshUser, setUserLocal }}>
      {children}
    </Ctx.Provider>
  );
}
