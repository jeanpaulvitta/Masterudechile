import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { User } from '../contexts/AuthContext';

const SESSION_KEY = 'natacion_master_session';
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

// ==================== INITIALIZATION ====================

// Inicializar admin user en Supabase al cargar
async function initializeAdminUser() {
  try {
    await fetch(`${API_URL}/users/init-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    console.log('✅ Admin user initialized in Supabase');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Llamar la inicialización
initializeAdminUser();

// ==================== AUTHENTICATION ====================

export async function login(email: string, password: string): Promise<User> {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Limpiar espacios en blanco de las credenciales
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    
    console.log('🔐 LOGIN - Intentando autenticar:');
    console.log('  - Email:', cleanEmail);
    console.log('  - Password length:', cleanPassword.length);
    
    // Buscar usuario en Supabase
    const response = await fetch(`${API_URL}/users/find-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email: cleanEmail })
    });
    
    if (!response.ok) {
      console.error('❌ No se encontró usuario con estas credenciales');
      throw new Error('Correo electrónico o contraseña incorrectos');
    }
    
    const { user } = await response.json();
    
    // Verificar contraseña
    if (user.password !== cleanPassword) {
      console.error('❌ Contraseña incorrecta');
      throw new Error('Correo electrónico o contraseña incorrectos');
    }
    
    let swimmerId: string | undefined = undefined;
    
    // Si el usuario es nadador, buscar su ficha
    if (user.role === 'swimmer') {
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
            swimmerId = swimmer.id;
            console.log('✅ Ficha de nadador encontrada:', swimmerId);
          } else {
            console.warn('⚠️ No se encontró ficha de nadador, creando automáticamente...');
            
            // Crear ficha de nadador automáticamente
            const today = new Date();
            const defaultBirthYear = today.getFullYear() - 25;
            const defaultDateOfBirth = `${defaultBirthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const swimmerData = {
              name: user.name,
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
              swimmerId = result.swimmer.id;
              console.log('✅ Ficha de nadador creada automáticamente:', swimmerId);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al buscar/crear ficha de nadador:', error);
      }
    }
    
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      swimmerId,
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
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cleanEmail = email.trim();
    const cleanName = name.trim();
    
    // Generar ID único para el nuevo usuario
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    const newUserId = `user_${timestamp}_${randomStr}`;
    
    // La contraseña inicial es el ID del usuario
    const initialPassword = newUserId;
    
    console.log('🔐 SIGNUP - Creando usuario en Supabase:');
    console.log('  - Email:', cleanEmail);
    console.log('  - User ID:', newUserId);
    console.log('  - Password length:', initialPassword.length);
    
    // Crear nuevo usuario en Supabase
    const newUser = {
      id: newUserId,
      email: cleanEmail,
      password: initialPassword,
      name: cleanName,
      role,
    };
    
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(newUser)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo crear el usuario');
    }
    
    const { user: createdUser } = await response.json();
    console.log('✅ Usuario creado en Supabase:', createdUser.id);
    
    let createdSwimmerId = swimmerId;
    
    // Si el rol es 'swimmer', crear automáticamente la ficha del nadador
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
      initialPassword,
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
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
}

// Función helper para verificar si un email ya existe
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/users/find-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email })
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

// ==================== SESSION MANAGEMENT ====================

export function saveSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ==================== DEBUGGING UTILITIES ====================

export async function debugListAllUsers() {
  console.log('🔍 DEBUG - Listando todos los usuarios desde Supabase:');
  
  try {
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
  console.warn('🗑️ Esta función ya no limpia localStorage porque los usuarios están en Supabase');
  console.log('ℹ️ Para limpiar usuarios de Supabase, usa el panel de administración');
  console.log('💡 Los datos ahora persisten en el servidor, no en el navegador local');
  
  // Ya no hacemos nada porque los usuarios están en Supabase, no en localStorage
  return;
}