import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, login as loginRequest } from "../services/authService";
import { clearAuthStorage, getAccessToken, getStoredUser, setAccessToken, setStoredUser } from "../services/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setToken] = useState(getAccessToken());
  const [user, setUser] = useState(getStoredUser());

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken("");
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!getAccessToken()) {
      return null;
    }

    try {
      const me = await fetchMe();
      setUser(me);
      setStoredUser(me);
      return me;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!token) {
        if (mounted) {
          setAuthLoading(false);
        }
        return;
      }

      await refreshProfile();
      if (mounted) {
        setAuthLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [refreshProfile, token]);

  const login = useCallback(async (email, password) => {
    const result = await loginRequest({ email, password });
    const nextToken = result?.accessToken || "";
    const nextUser = result?.user || null;

    if (!nextToken || !nextUser) {
      throw new Error("Login response tidak lengkap.");
    }

    setAccessToken(nextToken);
    setStoredUser(nextUser);
    setToken(nextToken);
    setUser(nextUser);

    return nextUser;
  }, []);

  const value = useMemo(() => {
    const role = user?.role || "viewer";

    return {
      authLoading,
      token,
      user,
      role,
      isAuthenticated: Boolean(token),
      isAdmin: role === "admin",
      login,
      logout,
      refreshProfile,
    };
  }, [authLoading, login, logout, refreshProfile, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
