import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
export const TOKEN_KEY = "ecl_session_token";

let token: string | null = null;

export function setTokenInMemory(t: string | null) {
  token = t;
}

export async function loadToken(): Promise<string | null> {
  token = await storage.secureGet<string | null>(TOKEN_KEY, null);
  return token;
}

export async function saveToken(t: string) {
  token = t;
  await storage.secureSet(TOKEN_KEY, t);
}

export async function clearToken() {
  token = null;
  await storage.secureRemove(TOKEN_KEY);
}

async function request(path: string, opts: { method?: string; body?: any } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      detail = j.detail || detail;
    } catch {}
    const err: any = new Error(typeof detail === "string" ? detail : "Request failed");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  get: (p: string) => request(p),
  post: (p: string, body?: any) => request(p, { method: "POST", body: body || {} }),
};
