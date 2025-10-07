"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface Subscription {
  status: string;
  currentPeriodEnd?: Date;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  isPro: boolean;
  token?: string;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSubscription(data.subscription);
        setIsPro(data.isPro);
      } else {
        setUser(null);
        setSubscription(null);
        setIsPro(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setSubscription(null);
      setIsPro(false);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);


  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSubscription(null);
      setIsPro(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      subscription, 
      isPro, 
      logout, 
      loading, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}