# 📚 Sistema de Usuarios y Autenticación - Documentación Completa

## 🎯 Descripción General

Este es un sistema completo de autenticación y gestión de usuarios desarrollado con **Supabase Auth**, **React Context API** y **Hono** (backend). El sistema incluye:

- ✅ Login/Logout con email y contraseña
- ✅ Registro de usuarios con generación automática de contraseñas
- ✅ Sistema de roles (admin, coach, swimmer/nadador)
- ✅ Protección de rutas
- ✅ Gestión de sesiones persistentes
- ✅ Solicitudes de acceso (pending requests)
- ✅ Panel de administración de usuarios

---

## 📁 Estructura del Sistema

```
src/
├── app/
│   ├── contexts/
│   │   └── AuthContext.tsx          # ⭐ Context principal de autenticación
│   ├── services/
│   │   ├── auth.ts                  # ⭐ Funciones de autenticación (login, signup, logout)
│   │   └── supabase.ts              # Cliente Supabase
│   └── components/
│       ├── ProtectedRoute.tsx       # ⭐ HOC para proteger rutas
│       ├── LoginPage.tsx            # ⭐ Página de login/registro
│       ├── UserMenu.tsx             # Menú de usuario con logout
│       ├── UserManager.tsx          # Panel admin para gestionar usuarios
│       └── PasswordRequestsManager.tsx  # Gestión de solicitudes pendientes
│
supabase/
└── functions/
    └── server/
        └── index.tsx                # ⭐ Backend con rutas de autenticación
```

---

## 🔑 1. AuthContext (Contexto de Autenticación)

### 📄 `/src/app/contexts/AuthContext.tsx`

Este es el corazón del sistema. Maneja el estado global del usuario autenticado.

```tsx
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'swimmer' | 'coach';
  swimmerId?: string;  // Solo para usuarios tipo 'swimmer'
  name?: string;
}

interface AuthContextType {
  user: User | null;           // Usuario actual
  loading: boolean;            // Estado de carga
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email, password, name, role, swimmerId?) => Promise<credentials>;
  createUserAccount: (email, name, role) => Promise<credentials>;
}
```

### 🔄 Características Principales:

1. **Persistencia de sesión**: Usa Supabase Auth que guarda sesiones en localStorage
2. **Auto-refresh de tokens**: Supabase maneja automáticamente la renovación de tokens
3. **Listener de cambios**: Escucha eventos de autenticación (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`)
4. **Inicialización automática**: Verifica sesión al cargar la app

### 💡 Uso:

```tsx
import { useAuth } from './contexts/AuthContext';

function MiComponente() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;
  
  return (
    <div>
      <p>Hola {user.name}</p>
      <p>Rol: {user.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

---

## 🔐 2. Servicios de Autenticación

### 📄 `/src/app/services/auth.ts`

Funciones principales:

#### **A) login()**

```tsx
export async function login(email: string, password: string): Promise<User> {
  // 1. Limpia email/password
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();
  
  // 2. Autentica con Supabase
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword
  });
  
  if (error) throw new Error('Correo o contraseña incorrectos');
  
  // 3. Obtiene metadata del usuario
  const { name, role, swimmerId } = authData.user.user_metadata;
  
  // 4. Si es 'swimmer', busca/crea su ficha automáticamente
  if (role === 'swimmer') {
    // Buscar nadador en la base de datos
    // Si no existe, crear uno automáticamente
  }
  
  // 5. Retorna datos del usuario
  return {
    id: authData.user.id,
    email: authData.user.email!,
    name: name || authData.user.email!,
    role: role || 'swimmer',
    swimmerId: finalSwimmerId,
  };
}
```

**Flujo:**
```
Usuario ingresa credenciales
    ↓
Supabase valida email/password
    ↓
Obtiene metadata (name, role, swimmerId)
    ↓
Si es nadador → busca/crea ficha
    ↓
Retorna objeto User
    ↓
AuthContext actualiza estado global
```

#### **B) signup()**

```tsx
export async function signup(
  email: string, 
  password: string, 
  name: string, 
  role: 'admin' | 'swimmer' | 'coach',
  swimmerId?: string
): Promise<User & { initialPassword: string }> {
  // 1. Crea usuario en Supabase Auth vía servidor
  const response = await fetch(`${API_URL}/auth/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ email, name, role, swimmerId })
  });
  
  const { user: createdUser, password: generatedPassword } = await response.json();
  
  // 2. Si es 'swimmer', crea ficha automáticamente
  if (role === 'swimmer') {
    // POST /swimmers con datos por defecto
  }
  
  // 3. Retorna usuario + contraseña generada
  return {
    ...createdUser,
    initialPassword: generatedPassword
  };
}
```

**Flujo:**
```
Admin crea usuario desde panel
    ↓
