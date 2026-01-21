# 🔄 Diagramas de Flujos de Autenticación

## 1️⃣ Flujo de Login Exitoso

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Ingresa email/password
       ▼
┌─────────────────┐
│   LoginPage     │
│  (UI Component) │
└──────┬──────────┘
       │
       │ 2. login(email, password)
       ▼
┌──────────────────┐
│   AuthContext    │
│  (React Context) │
└──────┬───────────┘
       │
       │ 3. authApi.login()
       ▼
┌──────────────────────────┐
│   auth.ts (Service)      │
│                          │
│ supabase.auth            │
│  .signInWithPassword()   │
└──────┬───────────────────┘
       │
       │ 4. POST /auth/v1/token
       ▼
┌──────────────────────────┐
│   Supabase Auth          │
│   (Cloud Service)        │
│                          │
│ • Valida contraseña      │
│ • Genera JWT token       │
│ • Retorna sesión         │
└──────┬───────────────────┘
       │
       │ 5. { session, user }
       ▼
┌──────────────────────────┐
│   auth.ts (Service)      │
│                          │
│ • Extrae user_metadata   │
│ • Busca ficha nadador    │
│ • Retorna User object    │
└──────┬───────────────────┘
       │
       │ 6. userData
       ▼
┌──────────────────────────┐
│   AuthContext            │
│                          │
│ setUser(userData)        │
└──────┬───────────────────┘
       │
       │ 7. onAuthStateChange
       │    event: SIGNED_IN
       ▼
┌──────────────────────────┐
│   supabase.auth          │
│                          │
│ • Guarda sesión en       │
│   localStorage           │
│ • Key: natacion_master_  │
│   auth                   │
└──────┬───────────────────┘
       │
       │ 8. Usuario autenticado
       ▼
┌──────────────────────────┐
│   App Component          │
│                          │
│ Renderiza dashboard      │
│ según rol del usuario    │
└──────────────────────────┘
```

---

## 2️⃣ Flujo de Creación de Usuario (Signup)

```
┌─────────────┐
│    Admin    │
└──────┬──────┘
       │
       │ 1. Aprueba solicitud
       ▼
┌────────────────────────┐
│  PasswordRequests      │
│  Manager Component     │
└──────┬─────────────────┘
       │
       │ 2. createUserAccount()
       ▼
┌──────────────────┐
│   AuthContext    │
└──────┬───────────┘
       │
       │ 3. authApi.signup()
       ▼
┌────────────────────────────┐
│   auth.ts (Service)        │
│                            │
│ fetch('/auth/create-user') │
└──────┬─────────────────────┘
       │
       │ 4. POST request
       ▼
┌─────────────────────────────┐
│   Supabase Edge Function   │
│   (Server)                  │
│                             │
│ supabaseAdmin.auth.admin    │
│   .createUser({             │
│     email,                  │
│     password: random,       │
│     email_confirm: true,    │
│     user_metadata: {        │
│       name, role, swimmerId │
│     }                       │
│   })                        │
└──────┬──────────────────────┘
       │
       │ 5. Llama a Supabase Auth API
       ▼
┌─────────────────────────────┐
│   Supabase Auth             │
│   (Cloud Service)           │
│                             │
│ • Hashea contraseña (bcrypt)│
│ • Crea usuario en DB        │
│ • Auto-confirma email       │
│ • Retorna usuario creado    │
└──────┬──────────────────────┘
       │
       │ 6. { user, session }
       ▼
┌─────────────────────────────┐
│   Edge Function (Server)    │
│                             │
│ return {                    │
│   user,                     │
│   password: generatedPwd    │
│ }                           │
└──────┬──────────────────────┘
       │
       │ 7. ¿role === 'swimmer'?
       ▼
      YES
       │
       ▼
┌─────────────────────────────┐
│   auth.ts (Service)         │
│                             │
│ POST /swimmers              │
│ • Crea ficha de nadador     │
│ • Datos por defecto         │
└──────┬──────────────────────┘
       │
       │ 8. Retorna credenciales
       ▼
┌─────────────────────────────┐
│   PasswordRequests Manager  │
│                             │
│ Muestra diálogo con:        │
│ Email: user@example.com     │
│ Password: abc123xyz         │
│                             │
│ ⚠️ Admin NO inicia sesión   │
└─────────────────────────────┘
```

---

## 3️⃣ Flujo de Sesión Persistente (Reload de Página)

```
┌─────────────┐
│   Usuario   │
│  recarga    │
│   página    │
└──────┬──────┘
       │
       │ 1. window.location.reload()
       ▼
