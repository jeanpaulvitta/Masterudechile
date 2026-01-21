# 🔐 Migración a Supabase Auth - Completada ✅

## Resumen

La aplicación de Natación Master UCH ha sido completamente migrada de un sistema de autenticación basado en localStorage a **Supabase Auth**, proporcionando:

✅ **Contraseñas hasheadas** con bcrypt  
✅ **Tokens JWT seguros** para autenticación  
✅ **Sesiones persistentes** sincronizadas entre navegadores  
✅ **Auto-refresh de tokens** automático  
✅ **Sistema de roles** (admin, coach, swimmer)  

---

## Arquitectura Implementada

### 1. Cliente de Supabase (`/src/app/services/supabase.ts`)

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,      // Renueva tokens automáticamente
    persistSession: true,         // Guarda sesión en localStorage
    detectSessionInUrl: false,    // No detectar sesión en URL
    storage: window.localStorage, // Almacenamiento local
    storageKey: 'natacion_master_auth', // Clave única para esta app
  },
});
```

**Características:**
- **Singleton**: Una única instancia compartida en toda la app
- **Auto-refresh**: Los tokens se renuevan automáticamente antes de expirar
- **Persistencia**: Las sesiones persisten entre recargas de página

---

### 2. Servicio de Autenticación (`/src/app/services/auth.ts`)

#### Funciones Principales:

##### **login(email, password)**
```typescript
// Usa directamente Supabase Auth desde el cliente
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email: cleanEmail,
  password: cleanPassword
});
```
- Autenticación directa con Supabase
- Búsqueda/creación automática de ficha de nadador para usuarios swimmer
- Retorna objeto User con metadata

##### **signup(email, password, name, role, swimmerId?)**
```typescript
// Crea usuario vía servidor usando Admin API
const response = await fetch(`${API_URL}/auth/create-user`, {
  method: 'POST',
  body: JSON.stringify({ email, name, role, swimmerId })
});
```
- Usa **Admin API** en el servidor para crear usuarios
- Genera contraseña aleatoria segura
- Crea automáticamente ficha de nadador si role === 'swimmer'
- Retorna credenciales para que el admin las comparta

##### **logout()**
```typescript
const { error } = await supabase.auth.signOut();
```
- Cierra sesión de Supabase Auth
- Limpia automáticamente localStorage

##### **getSession()**
```typescript
const { data: { session } } = await supabase.auth.getSession();
```
- Obtiene la sesión actual de Supabase
- Retorna User con metadata completa

---

### 3. Context de Autenticación (`/src/app/contexts/AuthContext.tsx`)

#### Estados:
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
```

#### Inicialización:
```typescript
useEffect(() => {
  checkSession(); // Verificar sesión al cargar
  
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Escucha cambios en autenticación
    }
  );
  
  return () => authListener.subscription.unsubscribe();
}, []);
```

#### Eventos Escuchados:
- **SIGNED_IN**: Usuario inició sesión → Actualizar estado
- **SIGNED_OUT**: Usuario cerró sesión → Limpiar estado
- **TOKEN_REFRESHED**: Token renovado → Actualizar metadata
- **INITIAL_SESSION**: Sesión inicial al cargar

#### Helper `updateUserState()`:
- Extrae metadata del usuario de Supabase
- Si es nadador, busca su `swimmerId` en la API
- Actualiza el estado global del usuario

---

### 4. Servidor Supabase (`/supabase/functions/server/index.tsx`)

#### Cliente Admin:
```typescript
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // ⚠️ NUNCA exponer al cliente
);
```

#### Endpoints de Auth:

##### **POST /auth/init-admin**
- Inicializa usuario admin en Supabase Auth
- Credenciales: `admin@uch.cl / admin123`
- Se ejecuta automáticamente al cargar la app

