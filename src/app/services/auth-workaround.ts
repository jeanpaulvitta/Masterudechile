import { supabase } from '../services/supabase';
import type { User } from '../contexts/AuthContext';

// ==================== WORKAROUND TEMPORAL ====================
// Este archivo proporciona funciones alternativas que NO requieren
// configuración del servidor hasta que se solucione el problema
// de variables de entorno en la Edge Function

const ADMIN_EMAIL = 'admin@uch.cl';
const ADMIN_PASSWORD = 'admin123';

/**
 * Crea el usuario admin directamente desde el cliente usando Supabase Auth
 * NOTA: Esto solo funciona si el usuario ya no existe
 */
export async function createAdminDirectly(): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    console.log('🔧 Creating admin user directly...');
    
    // Intentar crear usuario admin
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          name: 'Administrador UCH',
          role: 'admin'
        }
      }
    });
    
    if (error) {
      // Si el error es que el usuario ya existe, intentar login
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('✅ Admin user already exists, trying to login...');
        return { 
          success: true, 
          message: 'Admin user already exists. You can now login with admin@uch.cl / admin123' 
        };
      }
      
      throw error;
    }
    
    console.log('✅ Admin user created successfully!');
    return {
      success: true,
      message: 'Admin user created successfully! You can now login with admin@uch.cl / admin123',
      user: data.user
    };
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verifica si el usuario admin existe intentando hacer login
 */
export async function checkAdminExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (data.user) {
      // Admin existe y el password es correcto
      await supabase.auth.signOut(); // Cerrar sesión inmediatamente
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Lista todos los usuarios usando la API del servidor
 * (requiere que el servidor esté configurado correctamente)
 */
export async function listUsersViaServer(): Promise<any[]> {
  try {
    const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9/users`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to list users');
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}

/**
 * Instrucciones para el usuario sobre cómo configurar Supabase
 */
export const SETUP_INSTRUCTIONS = `
🔧 CONFIGURACIÓN REQUERIDA:

El sistema necesita que configures las variables de entorno en Supabase:

1. Ve a: https://supabase.com/dashboard/project/rztiyofwhlwvofwhcgue/settings/edge-functions

2. En la sección "Configuration", agrega:
   - SUPABASE_URL: https://rztiyofwhlwvofwhcgue.supabase.co
   - SUPABASE_SERVICE_ROLE_KEY: [tu service role key]

3. Para obtener el SERVICE_ROLE_KEY:
   - Ve a Settings → API
   - Copia el valor de "service_role" (NO el anon public)

4. Después de configurar, re-despliega la función:
   supabase functions deploy server

5. Verifica que funcione:
   - Abre /diagnostico.html
   - Ejecuta "Ejecutar Todos los Tests"

---

WORKAROUND TEMPORAL:

Mientras tanto, puedes:
1. Hacer clic en "Crear Admin Directo" abajo
2. Esto creará el usuario admin@uch.cl sin usar el servidor
3. Podrás hacer login normalmente
`;
