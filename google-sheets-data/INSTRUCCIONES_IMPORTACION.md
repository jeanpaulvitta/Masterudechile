# 📊 Guía de Importación a Google Sheets

## Archivos CSV Creados

He creado 6 archivos CSV listos para importar a Google Sheets:

1. **1_nadadores.csv** - Información de los 18 nadadores
2. **2_asistencia.csv** - Registro de asistencia (primeras 3 sesiones)
3. **3_entrenamientos.csv** - 60 sesiones de entrenamiento completas
4. **4_desafios_sabados.csv** - 20 desafíos especiales de los sábados
5. **5_competencias.csv** - 4 competencias de la temporada
6. **6_participacion_competencias.csv** - Resultados de nadadores en competencias

---

## 📋 Instrucciones Paso a Paso

### Paso 1: Crear Nueva Hoja de Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com)
2. Haz clic en **"+ Nuevo"** o **"Blank"** para crear una hoja nueva
3. Nómbrala: **"Natación Master UCH - Temporada 2025"**

---

### Paso 2: Importar Cada Archivo CSV

Para cada uno de los 6 archivos CSV, sigue estos pasos:

#### 2.1. Descargar los archivos CSV del proyecto

Los archivos están en la carpeta `/google-sheets-data/`

#### 2.2. Importar a Google Sheets

1. En Google Sheets, ve a **Archivo → Importar**
2. Selecciona la pestaña **"Cargar"**
3. Haz clic en **"Seleccionar un archivo de tu dispositivo"**
4. Selecciona el archivo CSV correspondiente
5. Configura las opciones de importación:
   - **Ubicación de importación:** "Insertar nuevas hojas"
   - **Tipo de separador:** "Detectar automáticamente" o "Coma"
   - **Convertir texto a números y fechas:** Sí (marcado)
6. Haz clic en **"Importar datos"**

#### 2.3. Renombrar las pestañas

Después de importar cada archivo, renombra las pestañas:

1. `1_nadadores` → **Nadadores**
2. `2_asistencia` → **Asistencia**
3. `3_entrenamientos` → **Entrenamientos**
4. `4_desafios_sabados` → **Desafíos_Sábados**
5. `5_competencias` → **Competencias**
6. `6_participacion_competencias` → **Participación_Competencias**

---

## 🎨 Paso 3: Formato y Mejoras (Opcional)

### 3.1. Formato de Encabezados

Para cada pestaña:
1. Selecciona la fila 1 (encabezados)
2. **Formato → Texto → Negrita**
3. **Formato → Relleno de color → Azul claro**
4. **Vista → Inmovilizar → 1 fila**

### 3.2. Ajustar Ancho de Columnas

1. Selecciona todas las celdas (Ctrl+A o Cmd+A)
2. Haz doble clic en el borde entre dos columnas para auto-ajustar
3. O arrastra manualmente para ajustar el ancho

---

## 📊 Paso 4: Agregar Fórmulas Útiles (Opcional)

### Pestaña: Dashboard (Nueva)

Crea una nueva pestaña llamada **"Dashboard"** con estas fórmulas:

#### Total de Nadadores
```
=COUNTA(Nadadores!A2:A19)
```

#### Asistencia Promedio General
```
=COUNTIF(Asistencia!C:C,"SÍ")/COUNTA(Asistencia!C2:C)*100
```

#### Distancia Total Nadada (Todos)
```
=SUM(Asistencia!E:E)/1000
```
*(Resultado en kilómetros)*

#### Promedio Escala de Borg
```
=AVERAGEIF(Asistencia!F:F,">0")
```

#### Nadadores por Horario

**7am:**
```
=COUNTIF(Nadadores!E:E,"7am")
```

**8am:**
```
=COUNTIF(Nadadores!E:E,"8am")
```

**9pm:**
```
=COUNTIF(Nadadores!E:E,"9pm")
```

---

## 🔗 Paso 5: Conectar con la Aplicación

### 5.1. Obtener el Enlace de Google Sheets

1. En tu hoja de Google Sheets, haz clic en **"Compartir"** (esquina superior derecha)
2. Configura los permisos:
   - **Para edición:** Agrega emails de entrenadores y staff
   - **Para solo lectura (opcional):** "Cualquier persona con el enlace"
