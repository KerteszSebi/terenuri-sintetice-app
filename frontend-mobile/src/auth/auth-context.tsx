import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

type AuthContextValue = {
  isLoggedIn: boolean | null;
  login: (token: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const AUTH_TOKEN_KEY = 'auth_token';
const REMEMBERED_AUTH_KEY = 'remember_auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const loadRememberedSession = async () => {
      const [token, rememberAuth] = await Promise.all([
        SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        SecureStore.getItemAsync(REMEMBERED_AUTH_KEY),
      ]);

      if (token && rememberAuth === 'true') {
        setIsLoggedIn(true);
        return;
      }

      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REMEMBERED_AUTH_KEY);
      setIsLoggedIn(false);
    };

    void loadRememberedSession();
  }, []);

  const login = async (token: string, rememberMe: boolean) => {
    if (rememberMe) {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      await SecureStore.setItemAsync(REMEMBERED_AUTH_KEY, 'true');
    } else {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REMEMBERED_AUTH_KEY);
    }

    setIsLoggedIn(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REMEMBERED_AUTH_KEY);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