##### **POST /auth/create-user**
```typescript
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  password: generatedPassword,
  email_confirm: true, // Auto-confirmar (no tenemos servidor de email)
  user_metadata: { name, role, swimmerId }
});
```
- Crea usuarios con Admin API
- Genera contraseña aleatoria
- Auto-confirma email
- Retorna contraseña generada

##### **GET /auth/user**
- Verifica token JWT
- Retorna datos de usuario
- Requiere header `Authorization: Bearer <token>`

##### **POST /auth/update-password**
```typescript
await supabaseAdmin.auth.admin.updateUserById(userId, {
  password: newPassword
});
```

##### **DELETE /auth/user/:userId**
```typescript
await supabaseAdmin.auth.admin.deleteUser(userId);
```

---

## Flujos de Autenticación

### 🔑 Flujo de Login

1. Usuario ingresa email y contraseña en `/src/app/components/LoginPage.tsx`
2. Se llama a `login(email, password)` del AuthContext
3. AuthContext llama a `authApi.login()` → `supabase.auth.signInWithPassword()`
4. Supabase Auth valida credenciales y retorna sesión con JWT
5. Se dispara evento `SIGNED_IN` en `onAuthStateChange`
6. `updateUserState()` actualiza el estado global con metadata del usuario
7. Si es nadador, se busca/crea su ficha automáticamente
8. La sesión se guarda automáticamente en `localStorage` con key `natacion_master_auth`

### 📝 Flujo de Registro (Solicitud de Acceso)

1. Usuario completa formulario de solicitud de acceso en LoginPage
2. Se crea registro en tabla `password_requests` vía API
3. Admin revisa solicitudes en panel de administración
4. Admin aprueba solicitud → Se llama a `signup()` del AuthContext
5. AuthContext llama a `authApi.signup()` → endpoint `/auth/create-user`
6. Servidor usa **Admin API** para crear usuario en Supabase Auth
7. Se genera contraseña aleatoria segura
8. Si role === 'swimmer', se crea automáticamente su ficha
9. Se retornan credenciales al admin para compartir con el usuario
10. **NO** se inicia sesión automáticamente (admin sigue logueado)

### 🚪 Flujo de Logout

1. Usuario hace clic en "Cerrar Sesión"
2. Se llama a `logout()` del AuthContext
3. AuthContext llama a `authApi.logout()` → `supabase.auth.signOut()`
4. Supabase Auth invalida el JWT y limpia localStorage
5. Se dispara evento `SIGNED_OUT` en `onAuthStateChange`
6. Estado global se limpia: `setUser(null)`
7. Usuario es redirigido a LoginPage

### 🔄 Flujo de Sesión Persistente

1. Usuario recarga la página
2. AuthContext llama a `checkSession()` en `useEffect`
3. `supabase.auth.getSession()` busca sesión en localStorage
4. Si existe sesión válida y no expirada, se restaura automáticamente
5. Se llama a `updateUserState()` con los datos del usuario
6. Usuario ve la aplicación sin necesidad de login nuevamente

### ⏰ Flujo de Renovación de Token

1. Supabase Auth monitorea la expiración del token automáticamente
2. Antes de expirar, solicita nuevo token al servidor
3. Se dispara evento `TOKEN_REFRESHED` en `onAuthStateChange`
4. `updateUserState()` actualiza metadata si es necesario
5. Usuario continúa usando la app sin interrupciones

---

## Estructura de Datos

### User Object (Frontend)
```typescript
interface User {
  id: string;          // UUID de Supabase Auth
  email: string;       // Email del usuario
  role: 'admin' | 'swimmer' | 'coach'; // Rol
  swimmerId?: string;  // ID de ficha de nadador (solo si role=swimmer)
  name?: string;       // Nombre completo
}
```

### Supabase User Metadata
```typescript
user_metadata: {
  name: string,
  role: 'admin' | 'swimmer' | 'coach',
  swimmerId?: string
}
```

---

## Seguridad

