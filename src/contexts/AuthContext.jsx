import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await authApi.me();
      setUser(u);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  }, []);

  const registerUser = useCallback(async (data) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => loadUser(), [loadUser]);

  const value = {
    user,
    loading,
    login,
    register: registerUser,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
