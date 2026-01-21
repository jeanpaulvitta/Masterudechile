import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../services/auth';
import { supabase } from '../services/supabase';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

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
    console.log('🔧 AuthProvider: Initializing...');
    
    // Inicializar inmediatamente en caso de error
    const initAuth = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('❌ Error during init:', error);
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Usuario inició sesión - actualizar estado con datos del usuario
        await updateUserState(session.user);
      } else if (event === 'SIGNED_OUT') {
        // Usuario cerró sesión
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token renovado - actualizar usuario
        await updateUserState(session.user);
      }
      
      setLoading(false);
    });
    
    // Cleanup al desmontar
    return () => {
      console.log('🔧 AuthProvider: Cleaning up...');
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Helper para actualizar el estado del usuario desde Supabase User
  const updateUserState = async (authUser: any) => {
    try {
      const { name, role, swimmerId } = authUser.user_metadata || {};
      
      // Si es nadador, verificar/obtener swimmerId
      let finalSwimmerId = swimmerId;
      if (role === 'swimmer') {
        try {
          const swimmerResponse = await fetch(`${API_URL}/swimmers`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          });
          if (swimmerResponse.ok) {
            const data = await swimmerResponse.json();
            const swimmer = data.swimmers?.find((s: any) => s.email === authUser.email);
            if (swimmer) {
              finalSwimmerId = swimmer.id;
            }
          }
        } catch (error) {
          console.error('Error fetching swimmer:', error);
        }
      }
      
      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: name || authUser.email!,
        role: role || 'swimmer',
        swimmerId: finalSwimmerId,
      });
    } catch (error) {
      console.error('Error updating user state:', error);
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('✅ Session found for:', session.user.email);
        await updateUserState(session.user);
      } else {
        console.log('No active session found');
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
      // No necesitamos saveSession porque Supabase Auth lo maneja automáticamente
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
      // No necesitamos clearSession porque Supabase Auth lo maneja con signOut()
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
      const initialPassword = userData.initialPassword;
      const userToSave: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        swimmerId: userData.swimmerId,
      };
      
      setUser(userToSave);
      // Supabase Auth maneja la sesión automáticamente
      
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
      const initialPassword = userData.initialPassword;
      
      // NO llamamos a setUser() - el admin sigue logueado
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