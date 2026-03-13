import { useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout } from '@/lib/api';

const TOKEN_KEY = 'medq-token';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const isAuthenticated = Boolean(token);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // still clear local state on error
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, isAuthenticated, login, logout };
}
