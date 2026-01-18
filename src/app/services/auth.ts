import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { User } from '../contexts/AuthContext';

const SESSION_KEY = 'natacion_master_session';
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

// ==================== CUENTA INICIAL DE ADMINISTRADOR ====================
// Cuenta de administrador inicial - cambiar la contraseña después del primer login
const DEMO_USERS = [
  {
    id: 'user_admin_1',
    email: 'admin@uch.cl',
    password: 'admin123', // Esta es la contraseña por defecto
    name: 'Administrador UCH',
    role: 'admin' as const,
  },
];

// Base de datos simulada de usuarios registrados (además de los demo)
const REGISTERED_USERS_KEY = 'natacion_master_users';

function getRegisteredUsers(): typeof DEMO_USERS {
  const stored = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: typeof DEMO_USERS) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function getAllUsers() {
  // Para el admin del sistema, usar la contraseña guardada en localStorage si existe
  const adminUsers = DEMO_USERS.map(user => {
    if (user.id === 'user_admin_1') {
      const storedPassword = localStorage.getItem('system_admin_password');
      return storedPassword ? { ...user, password: storedPassword } : user;
    }
    return user;
  });
  
  return [...adminUsers, ...getRegisteredUsers()];
}

// Función helper para verificar si un email ya existe
export function checkEmailExists(email: string): boolean {
  const allUsers = getAllUsers();
  return allUsers.some(u => u.email === email);
}

// ==================== AUTHENTICATION ====================

