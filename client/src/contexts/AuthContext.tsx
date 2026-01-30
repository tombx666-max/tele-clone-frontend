import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services';
import type { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        authService.clearTokens();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.login(username, password);
      authService.saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      return false;
    }
  }, []);

  // Register
  const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.register(username, email, password);
      authService.saveTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.username}! Account created successfully.`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      return false;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