Llama /auth/create-user en servidor
    ↓
Servidor genera contraseña aleatoria
    ↓
Crea usuario en Supabase Auth
    ↓
Si role='swimmer' → crea ficha
    ↓
Retorna credenciales a admin
    ↓
Admin las comparte con el usuario
```

#### **C) logout()**

```tsx
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  // Supabase limpia localStorage automáticamente
}
```

---

## 🛡️ 3. ProtectedRoute (Protección de Rutas)

### 📄 `/src/app/components/ProtectedRoute.tsx`

Componente de orden superior (HOC) para proteger rutas.

```tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'swimmer' | 'coach';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // 1. Mientras carga, muestra loading
  if (loading) {
    return <div>Cargando...</div>;
  }

  // 2. Si no hay usuario, redirige a login
  if (!user) {
    return <LoginPage />;
  }

  // 3. Si requiere rol específico, verifica permisos
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <div>Acceso Denegado</div>;
  }

  // 4. Todo OK, renderiza children
  return <>{children}</>;
}
```

### 💡 Uso:

```tsx
// Proteger toda la app
<AuthProvider>
  <ProtectedRoute>
    <MainApp />
  </ProtectedRoute>
</AuthProvider>

// Proteger solo admins
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Proteger coaches y admins
{(user.role === 'admin' || user.role === 'coach') && (
  <CoachPanel />
)}
```

---

## 🖥️ 4. Página de Login

### 📄 `/src/app/components/LoginPage.tsx`

Página con 2 tabs:

### **Tab 1: Iniciar Sesión**

```tsx
<form onSubmit={handleLogin}>
  <Input
    type="email"
    value={loginEmail}
    onChange={(e) => setLoginEmail(e.target.value)}
  />
  <Input
    type="password"
    value={loginPassword}
    onChange={(e) => setLoginPassword(e.target.value)}
  />
  <Button type="submit">Iniciar Sesión</Button>
</form>
```

**Funcionalidad:**
- Valida credenciales con Supabase
- Muestra errores de autenticación
- Botón de "Resetear Admin" si hay problemas
- Limpia caché si hay errores persistentes

### **Tab 2: Solicitar Acceso**

```tsx
<form onSubmit={handlePasswordRequest}>
  <Input
    type="text"
    placeholder="Nombre Completo"
    value={requestName}
  />
  <Input
    type="email"
    placeholder="Correo"
    value={requestEmail}
  />
  <select value={requestRole}>
    <option value="swimmer">Nadador</option>
    <option value="coach">Entrenador</option>
  </select>
  <Button type="submit">Solicitar Acceso</Button>
</form>
```

**Funcionalidad:**
- Crea solicitud pendiente en base de datos
- Admin recibe notificación
- Admin aprueba → genera credenciales
- Usuario recibe email con contraseña

---

## 🚀 5. Backend (Rutas de Autenticación)

### 📄 `/supabase/functions/server/index.tsx`

El servidor Hono maneja las rutas de autenticación:

### **A) Inicializar Admin**

```tsx
POST /make-server-000a47d9/auth/init-admin

// Crea usuario admin@uch.cl con password admin123
await supabaseAdmin.auth.admin.createUser({
  email: "admin@uch.cl",
  password: "admin123",
  email_confirm: true,
  user_metadata: {
    name: "Administrador UCH",
    role: "admin"
  }
});
```

### **B) Resetear Admin**

```tsx
POST /make-server-000a47d9/auth/reset-admin

// Resetea contraseña de admin a admin123
await supabaseAdmin.auth.admin.updateUserById(
  adminUser.id,
  { password: "admin123" }
);
```

### **C) Crear Usuario**

```tsx
POST /make-server-000a47d9/auth/create-user
Body: { email, name, role, swimmerId? }

// 1. Genera contraseña aleatoria
const password = `${Math.random().toString(36).substring(2, 15)}${Date.now()}`;

// 2. Crea usuario en Supabase Auth
await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name, role, swimmerId }
});

// 3. Retorna credenciales
return { user, password };
```

### **D) Login** (Opcional, no usado porque Supabase lo maneja)

```tsx
POST /make-server-000a47d9/auth/login
Body: { email, password }