export async function login(email: string, password: string): Promise<User> {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Limpiar espacios en blanco de las credenciales
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    
    console.log('🔐 LOGIN - Intentando autenticar:');
    console.log('  - Email original:', `"${email}"`);
    console.log('  - Email limpio:', `"${cleanEmail}"`);
    console.log('  - Password original:', `"${password}"`);
    console.log('  - Password limpio:', `"${cleanPassword}"`);
    console.log('  - Longitud password:', cleanPassword.length);
    
    const allUsers = getAllUsers();
    console.log('📋 Total usuarios disponibles:', allUsers.length);
    console.log('📧 Usuarios registrados:', allUsers.map(u => ({ email: u.email, role: u.role })));
    
    const user = allUsers.find(u => u.email === cleanEmail && u.password === cleanPassword);
    
    if (!user) {
      console.error('❌ No se encontró usuario con estas credenciales');
      console.log('🔍 Buscando usuario por email...');
      const userByEmail = allUsers.find(u => u.email === cleanEmail);
      if (userByEmail) {
        console.log('  - Usuario encontrado por email:', userByEmail.email);
        console.log('  - Password esperada:', `"${userByEmail.password}"`);
        console.log('  - Password recibida:', `"${cleanPassword}"`);
        console.log('  - Longitud esperada:', userByEmail.password.length);
        console.log('  - Longitud recibida:', cleanPassword.length);
        console.log('  - ¿Coinciden exactamente?:', userByEmail.password === cleanPassword);
        
        // Comparación carácter por carácter para debugging
        if (userByEmail.password.length === cleanPassword.length) {
          for (let i = 0; i < userByEmail.password.length; i++) {
            if (userByEmail.password[i] !== cleanPassword[i]) {
              console.log(`  - Diferencia en posición ${i}: esperado="${userByEmail.password[i]}" (${userByEmail.password.charCodeAt(i)}), recibido="${cleanPassword[i]}" (${cleanPassword.charCodeAt(i)})`);
            }
          }
        }
      } else {
        console.log('  - No existe usuario con este email');
        console.log('  - Emails disponibles:', allUsers.map(u => u.email));
      }
      throw new Error('Correo electrónico o contraseña incorrectos');
    }
    
    let swimmerId: string | undefined = undefined;
    
    // Si el usuario es nadador, buscar su ficha
    if (user.role === 'swimmer') {
      try {
        console.log('🏊‍♂️ Buscando ficha de nadador...');
        const response = await fetch(`${API_URL}/swimmers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const swimmers = data.swimmers || [];
          
          // Buscar nadador por email
          const swimmer = swimmers.find((s: any) => s.email === cleanEmail);
          
          if (swimmer) {
            swimmerId = swimmer.id;
            console.log('✅ Ficha de nadador encontrada:', swimmerId);
          } else {
            console.warn('⚠️ No se encontró ficha de nadador para este email');
            console.log('📝 Creando ficha de nadador automáticamente...');
            
            // Crear ficha de nadador automáticamente
            const today = new Date();
            const defaultBirthYear = today.getFullYear() - 25;
            const defaultDateOfBirth = `${defaultBirthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const swimmerData = {
              name: user.name,
              email: cleanEmail,
              rut: '00.000.000-0', // RUT por defecto
              gender: 'Masculino' as const,
              dateOfBirth: defaultDateOfBirth,
              schedule: '7am' as const,
              joinDate: new Date().toISOString().split('T')[0],
              personalBests: [] as any[],
              personalBestsHistory: [] as any[],
              goals: [] as any[],
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
            } else {
              console.error('❌ Error al crear ficha automática');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al buscar ficha de nadador:', error);
        // No bloquear el login si falla la búsqueda de ficha
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
    
    const allUsers = getAllUsers();
    
    // Verificar si el email ya existe
    if (allUsers.find(u => u.email === email)) {
      throw new Error('Este correo electrónico ya está registrado');
    }
    
    // Generar ID único para el nuevo usuario usando substring en lugar de substr
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11); // Cambiar substr a substring
    const newUserId = `user_${timestamp}_${randomStr}`;
    
    // IMPORTANTE: La contraseña inicial es el ID del usuario
    const initialPassword = newUserId;
    
    console.log('🔐 SIGNUP - Generando credenciales:');
    console.log('  - Email:', email);
    console.log('  - User ID:', newUserId);
    console.log('  - Password inicial (mismo que ID):', initialPassword);
    console.log('  - Longitud password:', initialPassword.length);
    
    // Crear nuevo usuario con su ID como contraseña inicial
    const newUser = {
      id: newUserId,
      email: email.trim(), // Eliminar espacios
      password: initialPassword,
      name: name.trim(), // Eliminar espacios
      role,
    };
    
    // Guardar en localStorage
    const registeredUsers = getRegisteredUsers();
    registeredUsers.push(newUser);
    saveRegisteredUsers(registeredUsers);
    
    console.log('✅ Usuario guardado en localStorage');
    console.log('📋 Total usuarios registrados:', registeredUsers.length);
    
    // Verificar que se guardó correctamente
    const savedUsers = getRegisteredUsers();
    const verifyUser = savedUsers.find(u => u.email === email.trim());
    if (verifyUser) {
      console.log('✅ Verificación exitosa - Usuario encontrado después de guardar');
      console.log('  - Email guardado:', verifyUser.email);
      console.log('  - Password guardada:', verifyUser.password);
      console.log('  - ¿Passwords coinciden?:', verifyUser.password === initialPassword);
    } else {
      console.error('❌ ERROR: Usuario NO encontrado después de guardar!');
    }
    
    let createdSwimmerId = swimmerId;
    
    // Si el rol es 'swimmer', crear automáticamente la ficha del nadador
    if (role === 'swimmer') {
      try {
        console.log('🏊‍♂️ Creando ficha de nadador automáticamente...');
        
        // Calcular fecha de nacimiento por defecto (25 años atrás desde hoy)
        const today = new Date();
        const defaultBirthYear = today.getFullYear() - 25;
        const defaultDateOfBirth = `${defaultBirthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const swimmerData = {
          name: name,
          email: email,
          gender: 'Masculino', // Default, el nadador puede actualizar después
          dateOfBirth: defaultDateOfBirth, // Fecha de nacimiento en lugar de age
          schedule: '7am', // Default actualizado al nuevo formato
          joinDate: new Date().toISOString().split('T')[0],
          personalBests: [] as any[],
          personalBestsHistory: [] as any[],
          goals: [] as any[],
        };
        
        const response = await fetch(`${API_URL}/swimmers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(swimmerData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Error al crear ficha de nadador:', errorData);
          throw new Error('No se pudo crear la ficha del nadador');
        }
        
        const result = await response.json();
        createdSwimmerId = result.swimmer.id;
        console.log('✅ Ficha de nadador creada exitosamente:', result.swimmer);
        
      } catch (swimmerError) {
        console.error('❌ Error al crear ficha de nadador:', swimmerError);
        // No lanzamos el error para no bloquear el registro
        // El usuario se registrará pero sin ficha (puede crearse manualmente después)
        console.warn('⚠️ Usuario registrado pero sin ficha de nadador. Crear manualmente.');
      }
    }
    
    const userData: User & { initialPassword: string } = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      swimmerId: createdSwimmerId,
      initialPassword, // Retornamos la contraseña inicial para mostrársela al usuario
    };
    
    console.log('✅ Signup successful - retornando credenciales:');
    console.log('  - Email a retornar:', userData.email);
    console.log('  - Password a retornar:', initialPassword);
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

// Función de utilidad para debugging - listar todos los usuarios registrados
export function debugListAllUsers() {
  console.log('🔍 DEBUG - Listando todos los usuarios:');
  const registered = getRegisteredUsers();
  const demo = DEMO_USERS;
  
  console.log('\n📧 USUARIOS DEMO:');
  demo.forEach(u => {
    console.log(`  - Email: "${u.email}" | Password: "${u.password}" | Role: ${u.role}`);
  });
  
  console.log('\n📧 USUARIOS REGISTRADOS:');
  if (registered.length === 0) {
    console.log('  - (ninguno)');
  } else {
    registered.forEach(u => {
      console.log(`  - Email: "${u.email}" | Password: "${u.password}" | Role: ${u.role}`);
    });
  }
  
  console.log(`\n📊 TOTAL: ${demo.length + registered.length} usuarios`);
  return { demo, registered };
}

// Función para limpiar usuarios registrados (útil para testing)
export function debugClearRegisteredUsers() {
  console.warn('🗑️ Limpiando usuarios registrados desde localStorage...');
  console.log('ℹ️ La cuenta de administrador inicial (admin@uch.cl) NO se elimina porque es parte del sistema');
  localStorage.removeItem(REGISTERED_USERS_KEY);
  console.log('✅ Usuarios registrados eliminados correctamente');
  console.log('💡 La cuenta de administrador inicial seguirá disponible para iniciar sesión');
}