import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/client';
import { loginRequest, registerRequest } from '../api/auth';
import { User } from '../types';

const STORAGE_KEY = 'citizens-reporting/auth';

interface StoredAuth {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored: StoredAuth = JSON.parse(raw);
          setAuthToken(stored.token);
          setToken(stored.token);
          setUser(stored.user);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function persist(stored: StoredAuth) {
    setAuthToken(stored.token);
    setToken(stored.token);
    setUser(stored.user);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  async function login(email: string, password: string) {
    const res = await loginRequest(email, password);
    await persist({ token: res.accessToken, user: res.user });
  }

  async function register(name: string, email: string, password: string) {
    const res = await registerRequest(name, email, password);
    await persist({ token: res.accessToken, user: res.user });
  }

  async function logout() {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
