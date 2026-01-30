import { apiCall } from './api';
import type { AppUser } from '../types';

export interface LoginResponse {
  message: string;
  user: AppUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  user: AppUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Login user
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  },

  // Register user
  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  // Logout user
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('telegramApiId');
    localStorage.removeItem('telegramApiHash');
  },

  // Get current user
  async getCurrentUser(): Promise<AppUser | null> {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }

    try {
      const response = await apiCall('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Save tokens to localStorage
  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // Clear tokens from localStorage
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Check if user has access token
  hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
