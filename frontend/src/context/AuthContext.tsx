import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { LoginRequest, RegisterRequest } from '../types/auth.types';
import * as authService from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    async login(data: LoginRequest) {
      await authService.login(data);
      setIsAuthenticated(true);
    },
    async register(data: RegisterRequest) {
      await authService.register(data);
    },
    logout() {
      authService.logout();
      setIsAuthenticated(false);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext doit etre utilise dans un AuthProvider');
  }

  return context;
}
