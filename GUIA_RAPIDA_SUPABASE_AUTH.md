# 🚀 Guía Rápida - Supabase Auth

## ✅ Migración Completada

Tu aplicación de Natación Master UCH ahora usa **Supabase Auth** en lugar de localStorage para la autenticación.

---

## 🔑 Credenciales de Admin

```
Email: admin@uch.cl
Password: admin123
```

---

## 📋 Qué se Implementó

### 1. **Cliente de Supabase** (`/src/app/services/supabase.ts`)
- ✅ Configuración singleton con persistencia automática
- ✅ Auto-refresh de tokens habilitado
- ✅ Almacenamiento en localStorage con key `natacion_master_auth`

### 2. **Servicio de Autenticación** (`/src/app/services/auth.ts`)
- ✅ `login()` - Usa `supabase.auth.signInWithPassword()`
- ✅ `signup()` - Crea usuarios vía servidor con Admin API
- ✅ `logout()` - Usa `supabase.auth.signOut()`
- ✅ `getSession()` - Obtiene sesión de Supabase Auth
- ✅ Creación automática de ficha de nadador para swimmers

### 3. **Context de Autenticación** (`/src/app/contexts/AuthContext.tsx`)
- ✅ Hook `onAuthStateChange` escucha todos los eventos de auth
- ✅ Verifica sesión al cargar con `checkSession()`
- ✅ Actualiza estado automáticamente en eventos de Supabase
- ✅ Sincroniza `swimmerId` para nadadores

### 4. **Servidor con Admin API** (`/supabase/functions/server/index.tsx`)
- ✅ Endpoint `/auth/init-admin` - Inicializa admin automáticamente
- ✅ Endpoint `/auth/create-user` - Crea usuarios con contraseña generada
- ✅ Endpoint `/auth/update-password` - Actualiza contraseña (admin)
- ✅ Endpoint `/auth/user/:userId` - Elimina usuario

### 5. **Cambio de Contraseña** (`/src/app/components/ChangePasswordDialog.tsx`)
- ✅ Actualizado para usar `supabase.auth.updateUser()`
- ✅ Verifica contraseña actual con `signInWithPassword()`
- ✅ Permite generar contraseñas seguras aleatorias

---

## 🔄 Cómo Funciona

### Login
```typescript
// Usuario ingresa email y password
await supabase.auth.signInWithPassword({ email, password });

// Supabase retorna:
// - JWT token (expires in 60 min)
// - Refresh token
// - User metadata (name, role, swimmerId)

// AuthContext actualiza estado automáticamente
```

### Sesiones Persistentes
```typescript
// Al recargar página:
await supabase.auth.getSession();

// Si hay sesión válida en localStorage:
// - Usuario NO necesita volver a loguearse
// - Se restaura automáticamente

// Si token expiró:
// - Supabase intenta renovarlo con refresh_token
// - Si falla, muestra LoginPage
```

### Auto-Refresh de Tokens
```typescript
// Supabase detecta cuando el token está por expirar
// Automáticamente solicita nuevo token sin interrupción
// Usuario sigue usando la app normalmente
```

---

## 🛠️ Funcionalidades Nuevas

### 1. **Cambiar Contraseña**
Los usuarios ahora pueden cambiar su contraseña desde la app:
- Menú de usuario → "Cambiar Contraseña"
- Verifica contraseña actual
- Permite generar contraseña segura
- Actualiza en Supabase Auth

### 2. **Sesiones Sincronizadas**
- Las sesiones se sincronizan entre pestañas del navegador
- Si cierras sesión en una pestaña, se cierra en todas
- Si inicias sesión en una pestaña, se inicia en todas

### 3. **Contraseñas Seguras**
- Las contraseñas se hashean con bcrypt
- No se guardan en texto plano
- Generación automática de contraseñas aleatorias

---

## 📝 Flujo de Solicitud de Acceso

1. **Usuario solicita acceso** (LoginPage → "Solicitar Acceso")
2. Se crea registro en tabla `password_requests`
3. **Admin revisa solicitudes** (Panel de Solicitudes)
4. **Admin aprueba** → Se llama a `/auth/create-user`
5. Servidor crea usuario en Supabase Auth con contraseña generada
6. Si es nadador, se crea automáticamente su ficha
7. **Admin ve credenciales** para compartir con el usuario
8. Usuario puede iniciar sesión con sus credenciales

