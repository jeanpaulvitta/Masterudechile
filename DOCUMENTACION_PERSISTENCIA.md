# 📊 Documentación: Persistencia de Datos - App Master UCH

## 🗄️ Resumen General

**Todos los datos de la aplicación se guardan en Supabase** a través de la tabla `kv_store_000a47d9` (key-value store) y se acceden mediante el backend en `/supabase/functions/server/index.tsx`.

---

## 📁 Ubicación de Almacenamiento por Tipo de Dato

### 1️⃣ **NADADORES (Swimmers)**
- **Clave en BD:** `swimmer_{id}`
- **API Endpoint:** `/swimmers`
- **Función de guardado:** `api.updateSwimmer(id, swimmer)`
- **Datos incluidos en cada nadador:**
  - ✅ Información básica (nombre, email, RUT, género, horario, fecha nacimiento)
  - ✅ **Mejores Marcas Personales** (`personalBests`)
  - ✅ **Historial completo de marcas** (`personalBestsHistory`)
  - ✅ **Metas y Objetivos** (`goals`)
  - ✅ Imagen de perfil (`profileImage`)

**Ejemplo de guardado de mejores marcas:**
```typescript
// En App.tsx línea 210
const handleSavePersonalBests = async (swimmerId: string, personalBests: PersonalBest[], history: PersonalBestHistory[]) => {
  const updatedSwimmer = { 
    ...swimmer, 
    personalBests,           // ← Se guarda aquí
    personalBestsHistory: updatedHistory  // ← Y aquí
  };
  await api.updateSwimmer(swimmerId, updatedSwimmer); // ← Persistido a Supabase
}
```

**Ejemplo de guardado de metas:**
```typescript
// En App.tsx línea 250
const handleUpdateGoals = async (swimmerId: string, goals: SwimmerGoal[]) => {
  const updatedSwimmer = { 
    ...swimmer, 
    goals  // ← Se guarda aquí
  };
  await api.updateSwimmer(swimmerId, updatedSwimmer); // ← Persistido a Supabase
}
```

---

### 2️⃣ **COMPETENCIAS (Competitions)**
- **Clave en BD:** `competition_{id}`
- **API Endpoint:** `/competitions`
- **Función de guardado:** `api.updateCompetition(id, competition)`
- **Datos incluidos:**
  - Nombre, fechas, ubicación, tipo de piscina
  - Pruebas disponibles (`events`)
  - Semana del mesociclo, costos, horarios

---

### 3️⃣ **PARTICIPACIONES EN COMPETENCIAS (SwimmerCompetitions)**
- **Clave en BD:** `swimmer-competition_{id}`
- **API Endpoint:** `/swimmer-competitions`
- **Función de guardado:** `api.updateSwimmerCompetition(id, participation)`
- **Datos incluidos:**
  - Participación confirmada (`participates`)
  - **Resultados por prueba** (`events` con `time`, `position`, `points`)
  - Notas adicionales

**Ejemplo de guardado de resultados:**
```typescript
// En App.tsx línea 337 (vía api.updateCompetitionResults)
const handleUpdateCompetitionResults = async (
  competitionId: string,
  events: { event: string; time?: string; position?: number; points?: number }[]
) => {
  const result = await api.updateCompetitionResults(
    currentSwimmer.id,
    competitionId,
    events  // ← Resultados guardados aquí
  );
}
```

---

### 4️⃣ **ENTRENAMIENTOS (Workouts)**
- **Clave en BD:** `workout_{id}` o `workout_{mesociclo}_{week}_{day}_{date}`
- **API Endpoint:** `/workouts`
- **Función de guardado:** `api.updateWorkout(id, workout)`
- **Datos incluidos:**
  - Semana, día, fecha, mesociclo
  - Distancia, series, descripción

---

### 5️⃣ **DESAFÍOS (Challenges)**
- **Clave en BD:** `challenge_{id}`
- **API Endpoint:** `/challenges`
- **Función de guardado:** `api.updateChallenge(id, challenge)`
- **Datos incluidos:**
  - Semana, fecha, nombre del desafío
  - Distancia, descripción

---

### 6️⃣ **ASISTENCIA (Attendance)**
- **Clave en BD:** `attendance_{id}`
- **API Endpoint:** `/attendance`
- **Función de guardado:** `api.addAttendanceRecord(record)`
- **Datos incluidos:**
  - Nadador, sesión, fecha, estado (presente/ausente/tarde)
  - Distancia completada, escala Borg, notas

