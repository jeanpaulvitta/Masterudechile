# 🚀 Optimizaciones de Egress en Supabase

## 📊 Problema Original

La aplicación consumía **todo el límite de 2 GB de egress mensual** del plan gratuito de Supabase debido a:

1. **Consultas sin caché**: Cada recarga de página traía todos los datos nuevamente
2. **Datos históricos completos**: Se cargaban 44 semanas × 7 días = 308 entrenamientos cada vez
3. **Múltiples calendarios**: 3 calendarios diferentes hacían las mismas consultas
4. **Sin filtros por fecha**: Siempre se traían todos los registros históricos
5. **Sin almacenamiento local**: Ningún dato se guardaba en el navegador

## ✅ Soluciones Implementadas

### 1. **React Query para Caché Inteligente**

Se instaló `@tanstack/react-query` con configuración agresiva de caché:

```typescript
// src/app/contexts/QueryProvider.tsx
gcTime: 1000 * 60 * 30,              // 30 minutos de caché
staleTime: 1000 * 60 * 5,            // 5 minutos antes de revalidar
refetchOnWindowFocus: false,         // No refetch al cambiar de pestaña
refetchOnReconnect: false,           // No refetch al reconectar
```

**Reducción estimada**: 60-80% menos consultas

### 2. **Hooks Optimizados con Filtros**

Creamos hooks personalizados en `src/app/hooks/useOptimizedData.ts`:

#### Hook del mes actual (🔥 CLAVE)
```typescript
useCurrentMonthData()
// Trae solo 30 días en vez de 308 días
// Reducción: 90% menos datos
```

#### Hook con rango de fechas
```typescript
useDateRangeData(startDate, endDate, swimmerId?)
// Filtra por fechas y nadador específico
```

### 3. **API con Parámetros de Filtrado**

Modificamos `src/app/services/api.ts` para aceptar filtros:

```typescript
fetchWorkouts({ startDate, endDate, limit })
fetchAttendance({ swimmerId, startDate, endDate })
```

### 4. **LocalStorage Cache Utils**

Creamos `src/app/utils/cacheUtils.ts` con:

- `setCache()`: Guardar datos con expiración
- `getCache()`: Obtener datos si no expiraron
- `clearExpiredCache()`: Limpiar automáticamente
- `getCacheStats()`: Ver estadísticas de uso

**Uso recomendado**: Para datos estáticos como lista de nadadores, competencias

### 5. **QueryProvider Integrado**

Se envolvió toda la app con QueryProvider en `App.tsx`:

```typescript
<QueryProvider>
  <AuthProvider>
    <MainApp />
  </AuthProvider>
</QueryProvider>
```

## 📈 Impacto Esperado

### Antes
- **Cada recarga**: ~500 KB - 1 MB de datos
- **Cada calendario**: Trae 308 entrenamientos completos
- **Sin caché**: Todo se vuelve a descargar
- **Consumo mensual**: 2+ GB (límite excedido)

### Después
- **Primera carga**: ~100 KB (solo mes actual)
- **Recargas subsecuentes**: ~0 KB (caché)
- **Calendarios**: Comparten caché
- **Consumo mensual estimado**: 200-400 MB (80-90% reducción)

## 🎯 Cómo Usar las Optimizaciones

### En componentes nuevos:

```typescript
import { useCurrentMonthData } from '../hooks/useOptimizedData';

function MiComponente() {
  // Solo trae datos del mes actual
  const { workouts, attendance } = useCurrentMonthData();

  if (workouts.isLoading) return <div>Cargando...</div>;

  return <div>{workouts.data?.length} entrenamientos</div>;
}
```

### Para rangos específicos:

```typescript
import { useDateRangeData } from '../hooks/useOptimizedData';

function MiComponente() {
  const { workouts, attendance } = useDateRangeData(
    '2026-03-01',  // startDate
    '2026-03-31',  // endDate
    'swimmer-id'   // opcional
  );

  return <div>{workouts.data?.length} entrenamientos de marzo</div>;
}
```

### Usar caché de localStorage:

```typescript
import { setCache, getCache } from '../utils/cacheUtils';

// Guardar por 1 hora
setCache('swimmers-list', swimmers, 1000 * 60 * 60);

// Obtener (null si expiró)
const cached = getCache<Swimmer[]>('swimmers-list');
```

## 🔧 Próximos Pasos Recomendados

### Migrar calendarios existentes:

1. **IntegratedCalendar.tsx**
   - Usar `useCurrentMonthData()` en vez de traer todo
   - Cambiar al mes anterior/siguiente: refetch con nuevas fechas

2. **UnifiedCalendarManager.tsx**
   - Igual que IntegratedCalendar
   - Filtrar solo entrenamientos del mes visible

3. **MesocicloCalendar.tsx**
   - Usar `useDateRangeData()` con las fechas de la semana visible

### Optimizaciones adicionales:

1. **Paginación en listas largas**
   - Cargar nadadores de 20 en 20
   - Infinite scroll en vez de cargar todo

2. **Lazy loading de estadísticas**
   - Cargar estadísticas solo cuando se abre la pestaña
   - No pre-cargar datos de todos los meses

3. **Compresión de datos**
   - Considerar comprimir respuestas grandes
   - Usar `gzip` en el servidor

4. **Prefetch inteligente**
   - Pre-cargar mes siguiente cuando el usuario está al final del mes
   - Background fetch sin bloquear UI

## 📋 Checklist de Migración

Para cada componente que use datos:

- [ ] Reemplazar `useState` + `useEffect` + `fetch` por hooks de React Query
- [ ] Usar `useCurrentMonthData()` para calendarios mensuales
- [ ] Usar `useDateRangeData()` para rangos específicos
- [ ] Agregar filtros por fecha donde tenga sentido
- [ ] Usar caché de localStorage para datos que casi nunca cambian
- [ ] Probar que los datos se cargan correctamente
- [ ] Verificar que el caché funciona (segunda carga instantánea)

## 🎉 Beneficios Adicionales

Además de reducir egress, estas optimizaciones traen:

1. **Mejor UX**: Carga inicial más rápida
2. **Modo offline**: Datos en caché funcionan sin internet
3. **Menos bugs**: React Query maneja estados automáticamente
4. **Código más limpio**: Menos boilerplate de loading/error
5. **Developer experience**: Hooks reutilizables y tipados

## 🚨 Advertencias

1. **Migración gradual**: No migrar todo de golpe
2. **Testing**: Probar que los datos se actualizan correctamente
3. **Invalidación**: Asegurarse de invalidar caché al modificar datos
4. **Límites de localStorage**: Máximo ~5-10 MB por dominio
5. **Fechas**: Siempre usar formato ISO (YYYY-MM-DD)

## 📞 Soporte

Si tienes dudas sobre las optimizaciones:

1. Ver ejemplos en `src/app/hooks/useOptimizedData.ts`
2. Revisar configuración en `src/app/contexts/QueryProvider.tsx`
3. Consultar documentación de React Query: https://tanstack.com/query/latest

---

**Última actualización**: 2026-04-04
**Autor**: Sistema de optimización automática
**Versión**: 1.0.0