---

## 🔍 Debugging

### Ver todos los usuarios (consola):
```javascript
// En LoginPage, botón "Ver todas las contraseñas (Diagnóstico)"
// Abre consola del navegador (F12) para ver los resultados
```

### Verificar sesión actual:
```javascript
// En consola del navegador:
const { data: { session } } = await supabase.auth.getSession();
console.log(session);
```

### Limpiar sesión y caché:
```javascript
// En LoginPage si hay error:
localStorage.clear();
window.location.reload();
```

---

## ⚙️ Configuración

### Variables de Entorno (Ya configuradas):
```
SUPABASE_URL=https://rztiyofwhlwvofwhcgue.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6... (⚠️ SECRETO)
```

### localStorage Keys:
- `natacion_master_auth` - Sesión de Supabase Auth
- `natacion_master_logo_url` - URL del logo personalizado

---

## 🚨 Importante

### ✅ QUÉ HACER:
- Usar credenciales admin: `admin@uch.cl / admin123`
- Crear usuarios desde el panel de admin
- Compartir contraseñas generadas de forma segura
- Cambiar tu contraseña regularmente

### ❌ QUÉ NO HACER:
- **NUNCA** exponer `SUPABASE_SERVICE_ROLE_KEY` al frontend
- No compartir contraseñas por medios inseguros
- No modificar localStorage manualmente
- No intentar crear usuarios directamente en frontend

---

## 📚 Documentación Adicional

- **Migración Completa**: Ver `/MIGRACION_SUPABASE_AUTH.md`
- **Diagramas de Flujos**: Ver `/FLUJOS_AUTENTICACION.md`
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth

---

## 🎯 Testing Rápido

### 1. Login como Admin:
```
1. Ir a https://app-masteruchile.vercel.app/
2. Email: admin@uch.cl
3. Password: admin123
4. ✅ Debería entrar al dashboard
```

### 2. Crear Usuario:
```
1. Panel de Admin → "Solicitudes de Acceso"
2. Aprobar solicitud pendiente
3. ✅ Se genera contraseña automáticamente
4. Copiar credenciales para compartir
```

### 3. Cambiar Contraseña:
```
1. Menú usuario (esquina superior derecha)
2. "Cambiar Contraseña"
3. Ingresar contraseña actual
4. Ingresar nueva contraseña
5. ✅ Contraseña actualizada
```

### 4. Logout:
```
1. Menú usuario → "Cerrar Sesión"
2. ✅ Redirige a LoginPage
3. localStorage limpiado automáticamente
```

### 5. Sesión Persistente:
```
1. Iniciar sesión
2. Recargar página (F5)
3. ✅ NO pide login nuevamente
4. Sesión restaurada automáticamente
```

---

## ✨ Ventajas de Supabase Auth

1. **Seguridad**: Contraseñas hasheadas, tokens JWT
2. **Escalabilidad**: Soporta miles de usuarios
3. **Auto-refresh**: Tokens se renuevan automáticamente
4. **Persistencia**: Sesiones sincronizadas
5. **Auditoría**: Logs de autenticación en Supabase
6. **OAuth Ready**: Fácil agregar login social (Google, etc.)

---

## 🆘 Solución de Problemas

### Problema: "No puedo iniciar sesión"
**Solución:**
1. Verificar credenciales (admin@uch.cl / admin123)
2. Abrir consola (F12) y buscar errores
3. Intentar botón "Resetear Admin"
4. Si persiste, limpiar caché

### Problema: "Sesión expirada"
**Solución:**
- Supabase debería renovar automáticamente
- Si falla, simplemente volver a iniciar sesión

### Problema: "Error al cambiar contraseña"
**Solución:**
1. Verificar que la contraseña actual sea correcta
2. Nueva contraseña debe tener mínimo 6 caracteres
3. Revisar consola para error específico

### Problema: "No se crea usuario"
**Solución:**
1. Verificar que el email no esté ya registrado
2. Revisar consola del navegador
3. Verificar que el servidor esté funcionando

---

## 📞 Contacto

Para dudas sobre la implementación, revisar:
- Logs en consola del navegador (F12)
- Panel de Supabase Auth
- Documentación en archivos `.md`

---

**Última actualización**: Enero 2026  
**Versión Supabase Auth**: 2.91.0  
**Estado**: ✅ Migración Completada y Funcional
