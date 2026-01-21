import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { User } from '../contexts/AuthContext';
import { supabase } from './supabase';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

// ==================== INITIALIZATION ====================

// Inicializar admin user en Supabase Auth al cargar
async function initializeAdminUser() {
  try {
    console.log('🔧 Initializing admin user in Supabase Auth...');
    const response = await fetch(`${API_URL}/auth/init-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to initialize admin:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Admin user initialized in Supabase Auth:', data);
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
  }
}

// Llamar la inicialización
initializeAdminUser();

// ==================== AUTHENTICATION ====================

export async function login(email: string, password: string): Promise<User> {
  try {
    console.log('🔐 LOGIN - Intentando autenticar con Supabase Auth:');
    console.log('  - Email:', email.trim());
    
    // Limpiar espacios en blanco
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    
    // Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });
    
    if (signInError) {
      console.error('❌ Login failed:', signInError.message);
      throw new Error('Correo electrónico o contraseña incorrectos');
    }
    
    if (!authData.user || !authData.session) {
      throw new Error('Error al obtener datos de usuario');
    }
    
    console.log('✅ Login successful con Supabase Auth');
    
    // Get user metadata
    const { name, role, swimmerId } = authData.user.user_metadata || {};
    
    // Si el usuario es nadador, buscar o crear su ficha
    let finalSwimmerId = swimmerId;
    
    if (role === 'swimmer') {
      try {
        console.log('🏊‍♂️ Buscando ficha de nadador...');
        const swimmerResponse = await fetch(`${API_URL}/swimmers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (swimmerResponse.ok) {
          const data = await swimmerResponse.json();
          const swimmers = data.swimmers || [];
          
          // Buscar nadador por email
          const swimmer = swimmers.find((s: any) => s.email === cleanEmail);
          
          if (swimmer) {
            finalSwimmerId = swimmer.id;
            console.log('✅ Ficha de nadador encontrada:', finalSwimmerId);
          } else {
            console.warn('⚠️ No se encontró ficha de nadador, creando automáticamente...');
            
            // Crear ficha de nadador automáticamente
            const today = new Date();
            const defaultBirthYear = today.getFullYear() - 25;
            const defaultDateOfBirth = `${defaultBirthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const swimmerData = {
              name: name || cleanEmail,
              email: cleanEmail,
              rut: '00.000.000-0',
              gender: 'Masculino' as const,
              dateOfBirth: defaultDateOfBirth,
              schedule: '7am' as const,
              joinDate: new Date().toISOString().split('T')[0],
              personalBests: [],
              personalBestsHistory: [],
              goals: [],
            };
            
            const createResponse = await fetch(`${API_URL}/swimmers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify(swimmerData)
            });
            
            if (createResponse.ok) {
              const result = await createResponse.json();
              finalSwimmerId = result.swimmer.id;
              console.log('✅ Ficha de nadador creada automáticamente:', finalSwimmerId);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al buscar/crear ficha de nadador:', error);
      }
    }
    
    const userData: User = {
      id: authData.user.id,
      email: authData.user.email!,
      name: name || authData.user.email!,
      role: role || 'swimmer',
      swimmerId: finalSwimmerId,
    };
    
    console.log('✅ Login successful:', userData);
    return userData;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

export async function signup(
  email: string, 
  password: string, 
  name: string, 
  role: 'admin' | 'swimmer' | 'coach',
  swimmerId?: string
): Promise<User & { initialPassword: string }> {
  try {
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    
    console.log('🔐 SIGNUP - Creando usuario vía servidor (Supabase Auth)');
    console.log('  - Email:', cleanEmail);
    console.log('  - Nombre:', cleanName);
    console.log('  - Rol:', role);
    
    // Crear usuario en Supabase Auth vía servidor
    const response = await fetch(`${API_URL}/auth/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        email: cleanEmail,
        name: cleanName,
        role,
        swimmerId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo crear el usuario');
    }
    
    const { user: createdUser, password: generatedPassword } = await response.json();
    console.log('✅ Usuario creado en Supabase Auth:', createdUser.id);
    
    // Si el rol es 'swimmer', crear automáticamente la ficha del nadador
    let createdSwimmerId = swimmerId;
    
    if (role === 'swimmer') {
      try {
        console.log('🏊‍♂️ Creando ficha de nadador automáticamente...');
        
        const today = new Date();
        const defaultBirthYear = today.getFullYear() - 25;
        const defaultDateOfBirth = `${defaultBirthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const swimmerData = {
          name: cleanName,
          email: cleanEmail,
          gender: 'Masculino',
          dateOfBirth: defaultDateOfBirth,
          schedule: '7am',
          joinDate: new Date().toISOString().split('T')[0],
          personalBests: [],
          personalBestsHistory: [],
          goals: [],
        };
        
        const swimmerResponse = await fetch(`${API_URL}/swimmers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(swimmerData)
        });
        
        if (swimmerResponse.ok) {
          const result = await swimmerResponse.json();
          createdSwimmerId = result.swimmer.id;
          console.log('✅ Ficha de nadador creada exitosamente:', createdSwimmerId);
        }
      } catch (swimmerError) {
        console.error('❌ Error al crear ficha de nadador:', swimmerError);
      }
    }
    
    const userData: User & { initialPassword: string } = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      swimmerId: createdSwimmerId,
      initialPassword: generatedPassword,
    };
    
    console.log('✅ Signup successful');
    return userData;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      throw error;
    }
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
}

// Función helper para verificar si un email ya existe
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // Verificar en Supabase Auth (requiere admin API, no disponible desde cliente)
    // Por ahora, intentar login y ver si falla
    return false;
  } catch (error) {
    return false;
  }
}

// ==================== SESSION MANAGEMENT ====================

// Supabase Auth maneja las sesiones automáticamente
// Estas funciones están deprecadas y solo se mantienen por compatibilidad

export function saveSession(user: User): void {
  // Deprecated: Supabase Auth maneja esto automáticamente con persistSession: true
  console.log('ℹ️ Session saved automatically by Supabase Auth');
}

export async function getSession(): Promise<User | null> {
  // Obtener sesión actual de Supabase Auth
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return null;
    }
    
    const { name, role, swimmerId } = session.user.user_metadata || {};
    
    return {
      id: session.user.id,
      email: session.user.email!,
      name: name || session.user.email!,
      role: role || 'swimmer',
      swimmerId: swimmerId,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export function clearSession(): void {
  // Deprecated: Supabase Auth maneja esto con signOut()
  console.log('ℹ️ Session cleared automatically by Supabase Auth');
}

// ==================== DEBUGGING UTILITIES ====================

export async function debugListAllUsers() {
  console.log('🔍 DEBUG - Listando todos los usuarios desde Supabase Auth:');
  
  try {
    // Note: Este endpoint requiere permisos de admin en el servidor
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (response.ok) {
      const { users } = await response.json();
      console.log(`📊 TOTAL: ${users.length} usuarios`);
      users.forEach((u: any) => {
        console.log(`  - Email: "${u.email}" | Role: ${u.role}`);
      });
      return { users };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
  
  return { users: [] };
}

export async function debugClearRegisteredUsers() {
  // Esta función ya no hace nada porque los usuarios están en Supabase Auth
  // Para administrar usuarios, usa el panel de Usuarios en la aplicación
  console.warn('⚠️ Esta función ya no está disponible. Los usuarios están en Supabase Auth.');
  return;
}