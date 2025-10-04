/**
 * Client-side authentication utilities
 * These functions work in browser environments and don't require Node.js dependencies
 */

import type { User } from '@dataroom/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Token storage utilities for client-side
 */
export const tokenStorage = {
  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  /**
   * Set token in localStorage
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  },

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
  },

  /**
   * Check if token exists in localStorage
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
};

/**
 * Parse JWT token payload (client-side, no verification)
 * @param token JWT token
 * @returns Parsed token payload or null
 */
export const parseTokenPayload = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired (client-side)
 * @param token JWT token
 * @returns true if expired
 */
export const isTokenExpiredClient = (token: string): boolean => {
  const payload = parseTokenPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }
  return Date.now() >= payload.exp * 1000;
};

/**
 * Get user from token (client-side)
 * @param token JWT token
 * @returns User object or null
 */
export const getUserFromToken = (token: string): User | null => {
  const payload = parseTokenPayload(token);
  if (!payload) return null;
  
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role as 'admin' | 'user',
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString()
  };
};

/**
 * Create authorization header value
 * @param token JWT token
 * @returns Authorization header value
 */
export const createAuthHeader = (token: string): string => {
  return `Bearer ${token}`;
};

/**
 * User storage utilities for client-side
 */
export const userStorage = {
  /**
   * Get user from localStorage
   */
  get(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set user in localStorage
   */
  set(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userData', JSON.stringify(user));
  },

  /**
   * Remove user from localStorage
   */
  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('userData');
  }
};

/**
 * Get current auth state (client-side)
 * @returns Current authentication state
 */
export const getAuthState = (): AuthState => {
  const token = tokenStorage.getToken();
  
  if (!token || isTokenExpiredClient(token)) {
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
  
  const user = getUserFromToken(token);
  
  return {
    user,
    token,
    isAuthenticated: !!user
  };
};