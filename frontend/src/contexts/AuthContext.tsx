import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserResponse, TokenResponse } from '../api';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showWelcome: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  corsError: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [corsError, setCorsError] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Проверяем сохраненный токен при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUserData = localStorage.getItem('user_data');
      
      if (savedToken) {
        // Сначала пытаемся восстановить пользователя из localStorage
        if (savedUserData) {
          try {
            const userData = JSON.parse(savedUserData);
            setToken(savedToken);
            setUser(userData);
            console.log('User restored from localStorage:', userData);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('user_data');
          }
        }
        
        // Если данных пользователя нет в localStorage, загружаем с API
        try {
          setToken(savedToken);
          const { getCurrentUser } = await import('../api');
          const userData = await getCurrentUser(savedToken);
          setUser(userData);
          localStorage.setItem('user_data', JSON.stringify(userData));
          console.log('User restored from API:', userData);
        } catch (error) {
          console.error('Error restoring user from token:', error);
          // Если токен недействителен, удаляем его
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCorsError(false);
      
      const { loginUser, getCurrentUser } = await import('../api');
      const tokenData: TokenResponse = await loginUser({ username: email, password });
      
      setToken(tokenData.access_token);
      localStorage.setItem('auth_token', tokenData.access_token);
      
      // Загружаем данные пользователя
      const userData = await getCurrentUser(tokenData.access_token);
      setUser(userData);
      
      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Показываем экран приветствия
      setShowWelcome(true);
      
      // Автоматически скрываем экран приветствия через 2 секунды
      setTimeout(() => {
        setShowWelcome(false);
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа в систему';
      setError(errorMessage);
      
      // Проверяем на CORS ошибку
      if (errorMessage.includes('CORS не настроен')) {
        setCorsError(true);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    setCorsError(false);
    setShowWelcome(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    showWelcome,
    login,
    logout,
    error,
    corsError
  };

  return (
    <AuthContext.Provider value={value}>
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