---

### 7️⃣ **TEST CONTROL (Test Controls & Results)**
- **Clave en BD:** `test-control_{id}` y `test-result_{id}`
- **API Endpoint:** `/test-controls` y `/test-results`
- **Función de guardado:** `api.updateTestControl()` y `api.addTestResult()`
- **Datos incluidos:**
  - Test controls: nombre, fecha, pruebas
  - Test results: tiempos por nadador y prueba

---

### 8️⃣ **DÍAS FERIADOS (Holidays)**
- **Clave en BD:** `holiday_{id}`
- **API Endpoint:** `/holidays`
- **Función de guardado:** `api.updateHoliday(id, holiday)`

---

### 9️⃣ **RITMOS DE ENTRENAMIENTO**

⚠️ **IMPORTANTE: Los ritmos de entrenamiento NO se están guardando actualmente de forma persistente.**

**Estado actual:**
- Los ritmos se calculan dinámicamente en el componente `SwimmerDetailsDialog` basándose en las mejores marcas del nadador
- No hay campo `trainingPaces` en el tipo `Swimmer`
- Los cálculos se hacen en tiempo real cada vez que se abre el diálogo del nadador

**Ubicación del cálculo:**
```typescript
// En SwimmerDetailsDialog.tsx
const calculateTrainingPaces = (personalBests: PersonalBest[]) => {
  // Cálculos basados en porcentajes de mejores marcas
  // Estos NO se guardan en la base de datos
}
```

**Solución recomendada si quieres que persistan:**
1. Agregar campo `trainingPaces` al tipo `Swimmer` en `/src/app/data/swimmers.ts`
2. Guardar los ritmos calculados cuando se actualizan las mejores marcas
3. Modificar `handleSavePersonalBests` para incluir los ritmos calculados

---

## 🔄 Flujo de Persistencia

```
[Frontend: App.tsx]
      ↓
handleSavePersonalBests / handleUpdateGoals / etc.
      ↓
[Frontend: api.ts - /src/app/services/api.ts]
      ↓
fetch(`${API_BASE_URL}/swimmers/${id}`, { method: 'PUT', body: JSON.stringify(swimmer) })
      ↓
[Backend: /supabase/functions/server/index.tsx]
      ↓
app.put('/make-server-000a47d9/swimmers/:id', async (c) => { ... })
      ↓
[Supabase KV Store: kv_store_000a47d9]
      ↓
await kv.set(`swimmer_${id}`, updatedSwimmer)
```

---

## ✅ Verificación de Persistencia

Para verificar que los datos se están guardando correctamente:

1. **Abrir consola del navegador** (F12)
2. Buscar logs como:
   - `✅ Mejores marcas guardadas`
   - `✅ Swimmer updated`
   - `✅ Metas actualizadas`
3. **Recargar la página** - los datos deberían mantenerse
4. **En el servidor**, revisar logs de Supabase Edge Functions

---

## 🛠️ Archivos Clave

| Archivo | Función |
|---------|---------|
| `/src/app/App.tsx` | Handlers de guardado (líneas 210-277) |
| `/src/app/services/api.ts` | Funciones de comunicación con backend |
| `/supabase/functions/server/index.tsx` | Backend que persiste a KV store |
| `/src/app/data/swimmers.ts` | Definición de tipos (Swimmer, PersonalBest, SwimmerGoal) |

---

## 📝 Notas Importantes

1. **Mejores marcas y metas SÍ persisten** - se guardan en el objeto `Swimmer`
2. **Resultados de competencias SÍ persisten** - se guardan en `SwimmerCompetition`
3. **Ritmos de entrenamiento NO persisten** - se calculan dinámicamente
4. **Historial completo de marcas SÍ persiste** - en `personalBestsHistory`
5. Todos los datos se guardan automáticamente al hacer cambios en la UI
6. No es necesario hacer "Sincronizar" para mejores marcas - se guardan al momento

---

## 🚀 Próximos Pasos Recomendados

Si quieres mejorar la persistencia de ritmos de entrenamiento:

1. Modificar tipo `Swimmer` para incluir `trainingPaces`
2. Calcular y guardar ritmos al actualizar mejores marcas
3. Opcionalmente, permitir edición manual de ritmos que override el cálculo automático