┌──────────────────┐
│   App carga      │
│                  │
│ <AuthProvider>   │
└──────┬───────────┘
       │
       │ 2. useEffect(() => {})
       ▼
┌──────────────────┐
│   AuthContext    │
│                  │
│ checkSession()   │
└──────┬───────────┘
       │
       │ 3. supabase.auth.getSession()
       ▼
┌────────────────────────┐
│   supabase.auth        │
│                        │
│ • Lee localStorage     │
│ • Key: natacion_master_│
│   auth                 │
└──────┬─────────────────┘
       │
       │ ¿Sesión encontrada?
       ▼
      YES
       │
       │ 4. { session, user }
       ▼
┌────────────────────────┐
│   AuthContext          │
│                        │
│ updateUserState(user)  │
└──────┬─────────────────┘
       │
       │ 5. ¿Token válido?
       ▼
      YES
       │
       │ 6. Extrae metadata
       ▼
┌────────────────────────┐
│   AuthContext          │
│                        │
│ • role, name, email    │
│ • Si swimmer: busca    │
│   ficha en /swimmers   │
└──────┬─────────────────┘
       │
       │ 7. setUser(userData)
       ▼
┌────────────────────────┐
│   App Component        │
│                        │
│ Usuario autenticado    │
│ SIN necesidad de login │
└────────────────────────┘


       ▼ NO (token expirado)
       │
┌────────────────────────┐
│   supabase.auth        │
│                        │
│ autoRefreshToken: true │
│ Intenta renovar token  │
└──────┬─────────────────┘
       │
       │ ¿Refresh exitoso?
       ▼
      YES → Volver a paso 4
       │
       ▼ NO
       │
┌────────────────────────┐
│   AuthContext          │
│                        │
│ setUser(null)          │
│ Muestra LoginPage      │
└────────────────────────┘
```

---

## 4️⃣ Flujo de Auto-Refresh de Token

```
┌─────────────────┐
│  Usuario usa    │
│  la aplicación  │
└────────┬────────┘
         │
         │ (45 minutos después)
         ▼
┌──────────────────────────┐
│   supabase.auth          │
│   (Background timer)     │
│                          │
│ • Detecta token próximo  │
│   a expirar              │
│ • autoRefreshToken: true │
└────────┬─────────────────┘
         │
         │ 1. Solicita nuevo token
         ▼
┌──────────────────────────┐
│   Supabase Auth API      │
│   POST /auth/v1/token    │
│                          │
│ • Valida refresh_token   │
│ • Genera nuevo JWT       │
└────────┬─────────────────┘
         │
         │ 2. { access_token, refresh_token }
         ▼
┌──────────────────────────┐
│   supabase.auth          │
│                          │
│ • Actualiza tokens       │
│ • Guarda en localStorage │
└────────┬─────────────────┘
         │
         │ 3. Dispara evento
         │    TOKEN_REFRESHED
         ▼
┌──────────────────────────┐
│   AuthContext            │
│   onAuthStateChange()    │
│                          │
│ event: TOKEN_REFRESHED   │
└────────┬─────────────────┘
         │
         │ 4. updateUserState()
         ▼
┌──────────────────────────┐
│   AuthContext            │
│                          │
│ • Actualiza metadata     │
│ • Usuario sigue usando   │
│   app SIN interrupción   │
└──────────────────────────┘
```

---

## 5️⃣ Flujo de Logout

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. Click "Cerrar Sesión"
       ▼
┌──────────────────┐
│   UserMenu       │
│   Component      │
└──────┬───────────┘
       │
       │ 2. logout()
       ▼
┌──────────────────┐
│   AuthContext    │
└──────┬───────────┘
       │
       │ 3. authApi.logout()
       ▼
┌────────────────────────┐
│   auth.ts (Service)    │
│                        │
│ supabase.auth.signOut()│
└──────┬─────────────────┘
       │
       │ 4. POST /auth/v1/logout
       ▼
┌────────────────────────┐
│   Supabase Auth API    │
│                        │
│ • Invalida JWT token   │
│ • Limpia refresh_token │
└──────┬─────────────────┘
       │
       │ 5. Success
       ▼
┌────────────────────────┐
│   supabase.auth        │
│                        │
│ • Limpia localStorage  │
│ • Remueve key:         │
│   natacion_master_auth │
└──────┬─────────────────┘
       │
       │ 6. Dispara evento
       │    SIGNED_OUT
       ▼
┌────────────────────────┐
│   AuthContext          │
│   onAuthStateChange()  │
│                        │
│ event: SIGNED_OUT      │
└──────┬─────────────────┘
       │
       │ 7. setUser(null)
       ▼
┌────────────────────────┐
│   App Component        │
│                        │
│ Renderiza LoginPage    │
└────────────────────────┘
```