const { data, error } = await supabaseAdmin.auth.signInWithPassword({
  email,
  password
});

return { user, session };
```

---

## 🔄 6. Flujos Completos

### **Flujo 1: Usuario Nuevo Solicita Acceso**

```
1. Usuario completa formulario "Solicitar Acceso"
   ↓
2. POST /password-requests → guarda en KV store
   ↓
3. Admin ve solicitud en panel "Usuarios"
   ↓
4. Admin hace clic en "Aprobar"
   ↓
5. POST /auth/create-user → crea en Supabase Auth
   ↓
6. Genera contraseña aleatoria
   ↓
7. Si role='swimmer' → crea ficha en /swimmers
   ↓
8. Admin copia credenciales y las envía al usuario
   ↓
9. Usuario inicia sesión con email + password
```

### **Flujo 2: Login de Usuario Existente**

```
1. Usuario ingresa email + password
   ↓
2. supabase.auth.signInWithPassword()
   ↓
3. Supabase valida credenciales
   ↓
4. Retorna user + session + access_token
   ↓
5. AuthContext actualiza estado global
   ↓
6. ProtectedRoute detecta user !== null
   ↓
7. Renderiza <MainApp />
```

### **Flujo 3: Verificación de Sesión al Cargar App**

```
1. App.tsx se monta
   ↓
2. AuthProvider ejecuta useEffect
   ↓
3. supabase.auth.getSession()
   ↓
4. Si hay sesión → actualiza user state
   ↓
5. Si NO hay sesión → muestra LoginPage
   ↓
6. Listener detecta cambios (SIGNED_IN, SIGNED_OUT)
```

---

## 🎨 7. Gestión de Roles

### **Roles Disponibles:**

| Rol      | Permisos                                                      |
|----------|---------------------------------------------------------------|
| `admin`  | Acceso total: crear usuarios, gestionar nadadores, etc.      |
| `coach`  | Ver nadadores, registrar asistencia, editar marcas            |
| `swimmer`| Ver solo sus datos, registrar asistencia propia              |

### **Control de Acceso en Componentes:**

```tsx
const { user } = useAuth();

// Verificar si es admin
if (user?.role === 'admin') {
  // Mostrar panel de admin
}

// Verificar si es admin O coach
if (user?.role === 'admin' || user?.role === 'coach') {
  // Registrar asistencia
}

// Verificar si es el nadador actual
if (user?.swimmerId === swimmer.id) {
  // Mostrar datos personales
}
```

---

## 📊 8. Base de Datos

### **Supabase Auth (usuarios):**

```sql
-- Tabla automática de Supabase
auth.users {
  id: uuid
  email: text
  encrypted_password: text
  email_confirmed_at: timestamp
  user_metadata: jsonb  -- { name, role, swimmerId }
}
```

### **KV Store (solicitudes pendientes):**

```typescript
interface PasswordRequest {
  id: string;
  name: string;
  email: string;
  role: 'swimmer' | 'coach';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  generatedPassword?: string;
}
```

### **KV Store (nadadores):**

```typescript
interface Swimmer {
  id: string;
  name: string;
  email: string;
  // ... otros campos
}
```

---

## 🔧 9. Configuración Necesaria

### **A) Variables de Entorno:**

```bash
# En Supabase Dashboard → Settings → Edge Functions
SUPABASE_URL=https://[proyecto].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...  # Public anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Service role key (SECRETO)
```

### **B) Cliente Supabase:**

```tsx
// /src/app/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### **C) Servidor Supabase (Admin):**

```tsx
// /supabase/functions/server/index.tsx
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // ⚠️ Solo servidor
);
```

---

## 🧪 10. Testing y Debug

### **Debug de Usuarios:**

```tsx
// En LoginPage.tsx
const handleDebugUsers = () => {
  debugListAllUsers();  // Lista todos los usuarios en consola
};

// En auth.ts
export async function debugListAllUsers() {
  const response = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  const { users } = await response.json();
  console.log('Total usuarios:', users.length);
  users.forEach(u => console.log(u.email, u.role));
}
```

### **Resetear Admin:**

```tsx
// Desde LoginPage o consola
const handleResetAdmin = async () => {
  await fetch(`${API_URL}/auth/reset-admin`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  // Admin ahora tiene email: admin@uch.cl, password: admin123
};
```

---

## 🎯 11. Aplicar en Tu Proyecto