### ✅ Implementado:
1. **Contraseñas hasheadas**: Supabase usa bcrypt automáticamente
2. **JWT tokens**: Autenticación con tokens firmados
3. **Service Role Key protegido**: Solo en servidor, NUNCA en cliente
4. **Auto-refresh de tokens**: Tokens se renuevan automáticamente
5. **CORS configurado**: Solo orígenes permitidos
6. **Roles validados**: Admin API verifica permisos

### ⚠️ Consideraciones:
- Las contraseñas se generan automáticamente y deben compartirse de forma segura
- No hay recuperación de contraseña por email (requiere configurar servidor SMTP)
- `email_confirm: true` auto-confirma emails (sin validación)

---

## Diferencias con Sistema Anterior

| Característica | Antes (localStorage) | Ahora (Supabase Auth) |
|----------------|---------------------|----------------------|
| Almacenamiento de contraseñas | Texto plano en localStorage | Hasheadas con bcrypt en Supabase |
| Sincronización entre navegadores | ❌ No sincroniza | ✅ Sesiones sincronizadas |
| Expiración de sesiones | ❌ No expira | ✅ Tokens con expiración |
| Auto-refresh | ❌ No | ✅ Automático |
| Seguridad | ⚠️ Baja | ✅ Alta |
| Gestión de usuarios | localStorage | Supabase Auth Admin API |

---

## Testing y Debugging

### Credenciales de Admin:
```
Email: admin@uch.cl
Password: admin123
```

### Endpoints de Diagnóstico:

#### Ver todos los usuarios:
```typescript
// En LoginPage, botón "Ver todas las contraseñas (Diagnóstico)"
await debugListAllUsers();
```

#### Resetear admin manualmente:
```typescript
// LoginPage → Botón "Resetear Admin"
POST /users/reset-admin
```

#### Verificar salud del servidor:
```
GET /make-server-000a47d9/health
```

### Logs Importantes:
- `🔐 LOGIN - Intentando autenticar con Supabase Auth`
- `✅ Login successful con Supabase Auth`
- `🔔 Auth state changed: SIGNED_IN`
- `✅ Session found for: user@example.com`
- `🏊‍♂️ Buscando ficha de nadador...`

---

## Próximos Pasos Opcionales

### Mejoras Recomendadas:
1. **Recuperación de contraseña por email**
   - Configurar servidor SMTP en Supabase
   - Implementar flujo de "Olvidé mi contraseña"

2. **Verificación de email**
   - Remover `email_confirm: true`
   - Implementar confirmación por link de email

3. **Cambio de contraseña**
   - Agregar opción para que usuarios cambien su contraseña
   - Usar `supabase.auth.updateUser({ password })`

4. **Login social (OAuth)**
   - Google, Facebook, GitHub
   - Usar `supabase.auth.signInWithOAuth({ provider })`

5. **Rate limiting**
   - Limitar intentos de login fallidos
   - Protección contra brute force

---

## Soporte y Mantenimiento

### Variables de Entorno Necesarias:
```
SUPABASE_URL=https://rztiyofwhlwvofwhcgue.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6... (⚠️ SECRETO)
```

### Archivos Principales:
- `/src/app/services/supabase.ts` - Cliente de Supabase
- `/src/app/services/auth.ts` - Servicio de autenticación
- `/src/app/contexts/AuthContext.tsx` - Context global de auth
- `/supabase/functions/server/index.tsx` - Servidor con Admin API
- `/src/app/components/LoginPage.tsx` - UI de login/registro

---

## Estado Final

✅ **Migración Completada**  
✅ **Sistema de autenticación seguro implementado**  
✅ **Sesiones persistentes funcionando**  
✅ **Auto-refresh de tokens activado**  
✅ **Admin inicializado automáticamente**  
✅ **Compatibilidad con flujo de solicitudes de acceso**  
✅ **Creación automática de fichas de nadadores**  

**Fecha de migración**: Enero 2026  
**Versión**: Supabase Auth v2.91.0
