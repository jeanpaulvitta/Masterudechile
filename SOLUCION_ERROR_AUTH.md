# 🔧 Script de Verificación de Variables de Entorno

## El error "Unexpected token '<', \"<!DOCTYPE \"..." significa que Supabase Auth está devolviendo HTML en lugar de JSON.

## Esto sucede cuando:
1. ❌ La URL de Supabase es incorrecta
2. ❌ El SERVICE_ROLE_KEY es incorrecto o no está configurado
3. ❌ Las variables de entorno no están disponibles en la Edge Function

---

## 📋 Checklist de Verificación:

### ✅ Paso 1: Verificar que el proyecto de Supabase esté correcto

**URL esperada:**
```
https://rztiyofwhlwvofwhcgue.supabase.co
```

### ✅ Paso 2: Obtener las credenciales correctas

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Settings → API
3. Copia estos valores:

```
Project URL: https://rztiyofwhlwvofwhcgue.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE
service_role: ⚠️ ESTA ES LA QUE PROBABLEMENTE FALTA
```

### ✅ Paso 3: Configurar Variables de Entorno en Supabase

**IMPORTANTE:** Las Edge Functions NO tienen acceso automático a las variables de entorno. Debes configurarlas manualmente.

#### Opción A: Via Dashboard (Recomendado)

1. Ve a: https://supabase.com/dashboard/project/rztiyofwhlwvofwhcgue
2. Settings → Edge Functions → Configuration
3. Agrega estas variables:

```bash
SUPABASE_URL=https://rztiyofwhlwvofwhcgue.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key-aquí]
```

4. Guarda los cambios

#### Opción B: Via CLI

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref rztiyofwhlwvofwhcgue

# Configurar secretos
supabase secrets set SUPABASE_URL=https://rztiyofwhlwvofwhcgue.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]

# Verificar
supabase secrets list
```

### ✅ Paso 4: Re-desplegar la Edge Function

Después de configurar las variables de entorno, debes re-desplegar:

```bash
supabase functions deploy server
```

### ✅ Paso 5: Verificar en los logs

```bash
# Ver logs de la función
supabase functions logs server

# O desde el dashboard:
# https://supabase.com/dashboard/project/rztiyofwhlwvofwhcgue/logs/edge-functions
```

Deberías ver:
```
🔧 Checking Supabase configuration...
SUPABASE_URL: https://rztiyofwhlwvofwhcgue.supabase.co
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsI...
```

Si ves:
```
SUPABASE_URL: NOT SET
SERVICE_ROLE_KEY: NOT SET
```

Entonces las variables NO están configuradas.

---

## 🚨 Solución Temporal (Solo para Testing)

Si necesitas hacer funcionar el sistema AHORA mismo, puedes hardcodear las credenciales temporalmente:

### ⚠️ ADVERTENCIA: NO HACER ESTO EN PRODUCCIÓN

Edita `/supabase/functions/server/index.tsx`:

```typescript
// 🚨 TEMPORAL - Reemplaza con tus credenciales reales
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://rztiyofwhlwvofwhcgue.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'TU_SERVICE_ROLE_KEY_AQUI';
```

Luego re-despliega:
```bash
supabase functions deploy server
```

---

## 📝 Cómo Obtener tu SERVICE_ROLE_KEY

1. Ve a: https://supabase.com/dashboard/project/rztiyofwhlwvofwhcgue/settings/api
2. Busca la sección "Project API keys"
3. Copia el valor de **"service_role"** (NO el anon public)
4. Se ve algo así:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAxOTc4NSwiZXhwIjoyMDgyNTk1Nzg1fQ.XXXXXXXXXXXXXXXXXXXXX
   ```

---

## 🧪 Testing

Después de configurar, ejecuta:

```bash
# Test 1: Verificar que la función esté desplegada
curl https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/health

# Test 2: Verificar configuración de Auth
curl https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/debug/auth-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE"

# Test 3: Inicializar admin
curl -X POST https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/auth/init-admin \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE" \
  -H "Content-Type: application/json"
```

---

## 📚 Referencias

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/introduction)

---

## ❓ ¿Todavía no funciona?

Comparte:
1. El output de `supabase secrets list`
2. Los logs de la función (`supabase functions logs server`)
3. El resultado de los curl tests de arriba