---

## 🔍 Estados de Autenticación

```
┌──────────────────────────────────────────┐
│           Estados Posibles               │
└──────────────────────────────────────────┘

1. 🔴 NO AUTENTICADO
   ├─ user = null
   ├─ loading = false
   └─ UI: LoginPage

2. 🟡 CARGANDO
   ├─ user = null
   ├─ loading = true
   └─ UI: Spinner

3. 🟢 AUTENTICADO
   ├─ user = { id, email, role, ... }
   ├─ loading = false
   └─ UI: Dashboard según rol

4. 🔵 REFRESHING TOKEN
   ├─ user = { ... }
   ├─ loading = false
   └─ UI: App normal (transparente)

5. ⚪ SESIÓN EXPIRADA
   ├─ user = null
   ├─ loading = false
   └─ UI: LoginPage + mensaje
```

---

## 📊 localStorage Structure

```
Key: "natacion_master_auth"

Value (JSON):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1737500000,
  "refresh_token": "v1.MnU0ZGQyYTMtNWJhOC00ZTVlLTg5ZmEtYTQ1Y2JlNGE0ZmUz",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "nadador@uch.cl",
    "email_confirmed_at": "2026-01-21T10:00:00.000Z",
    "phone": "",
    "confirmed_at": "2026-01-21T10:00:00.000Z",
    "last_sign_in_at": "2026-01-21T10:00:00.000Z",
    "app_metadata": {
      "provider": "email",
      "providers": ["email"]
    },
    "user_metadata": {
      "name": "Juan Pérez",
      "role": "swimmer",
      "swimmerId": "s1737500000"
    },
    "created_at": "2026-01-21T10:00:00.000Z",
    "updated_at": "2026-01-21T10:00:00.000Z"
  }
}
```

---

## ⏰ Timeline de un Token JWT

```
t=0min        t=45min           t=55min           t=60min
│             │                 │                 │
│             │                 │                 │
├─────────────┼─────────────────┼─────────────────┤
Token         Auto-refresh      Token renovado    Token expira
creado        inicia            exitosamente      (si no refresh)
              
↑             ↑                 ↑
Login         Background        Nuevo token
              timer detecta     guardado en
              que falta poco    localStorage
```

**Configuración:**
- `expires_in`: 3600 segundos (60 minutos)
- `autoRefreshToken`: true
- Supabase inicia refresh ~5-10 min antes de expiración

---

## 🔐 Seguridad: Service Role Key vs Anon Key

```
┌─────────────────────────────────────────────┐
│          FRONTEND (Cliente)                 │
│                                             │
│  ✅ Usa: SUPABASE_ANON_KEY                  │
│  ✅ Permisos limitados por RLS              │
│  ✅ Puede:                                  │
│     • signInWithPassword()                 │
│     • signOut()                            │
│     • getSession()                         │
│     • updateUser() (propio usuario)        │
│                                             │
│  ❌ NO puede:                               │
│     • Crear usuarios                       │
│     • Listar todos los usuarios            │
│     • Borrar usuarios                      │
│     • Actualizar metadata de otros         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│       BACKEND (Edge Function)               │
│                                             │
│  ✅ Usa: SUPABASE_SERVICE_ROLE_KEY          │
│  ✅ Permisos TOTALES (bypass RLS)           │
│  ✅ Puede:                                  │
│     • admin.createUser()                   │
│     • admin.listUsers()                    │
│     • admin.deleteUser()                   │
│     • admin.updateUserById()               │
│     • admin.generateLink()                 │
│                                             │
│  ⚠️  NUNCA exponer al cliente               │
└─────────────────────────────────────────────┘
```

---

## 🎯 Puntos Clave de la Implementación

✅ **Separación de responsabilidades**
- Frontend: Login/logout con Anon Key
- Backend: Administración con Service Role Key

✅ **Sesiones persistentes**
- Guardadas en localStorage
- Sincronizadas entre pestañas del mismo navegador

✅ **Auto-refresh transparente**
- Usuario no necesita volver a loguearse
- Tokens se renuevan automáticamente

✅ **Eventos reactivos**
- onAuthStateChange escucha TODOS los cambios
- UI se actualiza automáticamente

✅ **Metadata personalizada**
- user_metadata almacena rol, nombre, swimmerId
- Accesible desde el cliente

✅ **Integración con sistema existente**
- Nadadores tienen ficha automática
- Solicitudes de acceso funcionan igual
- Admin tiene control total
