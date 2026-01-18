import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../services/auth';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'swimmer' | 'coach';
  swimmerId?: string; // ID del nadador si el usuario es un nadador
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'admin' | 'swimmer' | 'coach', swimmerId?: string) => Promise<{ email: string; password: string }>;
  createUserAccount: (email: string, name: string, role: 'admin' | 'swimmer' | 'coach') => Promise<{ email: string; password: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

AuthContext.displayName = 'AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada al cargar
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = authApi.getSession();
      if (session) {
        setUser(session);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authApi.login(email, password);
      setUser(userData);
      authApi.saveSession(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      authApi.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'admin' | 'swimmer' | 'coach',
    swimmerId?: string
  ): Promise<{ email: string; password: string }> => {
    try {
      setLoading(true);
      const userData = await authApi.signup(email, password, name, role, swimmerId);
      // Guardamos usuario sin el initialPassword
      const initialPassword = (userData as any).initialPassword;
      const userToSave: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        swimmerId: userData.swimmerId,
      };
      setUser(userToSave);
      authApi.saveSession(userToSave);
      // Retornamos las credenciales para mostrarlas al usuario
      return { email: userData.email, password: initialPassword };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createUserAccount = async (
    email: string, 
    name: string, 
    role: 'admin' | 'swimmer' | 'coach'
  ): Promise<{ email: string; password: string }> => {
    try {
      setLoading(true);
      // Crear cuenta SIN iniciar sesión automáticamente
      const userData = await authApi.signup(email, '', name, role, undefined);
      const initialPassword = (userData as any).initialPassword;
      
      // NO llamamos a setUser() ni saveSession() - el admin sigue logueado
      // Solo retornamos las credenciales para mostrarlas
      return { email: userData.email, password: initialPassword };
    } catch (error) {
      console.error('Create user account error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, createUserAccount }}>
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