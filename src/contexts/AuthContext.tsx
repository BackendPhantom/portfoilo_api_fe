/* ============================================
   Devfolio — Auth Context & Provider
   ============================================ */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";
import { startRefreshHeartbeat, stopRefreshHeartbeat } from "@/lib/api";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token";
import type { User, LoginPayload, SignupPayload, AuthTokens } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  storeTokens: (tokens: AuthTokens) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>("/users/me/");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("[Auth] fetchUser ✗ error:", err);
      // Don't clear tokens here — caller decides what to do
      throw err;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // On mount, check for existing token and start refresh timer
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      startRefreshHeartbeat();
      // Try to restore user from localStorage first (instant UI)
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          /* corrupted — will re-fetch */
        }
      }
      fetchUser()
        .catch(() => {
          // /users/me/ may 403 — keep cached user if we have one
          if (!cached) {
            clearTokens();
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post("/auth/login/", payload);

      // dj-rest-auth may return access/refresh OR access_token/refresh_token
      const access: string | undefined =
        data.access ?? data.access_token ?? undefined;
      const refresh: string | undefined =
        data.refresh ?? data.refresh_token ?? undefined;

      if (!access || !refresh) {
        console.error(
          "[Auth] login response missing tokens. Full response:",
          data
        );
        throw new Error(
          "Login succeeded but no tokens received. Check backend JWT config."
        );
      }

      setTokens(access, refresh);
      startRefreshHeartbeat();

      // dj-rest-auth may return the user object inline — set it for instant UI
      if (data.user) {
        const u = data.user as User;
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      }

      // Always fetch the authoritative profile after login to ensure
      // fields like `email_verified` are up-to-date.
      await fetchUser();
    },
    [fetchUser]
  );

  const signup = useCallback(async (payload: SignupPayload) => {
    await api.post("/auth/signup/", payload);
  }, []);

  const logout = useCallback(async () => {
    stopRefreshHeartbeat();
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const storeTokens = useCallback(
    async (tokens: AuthTokens) => {
      console.log("[Auth] storeTokens — saving tokens to localStorage");
      setTokens(tokens.access, tokens.refresh);
      startRefreshHeartbeat();
      console.log("[Auth] storeTokens — fetching user profile…");
      await fetchUser(); // throws if /auth/user/ fails
      console.log("[Auth] storeTokens ✓ complete");
    },
    [fetchUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        storeTokens,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
