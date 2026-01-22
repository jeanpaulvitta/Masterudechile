# 🔍 Instrucciones de Diagnóstico: Problema de Marcas Personales

## ⚠️ Problema Reportado
Las marcas personales se borran cuando el nadador vuelve a ingresar a su sesión.

## 🛠️ Solución Implementada

He agregado **logging detallado** en todo el flujo de guardado de marcas para identificar exactamente dónde está fallando la persistencia.

## 📋 Pasos para Diagnosticar el Problema

### 1. **Abrir la Consola del Navegador**
   - Presiona `F12` en tu navegador
   - Ve a la pestaña "Console" / "Consola"

### 2. **Intentar Guardar Marcas Personales**
   - Navega a tu perfil de nadador
   - Haz clic en "Mejores Marcas"
   - Agrega o edita una marca personal
   - Haz clic en "Guardar Marcas"

### 3. **Buscar los Siguientes Logs en la Consola**

#### ✅ **Logs esperados si todo funciona bien:**

```
💾 Guardando marcas personales: [array de marcas]
🏊 Nadador ID: s1234567890
🏊 Guardando marcas para nadador: Nombre Nadador (s1234567890)
📊 Marcas personales a guardar: 2 [...]
📈 Historial a agregar: 2 [...]
📚 Historial existente: 0
📚 Historial actualizado: 2
💾 Llamando a api.updateSwimmer con: { id: 's1234567890', personalBestsCount: 2, historyCount: 2 }
🌐 API: Enviando actualización de nadador s1234567890 { hasPersonalBests: true, personalBestsCount: 2, ... }
✅ API: Swimmer updated: { id: 's1234567890', hasPersonalBests: true, personalBestsCount: 2 }
✅ Mejores marcas guardadas exitosamente
```

#### ❌ **Logs de error a buscar:**

```
❌ Nadador no encontrado: s1234567890
❌ API: Error response: {...}
❌ Error al guardar mejores marcas: ...
```

### 4. **Verificar en el Backend (Supabase)**

Si los logs del frontend se ven bien, revisar los logs del backend:

1. Ve a tu panel de Supabase
2. Navega a `Edge Functions` → `make-server-000a47d9`
3. Ve a la pestaña de "Logs"
4. Busca:

```
📝 Actualizando nadador s1234567890
📊 Datos recibidos: { hasPersonalBests: true, personalBestsCount: 2, ... }
✅ Nadador s1234567890 actualizado exitosamente
📊 Datos guardados: { hasPersonalBests: true, personalBestsCount: 2, ... }
```

### 5. **Recargar la Página y Verificar Persistencia**

1. Después de guardar las marcas con éxito
2. Presiona `F5` para recargar la página
3. Busca en los logs de consola:

```
✅ Swimmers fetched from server: [array con nadadores]
```

4. Verifica que el nadador tenga sus `personalBests`:
   - Haz clic en tu perfil de nadador
   - Abre "Mejores Marcas"
   - ¿Las marcas aparecen?

## 🚨 Escenarios Posibles de Fallo

### Escenario A: Error al Guardar
**Síntoma:** Logs de error en consola al hacer clic en "Guardar"  
**Causa:** Problema en la comunicación frontend → backend  
**Captura:** Screenshot de los logs de error

### Escenario B: Se Guarda Pero No Persiste
**Síntoma:** Log "✅ Mejores marcas guardadas" pero al recargar no aparecen  
**Causa:** Problema en el backend al escribir a Supabase KV Store  
**Verificar:** Logs del backend en Supabase

### Escenario C: Se Guarda Pero Se Sobrescribe
**Síntoma:** Las marcas aparecen justo después de guardar, pero al hacer otro cambio en el perfil se borran  
**Causa:** Otra función está sobrescribiendo el objeto `swimmer` sin incluir `personalBests`  
**Verificar:** Buscar otros logs de `🌐 API: Enviando actualización de nadador` en la sesión

### Escenario D: Problema de Caché del Navegador
**Síntoma:** Datos viejos aparecen en lugar de los nuevos  
**Solución:** Limpiar caché del navegador o usar modo incógnito

## 📸 Información a Reportar

Si el problema persiste, envía:

1. **Screenshot de la consola completa** después de:
   - Agregar una marca
   - Hacer clic en "Guardar Marcas"
   - Esperar la confirmación
   - Recargar la página (F5)

2. **Datos del nadador:**
   - ID del nadador (aparece en los logs como `s1234567890`)
   - Nombre del nadador

3. **Navegador usado:**
   - Chrome, Firefox, Safari, Edge, etc.
   - Versión del navegador

## 🔧 Solución Temporal Inmediata

Si necesitas que las marcas persistan **ahora mismo**:

1. Un **administrador** debe:
   - Ir a la sección "Nadadores"
   - Hacer clic en tu perfil
   - Hacer clic en "Editar Nadador"
   - En el campo de edición, agregar manualmente las marcas
   - Guardar

2. O el administrador puede usar el botón "Mejores Marcas" desde el perfil del nadador para agregar las marcas por ti

## 📞 Contacto

Una vez tengas los logs y screenshots, compártelos con el administrador del sistema para resolución inmediata.

---

## 🎯 Para el Administrador

### Verificación Directa en KV Store

Si eres administrador, puedes verificar directamente los datos guardados:

1. En el código del backend (`/supabase/functions/server/index.tsx`), agrega un endpoint temporal:

```typescript
app.get("/make-server-000a47d9/debug/swimmer/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const swimmers = await kv.get("swimmers:list") || [];
    const swimmer = swimmers.find((s: any) => s.id === id);
    return c.json({ swimmer });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
```

2. Llama al endpoint:
```
GET https://{projectId}.supabase.co/functions/v1/make-server-000a47d9/debug/swimmer/{swimmerId}
Authorization: Bearer {publicAnonKey}
```

3. Verifica si `personalBests` y `personalBestsHistory` están presentes en la respuesta.