3. Copia el enlace de la hoja

### 5.2. Actualizar la Aplicación Web

1. Abre el archivo `/src/app/components/GoogleSheetsLink.tsx`
2. Busca la línea 10:
```typescript
const defaultSheetUrl = "https://docs.google.com/spreadsheets/d/TU_ID_DE_HOJA_AQUI/edit";
```
3. Reemplázala con tu enlace:
```typescript
const defaultSheetUrl = "TU_ENLACE_COPIADO_AQUÍ";
```
4. Guarda el archivo

---

## 📈 Paso 6: Crear Gráficos (Opcional)

### Gráfico de Asistencia por Horario

1. Selecciona datos de la pestaña **Nadadores**: columnas `nombre` y `horario`
2. **Insertar → Gráfico**
3. Tipo: **Gráfico de sectores** o **Gráfico de barras**

### Gráfico de Progresión de Distancia

1. Selecciona de **Entrenamientos**: columnas `fecha` y `distancia_total`
2. **Insertar → Gráfico**
3. Tipo: **Gráfico de líneas**

### Gráfico de Medallas por Nadador

1. En **Participación_Competencias**, crea una tabla dinámica
2. Cuenta medallas por `nadador_id`
3. Crea gráfico de barras

---

## 🔐 Paso 7: Configurar Permisos

### Permisos Recomendados:

**Entrenadores y Staff Técnico:**
- Acceso de **edición completa**
- Pueden modificar todos los datos

**Nadadores:**
- Acceso de **solo lectura** (opcional)
- Pueden ver sus datos pero no modificarlos

**Público:**
- Sin acceso (privado)

---

## 💡 Consejos Adicionales

### Validación de Datos

Para evitar errores de entrada, agrega validación:

**En columna "horario" (Nadadores):**
1. Selecciona la columna E (horario)
2. **Datos → Validación de datos**
3. Criterios: **Lista de elementos**
4. Valores: `7am,8am,9pm`

**En columna "presente" (Asistencia):**
1. Selecciona la columna C (presente)
2. **Datos → Validación de datos**
3. Criterios: **Lista de elementos**
4. Valores: `SÍ,NO`

### Formato Condicional

**Resaltar baja asistencia:**
1. Selecciona columna `presente` en Asistencia
2. **Formato → Formato condicional**
3. Si el texto es exactamente "NO" → Color de fondo rojo claro

**Resaltar alta escala de Borg:**
1. Selecciona columna `escala_borg` en Asistencia
2. **Formato → Formato condicional**
3. Si el valor es mayor o igual a 8 → Color de fondo naranja

---

## ✅ Verificación Final

Marca cada ítem cuando lo completes:

- [ ] 6 archivos CSV importados correctamente
- [ ] Pestañas renombradas apropiadamente
- [ ] Encabezados formateados (negrita, color, inmovilizados)
- [ ] Columnas ajustadas para mejor visualización
- [ ] Fórmulas agregadas en Dashboard (opcional)
- [ ] Gráficos creados (opcional)
- [ ] Validación de datos configurada (opcional)
- [ ] Permisos de compartir configurados
- [ ] Enlace actualizado en la aplicación web

---

## 🆘 Solución de Problemas

### Problema: Los datos se importan en una sola columna

**Solución:** 
- Vuelve a importar y selecciona **"Coma"** como separador
- Asegúrate de que el archivo tenga extensión `.csv`

### Problema: Las fechas se ven incorrectas

**Solución:**
- Selecciona las columnas de fecha
- **Formato → Número → Fecha**

### Problema: Los decimales se ven con punto en lugar de coma

**Solución:**
- Selecciona las celdas numéricas
- **Formato → Número → Número personalizado**
- Configura según preferencia regional

---

## 📞 Soporte

Para más ayuda con Google Sheets:
- [Centro de Ayuda de Google Sheets](https://support.google.com/docs/answer/6000292)
- [Tutoriales de importación CSV](https://support.google.com/docs/answer/40608)

---

¡Tu base de datos está lista para gestionar toda la temporada del equipo Master UCH! 🏊‍♂️🏊‍♀️
