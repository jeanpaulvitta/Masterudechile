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

  const buildUserFromMetadata = (authUser: any): User => {
    const { name, role, swimmerId } = authUser.user_metadata || {};
    return {
      id: authUser.id,
      email: authUser.email!,
      name: name || authUser.email!,
      role: role || 'swimmer',
      swimmerId,
    };
  };

  // Resuelve el swimmerId para usuarios tipo 'swimmer' que no lo tienen en metadata.
  // Solo se llama una vez en SIGNED_IN, no en cada token refresh.
  const resolveSwimmerId = async (authUser: any): Promise<string | undefined> => {
    const { swimmerId } = authUser.user_metadata || {};
    if (swimmerId) return swimmerId;
    try {
      const res = await fetch(`${API_URL}/swimmers`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return data.swimmers?.find((s: any) => s.email === authUser.email)?.id;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    let initialized = false;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Primera carga — tomamos la sesión del listener en lugar de llamar getSession()
        // para evitar la race condition con checkSession.
        initialized = true;
        if (session?.user) {
          const baseUser = buildUserFromMetadata(session.user);
          setUser(baseUser);
          // Si es nadador sin swimmerId, buscarlo en background sin bloquear la UI
          if (baseUser.role === 'swimmer' && !baseUser.swimmerId) {
            resolveSwimmerId(session.user).then(id => {
              if (id) setUser(u => u ? { ...u, swimmerId: id } : u);
            });
          }
        }
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const baseUser = buildUserFromMetadata(session.user);
        if (baseUser.role === 'swimmer' && !baseUser.swimmerId) {
          const id = await resolveSwimmerId(session.user);
          setUser({ ...baseUser, swimmerId: id });
        } else {
          setUser(baseUser);
        }
        setLoading(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Solo actualizar metadata, no volver a fetchear nadadores
        setUser(prev => prev ? { ...prev, ...buildUserFromMetadata(session.user) } : null);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    // Fallback: si onAuthStateChange no dispara INITIAL_SESSION en 3s
    const fallback = setTimeout(async () => {
      if (!initialized) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(buildUserFromMetadata(session.user));
          }
        } catch {}
        setLoading(false);
      }
    }, 3000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authApi.login(email, password);
      // onAuthStateChange(SIGNED_IN) actualizará el usuario automáticamente
    } catch (error) {
      throw error;
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