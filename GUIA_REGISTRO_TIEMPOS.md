# ⏱️ Guía Completa: Cómo Registrar Tiempos de Marcas Personales

## 🎯 Nuevo Sistema Mejorado de Registro de Tiempos

Hemos mejorado significativamente la forma de ingresar tiempos de natación con un sistema intuitivo y guiado.

---

## 📱 Interfaz Mejorada

### **Antes (Antiguo):**
```
┌─────────────────────────────┐
│ Tiempo (MM:SS.SS)           │
│ ┌─────────────────────────┐ │
│ │ 01:23.45                │ │  ← Tenías que escribir todo manualmente
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### **Ahora (Nuevo):**
```
┌─────────────────────────────────────────────────────┐
│ ⏱️ Tiempo                                     ✅     │
│                                                      │
│  ┌────┐    ┌────┐    ┌────┐                        │
│  │ 01 │ :  │ 23 │ .  │ 45 │                        │
│  └────┘    └────┘    └────┘                        │
│   min       seg       cs                            │
│                                                      │
│ ✅ Tiempo: 01:23.45                                 │
│                                                      │
│ 📊 Referencia para 50m Libre:                       │
│  Récord Mundial │ Tiempo Bueno │ Promedio           │
│     00:20.91    │   00:28.00   │  00:35.00          │
│                                                      │
│ 💡 Ejemplos de formato:                             │
│  • 50m Libre: 00:28.50                              │
│  • 100m Libre: 01:02.30                             │
│  • 200m Libre: 02:18.75                             │
│  • 1500m Libre: 18:45.20                            │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Cómo Usar el Nuevo Sistema

### Paso 1: Selecciona Distancia y Estilo
```
Distancia: [50m ▼]    Estilo: [Libre ▼]
```

### Paso 2: Ingresa el Tiempo en 3 Campos Separados

#### **Campo 1: Minutos** (00-99)
- Para tiempos menores a 1 minuto: `00`
- Para 1 minuto y algo: `01`
- Para 2 minutos y algo: `02`
- Para 18 minutos y algo: `18`

#### **Campo 2: Segundos** (00-59)
- ⚠️ **IMPORTANTE:** Los segundos DEBEN ser 0-59
- Si pones `60` o más, aparecerá error en rojo
- Para 5 segundos: `05`
- Para 28 segundos: `28`
- Para 45 segundos: `45`

#### **Campo 3: Centésimas** (00-99)
- Son las fracciones de segundo
- Para 50 centésimas (medio segundo): `50`
- Para 25 centésimas: `25`
- Para 75 centésimas: `75`

### Ejemplo Práctico

**Quiero ingresar un tiempo de 1 minuto, 23 segundos y 45 centésimas:**

```
┌────┐    ┌────┐    ┌────┐
│ 01 │ :  │ 23 │ .  │ 45 │
└────┘    └────┘    └────┘
```

**Resultado:** `01:23.45` ✅

---

## ✅ Validación Automática

### ✔️ Tiempo Válido
Cuando ingresas un tiempo correcto:
- Aparece un ✅ check verde
- Se muestra el tiempo formateado en una caja azul
- Se activa el botón "Agregar Marca"

### ❌ Tiempo Inválido
Si hay un error:
- Aparece un ⚠️ círculo rojo
- Los campos con error se marcan en rojo
- Se muestra el mensaje de error específico

**Errores comunes:**
- `"Los segundos deben ser menor a 60"` → Pusiste 60 o más en el campo de segundos
- `"Las centésimas deben ser 00-99"` → Pusiste más de 99 en centésimas

---

## 📊 Tiempos de Referencia Automáticos

El sistema muestra automáticamente tiempos de referencia basados en la distancia que seleccionaste:

### Para 50m Libre:
```
┌──────────────┬─────────────┬──────────┐
│ Récord Mundial│ Tiempo Bueno│ Promedio │
├──────────────┼─────────────┼──────────┤
│   00:20.91   │  00:28.00   │ 00:35.00 │
└──────────────┴─────────────┴──────────┘
```

### Para 100m Libre:
```
┌──────────────┬─────────────┬──────────┐
│ Récord Mundial│ Tiempo Bueno│ Promedio │
├──────────────┼─────────────┼──────────┤
│   00:46.91   │  01:00.00   │ 01:20.00 │
└──────────────┴─────────────┴──────────┘
```

### Para 1500m Libre:
```
┌──────────────┬─────────────┬──────────┐
│ Récord Mundial│ Tiempo Bueno│ Promedio │
├──────────────┼─────────────┼──────────┤
│   14:31.02   │  20:00.00   │ 25:00.00 │
└──────────────┴─────────────┴──────────┘
```

**Esto te ayuda a:**
- Saber si tu tiempo es competitivo
- Establecer metas realistas
- Comparar tu rendimiento

---

## 💡 Ejemplos de Tiempos Reales

### 50 metros Libre
| Nivel | Tiempo | Cómo Ingresar |
|-------|--------|---------------|
| Elite | 00:23.50 | `00` : `23` . `50` |
| Avanzado | 00:28.00 | `00` : `28` . `00` |
| Intermedio | 00:32.75 | `00` : `32` . `75` |
| Principiante | 00:40.00 | `00` : `40` . `00` |

### 100 metros Libre
| Nivel | Tiempo | Cómo Ingresar |
|-------|--------|---------------|
| Elite | 00:52.30 | `00` : `52` . `30` |
| Avanzado | 01:02.00 | `01` : `02` . `00` |
| Intermedio | 01:15.50 | `01` : `15` . `50` |
| Principiante | 01:30.00 | `01` : `30` . `00` |

