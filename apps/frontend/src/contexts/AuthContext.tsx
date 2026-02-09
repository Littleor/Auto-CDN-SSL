import React from "react";
import { apiRequest } from "@/lib/api";

const ACCESS_TOKEN_KEY = "auto_ssl_access_token";
const REFRESH_TOKEN_KEY = "auto_ssl_refresh_token";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [ready, setReady] = React.useState(false);

  const saveTokens = React.useCallback((access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setAccessToken(access);
  }, []);

  const clearTokens = React.useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
  }, []);

  const fetchMe = React.useCallback(
    async (token: string) => {
      const data = await apiRequest<{ userId: string; email: string }>(
        "/auth/me",
        {},
        token
      );
      setUser({ id: data.userId, email: data.email });
    },
    []
  );

  const refresh = React.useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;
    try {
      const data = await apiRequest<{ accessToken: string }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken })
      });
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      setAccessToken(data.accessToken);
      await fetchMe(data.accessToken);
      return true;
    } catch {
      clearTokens();
      return false;
    }
  }, [clearTokens, fetchMe]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setUser(data.user);
      saveTokens(data.accessToken, data.refreshToken);
    },
    [saveTokens]
  );

  const register = React.useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiRequest<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      setUser(data.user);
      saveTokens(data.accessToken, data.refreshToken);
    },
    [saveTokens]
  );

  const logout = React.useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken })
      });
    }
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  React.useEffect(() => {
    const init = async () => {
      if (accessToken) {
        try {
          await fetchMe(accessToken);
        } catch {
          await refresh();
        }
      } else {
        await refresh();
      }
      setReady(true);
    };
    init();
  }, [accessToken, fetchMe, refresh]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, ready, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
