import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, UserRole } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  promoteUser: (username: string, newRole: UserRole) => Promise<void>;
  logAction: (action: string, details: Record<string, any>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const validUser = await authService.validateSession();
        setUser(validUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('grade-mixer-session-token') || '';
      await authService.logout(user.id, token);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user]);

  const promoteUser = useCallback(async (username: string, newRole: UserRole) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Only admins can promote users');
    }
    await authService.promoteUser(username, newRole);
    await authService.logAction(user.id, 'promote_user', { username, newRole });
  }, [user]);

  const logAction = useCallback(async (action: string, details: Record<string, any>) => {
    if (!user) return;
    await authService.logAction(user.id, action, details);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      promoteUser,
      logAction
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