### 200 metros Libre
| Nivel | Tiempo | Cómo Ingresar |
|-------|--------|---------------|
| Elite | 01:55.00 | `01` : `55` . `00` |
| Avanzado | 02:20.00 | `02` : `20` . `00` |
| Intermedio | 02:45.00 | `02` : `45` . `00` |
| Principiante | 03:15.00 | `03` : `15` . `00` |

### 1500 metros Libre
| Nivel | Tiempo | Cómo Ingresar |
|-------|--------|---------------|
| Elite | 15:30.00 | `15` : `30` . `00` |
| Avanzado | 19:00.00 | `19` : `00` . `00` |
| Intermedio | 23:00.00 | `23` : `00` . `00` |
| Principiante | 28:00.00 | `28` : `00` . `00` |

---

## 🎓 Conversión de Formatos

### Si tienes el tiempo en otros formatos:

#### **Formato: Solo segundos (ej: 63.45)**
- Divide entre 60 para obtener minutos: 63 ÷ 60 = 1 minuto
- El resto son segundos: 63 - 60 = 3 segundos
- Mantén las centésimas: 45
- **Ingresa:** `01` : `03` . `45`

#### **Formato: Cronómetro digital (ej: 1'23"45)**
- Lo que está antes de `'` son minutos: 1
- Lo que está entre `'` y `"` son segundos: 23
- Lo que está después de `"` son centésimas: 45
- **Ingresa:** `01` : `23` . `45`

#### **Formato: Decimal (ej: 1.3916666 minutos)**
- Parte entera son minutos: 1
- Decimal × 60 = segundos: 0.3916666 × 60 = 23.5 segundos
- **Ingresa aproximado:** `01` : `23` . `50`

---

## ⚠️ Errores Comunes y Soluciones

### ❌ "Me aparece error en rojo"

**Problema:** Los segundos están en 60 o más
```
┌────┐    ┌────┐    ┌────┐
│ 01 │ :  │ 65 │ .  │ 00 │  ← ERROR: 65 segundos no existe
└────┘    └────┘    └────┘
```

**Solución:** 65 segundos = 1 minuto y 5 segundos
```
┌────┐    ┌────┐    ┌────┐
│ 02 │ :  │ 05 │ .  │ 00 │  ← CORRECTO
└────┘    └────┘    └────┘
```

### ❌ "No puedo agregar la marca"

**Causas posibles:**
1. No has completado todos los campos (falta minutos, segundos o centésimas)
2. Hay un error de validación (revisa que no haya números rojos)
3. No has seleccionado distancia o estilo

**Solución:** 
- Completa los 3 campos de tiempo
- Asegúrate de que aparezca el ✅ verde
- Verifica que distancia y estilo estén seleccionados

### ❌ "Se guardó un tiempo incorrecto"

**Causa:** No completaste todos los dígitos
```
┌────┐    ┌────┐    ┌────┐
│  1 │ :  │  5 │ .  │  2 │  ← Falta el cero adelante
└────┘    └────┘    └────┘
Resultado: 01:05.02 (puede no ser lo que querías)
```

**Solución:** Siempre usa 2 dígitos
```
┌────┐    ┌────┐    ┌────┐
│ 01 │ :  │ 05 │ .  │ 20 │  ← CORRECTO
└────┘    └────┘    └────┘
```

---

## 🏁 Flujo Completo de Registro

1. **Haz clic en "Mejores Marcas"** en tu perfil de nadador

2. **Selecciona la distancia** (ej: 50m)

3. **Selecciona el estilo** (ej: Libre)

4. **Aparecen los tiempos de referencia** automáticamente

5. **Ingresa el tiempo en los 3 campos:**
   - Minutos: `00`
   - Segundos: `28`
   - Centésimas: `50`

6. **Verifica que aparezca el ✅** y el preview del tiempo

7. **Selecciona la fecha** en que lograste esa marca

8. **(Opcional)** Ingresa el lugar (ej: "Piscina Olímpica")

9. **Haz clic en "Agregar Marca"**

10. **Revisa que aparezca en la lista de marcas registradas**

11. **Haz clic en "Guardar Marcas"** (botón verde al final)

12. **Espera el mensaje:** "✅ Mejores marcas guardadas exitosamente"

---

## 📱 Tips Pro

### ✨ Usa el Teclado Numérico
- En celular, aparecerá automáticamente el teclado numérico
- Más rápido y menos errores

### ✨ Presiona Tab para Avanzar
- Completa un campo y presiona `Tab` para ir al siguiente
- Más rápido que hacer clic

### ✨ Compara con las Referencias
- Usa los tiempos de referencia como guía
- Si tu tiempo es similar al "Promedio", ¡vas bien!
- Si es similar a "Tiempo Bueno", ¡excelente!

### ✨ Revisa el Preview
- Antes de hacer clic en "Agregar Marca"
- Verifica que el tiempo en la caja azul sea correcto
- Ejemplo: `Tiempo: 01:23.45`

---

## 🎯 Resumen Rápido

```
✅ DO (Hacer):
- Usa siempre 2 dígitos en cada campo
- Verifica que aparezca el ✅ verde
- Revisa el preview antes de agregar
- Guarda tus marcas al final

❌ DON'T (No hacer):
- No pongas 60 o más en segundos
- No dejes campos vacíos
- No olvides hacer clic en "Guardar Marcas"
- No cierres el diálogo sin guardar
```

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa esta guía
2. Verifica que los campos no estén en rojo
3. Asegúrate de que aparezca el ✅ verde
4. Contacta al administrador: admin@uch.cl

---

**¡Ahora es mucho más fácil registrar tus marcas personales!** 🏊‍♂️💪