### **Paso 1: Instalar Dependencias**

```bash
npm install @supabase/supabase-js
```

### **Paso 2: Copiar Archivos Esenciales**

```
Tu Proyecto/
├── contexts/
│   └── AuthContext.tsx     ← COPIAR
├── services/
│   ├── auth.ts             ← COPIAR
│   └── supabase.ts         ← COPIAR
└── components/
    ├── ProtectedRoute.tsx  ← COPIAR
    └── LoginPage.tsx       ← COPIAR (adaptar diseño)
```

### **Paso 3: Configurar Supabase**

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener `SUPABASE_URL` y `SUPABASE_ANON_KEY`
3. Crear `.env`:
   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### **Paso 4: Envolver App con AuthProvider**

```tsx
// App.tsx
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TuAppPrincipal />
      </ProtectedRoute>
    </AuthProvider>
  );
}
```

### **Paso 5: Usar useAuth en Componentes**

```tsx
import { useAuth } from './contexts/AuthContext';

function MiComponente() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Hola {user?.name}</p>
      <button onClick={logout}>Salir</button>
    </div>
  );
}
```

### **Paso 6: Crear Usuario Admin Inicial**

```tsx
// Desde navegador (consola F12) o backend
await fetch('https://tuproyecto.supabase.co/functions/v1/tu-server/auth/init-admin', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ANON_KEY' }
});

// O manualmente en Supabase Dashboard:
// Authentication → Users → Add user
// Email: admin@tuapp.com
// Password: admin123
// User Metadata: { "role": "admin", "name": "Admin" }
```

---

## 📝 12. Checklist de Implementación

- [ ] Instalar @supabase/supabase-js
- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Copiar AuthContext.tsx
- [ ] Copiar auth.ts
- [ ] Copiar supabase.ts
- [ ] Copiar ProtectedRoute.tsx
- [ ] Copiar/adaptar LoginPage.tsx
- [ ] Envolver App con AuthProvider
- [ ] Crear rutas de backend (/auth/create-user, etc.)
- [ ] Inicializar usuario admin
- [ ] Probar login/logout
- [ ] Probar protección de rutas
- [ ] Probar creación de usuarios
- [ ] Configurar roles y permisos

---

## 🚨 13. Errores Comunes y Soluciones

### **Error: "Invalid login credentials"**

**Causa:** Usuario no existe o contraseña incorrecta
**Solución:**
```tsx
// Resetear admin
await fetch('/auth/reset-admin', { method: 'POST' });
```

### **Error: "User already registered"**

**Causa:** Email ya existe en Supabase Auth
**Solución:**
```tsx
// Eliminar usuario en Supabase Dashboard → Authentication → Users
// O usar endpoint DELETE si lo implementaste
```

### **Error: "Session not found"**

**Causa:** Token expirado o localStorage corrupto
**Solución:**
```tsx
localStorage.clear();
window.location.reload();
```

### **Error: "CORS policy"**

**Causa:** Backend no tiene CORS habilitado
**Solución:**
```tsx
import { cors } from 'npm:hono/cors';
app.use('*', cors());
```

---

## 🎓 14. Recursos Adicionales

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Hono Framework](https://hono.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## ✨ 15. Características Avanzadas (Opcionales)

### **A) Reset de Contraseña**

```tsx
// Enviar email de recuperación
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://tuapp.com/reset-password'
});
```

### **B) Verificación de Email**

```tsx
// Reenviar email de verificación
await supabase.auth.resend({
  type: 'signup',
  email: user.email
});
```

### **C) OAuth (Google, GitHub, etc.)**

```tsx
await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

### **D) Multi-Factor Authentication (MFA)**

```tsx
const { data } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});
```

---

## 🎯 Conclusión

Este sistema de autenticación es:

✅ **Seguro** - Usa Supabase Auth (industry-standard)  
✅ **Escalable** - Fácil de agregar nuevos roles  
✅ **Mantenible** - Código limpio y organizado  
✅ **Extensible** - Puedes agregar OAuth, MFA, etc.  
✅ **Production-ready** - Usado en apps reales  

**¡Listo para copiar y adaptar a tu proyecto!** 🚀

---

## 📧 Contacto

Si tienes dudas sobre la implementación, revisa:
1. Los archivos fuente originales
2. La consola del navegador (F12)
3. Los logs del servidor Supabase
4. La documentación oficial de Supabase

**¡Mucho éxito con tu proyecto!** 💪✨
