# 🏊‍♂️ Master UCH - Aplicación de Natación

## 📱 Progressive Web App (PWA)

**¡Tu aplicación ahora es una PWA completa!** Los nadadores pueden instalarla en sus smartphones y usarla como una app nativa.

### ⚡ Quick Start - Completar Íconos PWA

```bash
# 1. Abrir el generador de íconos
# Visita: http://localhost:5173/pwa-tools.html
# O en producción: https://app-masteruchile.vercel.app/pwa-tools.html

# 2. Generar los 8 íconos PNG (2 minutos)
# Sube una de las 4 imágenes del logo oficial (con la "U" roja)
# Descarga los 8 archivos PNG generados automáticamente

# 3. Guardar en el proyecto (1 minuto)
# Arrastra los archivos a: /public/icons/

# 4. Desplegar (2 minutos)
git add .
git commit -m "🎨 Agregar íconos PWA oficiales Master UCH"
git push origin main

# 5. Verificar (después del deployment)
# Abre: https://app-masteruchile.vercel.app/
# Chrome DevTools → Lighthouse → PWA → Score > 90 ✅
# O usa: /verify-pwa-icons.html
```

### 🛠️ Herramientas PWA Disponibles

| Herramienta | Descripción |
|------------|-------------|
| `/pwa-tools.html` | 🎯 Centro de control con todas las herramientas |
| `/generate-pwa-icons.html` | 🎨 Genera los 8 íconos PNG automáticamente |
| `/verify-pwa-icons.html` | 🔍 Verifica que todos los íconos estén OK |
| `/pwa-setup-instructions.html` | 📖 Instrucciones visuales paso a paso |

### 📋 Estado Actual

- ✅ PWA configurada (Service Worker, manifest.json)
- ✅ Colores oficiales UCH (#003366) integrados
- ✅ Meta tags para iOS y Android
- ✅ Imágenes oficiales del logo recibidas
- ⏳ **Pendiente:** Generar 8 archivos PNG (usa las herramientas arriba)

📚 **Documentación completa:**
- `RESUMEN-ICONOS.md` - Resumen ejecutivo (5 minutos)
- `INSTRUCCIONES-ICONOS-PWA.md` - Guía detallada
- `QUICK_START_PWA.md` - Guía técnica PWA
- `GUIA_PWA_COMPLETA.md` - Documentación completa

---

## 🎯 Características

### Gestión de Entrenamientos
- 📅 **60 entrenamientos** organizados en 4 mesociclos (Base, Desarrollo, Pre-competitivo, Competitivo)
- 🏊 **3 sesiones por semana** (Lunes, Miércoles, Viernes)
- 📊 **Calendario integrado** con visualización por mesociclos
- 📝 **Descripción detallada** de cada entrenamiento

### Sistema de Nadadores
- 👥 **Registro completo** de nadadores con foto de perfil
- 📈 **Estadísticas personalizadas** por nadador
- 🏅 **Categorías Master** automáticas según edad
- ⏱️ **Marcas personales** por distancia y estilo
- 📊 **Historial de mejoras** y progresión

### Control de Asistencia
- ✅ **Check-in digital** por entrenamiento
- 📊 **Análisis de asistencia** con gráficos
- 🚨 **Alertas proactivas** por baja asistencia
- 📉 **Estadísticas de adherencia** por nadador

### Competencias
- 🏆 **Gestión de competencias** nacionales e internacionales
- 📝 **Registro de resultados** por nadador
- 🥇 **Podios y posiciones**
- 📊 **Comparación de marcas** vs records

### Records del Equipo
- 👑 **Records por categoría** (Master A, B, C, D, E, F)
- 🏊 **Por estilo** (Libre, Espalda, Pecho, Mariposa, Combinado)
- 🎯 **Por distancia** (50m, 100m, 200m, 400m, 800m, 1500m)
- 🔄 **Actualización automática** cuando se mejoran marcas

### Logros y Medallas
- 🏅 **Sistema de achievements** gamificado
- 🎖️ **Medallas** por hitos alcanzados
- 🎯 **Desafíos semanales** motivacionales
- 📊 **Tablero de clasificación**

### Estadísticas Avanzadas
- 📈 **Volumen de entrenamiento** por mesociclo
- 📊 **Gráficos de progresión** con Recharts
- 🎯 **Análisis de metas** vs objetivos
- 📉 **Tendencias de rendimiento**

### PWA Features (Nuevo)
- 📱 **Instalable** en smartphones
- 🌐 **Funciona offline** (sin internet)
- ⚡ **Carga ultra-rápida** con caché inteligente
- 🔔 **Notificaciones push** (próximamente)
- 🎨 **Experiencia nativa** en pantalla completa

---

## 🔐 Autenticación y Roles

### Roles Disponibles
- **Admin** (Administrador principal)
- **Coach** (Entrenador)
- **Swimmer** (Nadador)

### Credenciales de Prueba
```
Email: admin@uch.cl
Password: admin123
```

### Control de Acceso
- ✅ Solo el admin puede crear cuentas
- ✅ Nadadores y coaches solicitan contraseña al admin
- ✅ Sistema de solicitudes de acceso
- ✅ Gestión de permisos por rol

---

## 🛠️ Tecnologías

### Frontend
- **React 18.3.1** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS v4** - Styling
- **Radix UI** - Componentes accesibles
- **Recharts** - Gráficos y visualizaciones
- **Motion** - Animaciones
- **Lucide React** - Iconos
- **Sonner** - Notificaciones

### Backend
- **Supabase** - Base de datos PostgreSQL
- **Supabase Auth** - Autenticación
- **Supabase Storage** - Almacenamiento de archivos
- **Edge Functions** - API RESTful con Hono

### Build & Deploy
- **Vite 6.3.5** - Build tool optimizado
- **Vercel** - Hosting y despliegue continuo
- **PWA** - Service Worker + Manifest

### PWA Stack
- **Service Worker** - Caché y funcionalidad offline
- **Manifest.json** - Configuración de instalación
- **Workbox** (próximamente) - Herramientas avanzadas de caché

---

## 📂 Estructura del Proyecto

```
/
├── public/                      # Archivos estáticos
│   ├── manifest.json           # Configuración PWA ⭐
│   ├── service-worker.js       # Service Worker ⭐
│   ├── sw-register.js          # Registro del SW ⭐
│   ├── offline.html            # Página offline ⭐
│   ├── icon-generator.html     # Generador de íconos ⭐
│   └── icons/                  # Íconos de la app ⭐
│       ├── icon.svg            # Ícono vectorial ⭐
│       └── *.png               # Íconos PNG (generar) ⭐
├── src/
│   ├── main.tsx               # Entry point React ⭐
│   ├── app/
│   │   ├── App.tsx            # Componente principal
│   │   ├── components/        # Componentes React
│   │   │   ├── PWAInstallPrompt.tsx  # Prompt de instalación ⭐
│   │   │   ├── PWADebug.tsx          # Panel de debug PWA ⭐
│   │   │   ├── SwimmerCard.tsx
│   │   │   ├── WorkoutManager.tsx
│   │   │   ├── AttendanceManager.tsx
│   │   │   ├── CompetitionManager.tsx
│   │   │   └── ui/            # Componentes de UI
│   │   ├── contexts/          # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/          # APIs y servicios
│   │   │   ├── api.ts         # API REST
│   │   │   ├── auth.ts        # Autenticación
│   │   │   └── supabase.ts    # Cliente Supabase
│   │   ├── data/              # Datos y tipos
│   │   │   ├── swimmers.ts
│   │   │   ├── workouts.ts
│   │   │   └── challenges.ts
│   │   └── utils/             # Utilidades
│   └── styles/                # Estilos globales
├── supabase/
│   └── functions/             # Edge Functions
│       └── server/
│           ├── index.tsx      # API REST con Hono
│           └── kv_store.tsx   # Key-Value store
├── index.html                 # HTML principal con PWA meta tags ⭐
├── vite.config.ts            # Configuración Vite + PWA ⭐
├── package.json              # Dependencias + scripts PWA ⭐
├── QUICK_START_PWA.md        # Guía rápida PWA ⭐
├── GUIA_PWA_COMPLETA.md      # Guía técnica completa ⭐
├── PWA_INSTALACION.md        # Guía para usuarios ⭐
└── RESUMEN_PWA.md            # Resumen ejecutivo ⭐
```

⭐ = Archivos nuevos para PWA

---

## 🚀 Instalación y Desarrollo

### Requisitos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-repo/master-uch.git
cd master-uch

# Instalar dependencias
pnpm install

# Configurar variables de entorno (ya configuradas en Vercel)
# Ver: /utils/supabase/info.tsx

# Ejecutar en desarrollo
pnpm dev

# La app estará en: http://localhost:3000
```

### Build para Producción

```bash
# Build optimizado
pnpm build

# Preview del build
pnpm preview

# Verificar PWA
pnpm pwa:check
```

---

## 📱 Instalar como PWA

### En Android (Chrome)
1. Visita: https://app-masteruchile.vercel.app/
2. Toca el menú (⋮) → **"Instalar aplicación"**
3. O espera el botón automático "📱 Instalar App"

### En iPhone/iPad (Safari)
1. Visita: https://app-masteruchile.vercel.app/
2. Toca el botón compartir (📤)
3. Selecciona **"Agregar a pantalla de inicio"**

### En Windows/Mac (Chrome/Edge)
1. Visita: https://app-masteruchile.vercel.app/
2. Click en el ícono de instalación (+) en la barra de direcciones
3. O ve al menú → **"Instalar Master UCH"**

📖 Más detalles: Ver `PWA_INSTALACION.md`

---

## 📊 Mesociclos de Entrenamiento

El programa está dividido en 4 mesociclos:

### 1. Base (Semanas 1-5)
- **Objetivo:** Construcción de resistencia aeróbica
- **Volumen:** Alto
- **Intensidad:** Baja-Media
- **Énfasis:** Técnica y resistencia

### 2. Desarrollo (Semanas 6-10)
- **Objetivo:** Aumento de velocidad y potencia
- **Volumen:** Medio-Alto
- **Intensidad:** Media-Alta
- **Énfasis:** Velocidad y técnica específica

### 3. Pre-competitivo (Semanas 11-15)
- **Objetivo:** Trabajo específico de competencia
- **Volumen:** Medio
- **Intensidad:** Alta
- **Énfasis:** Ritmo de competencia

### 4. Competitivo (Semanas 16-20)
- **Objetivo:** Taper y competencias
- **Volumen:** Bajo
- **Intensidad:** Muy Alta
- **Énfasis:** Descarga y velocidad máxima

---

## 🏅 Categorías Master

- **Master A:** 25-29 años
- **Master B:** 30-34 años
- **Master C:** 35-39 años
- **Master D:** 40-44 años
- **Master E:** 45-49 años
- **Master F:** 50+ años

---

## 🌐 Deploy en Vercel

La aplicación está desplegada automáticamente en:
**https://app-masteruchile.vercel.app/**

### Despliegue Automático
- Push a `main` → Deploy automático
- Preview deploys en branches
- HTTPS habilitado por defecto ✅

### Variables de Entorno
Ya configuradas en Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

---

## 🐛 Debugging

### Panel de Debug PWA

Presiona **Ctrl+Shift+D** para mostrar el panel de debug que verifica:
- ✅ Estado de instalación
- ✅ Service Worker activo
- ✅ Manifest válido
- ✅ Conexión online/offline
- ✅ HTTPS habilitado

### Chrome DevTools

**Verificar Service Worker:**
1. F12 → Application → Service Workers
2. Debe mostrar: "Active and Running"

**Verificar Manifest:**
1. F12 → Application → Manifest
2. Verificar íconos y configuración

**Auditoría Lighthouse:**
1. F12 → Lighthouse
2. Progressive Web App
3. Generate report → Score > 90

---

## 📈 Roadmap PWA

### ✅ Completado
- [x] Service Worker implementado
- [x] Manifest.json configurado
- [x] Caché inteligente de assets
- [x] Modo offline funcional
- [x] Instalación en Android
- [x] Instalación en iOS
- [x] Indicador de estado online/offline
- [x] Prompt personalizado de instalación
- [x] Panel de debug

### 🔄 En Progreso
- [ ] Generar íconos PNG (acción manual requerida)

### 📋 Próximamente
- [ ] Notificaciones push
- [ ] Background sync
- [ ] Splash screens personalizados
- [ ] Shortcuts (acciones rápidas)
- [ ] Publicación en Google Play (TWA)

---

## 🤝 Contribuir

### Agregar una Nueva Característica

1. Crear branch: `git checkout -b feature/nueva-caracteristica`
2. Desarrollar y probar
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-caracteristica`
5. Crear Pull Request

### Reportar un Bug

1. Ve a Issues
2. Click en "New Issue"
3. Describe el problema con detalles
4. Incluye screenshots si es posible

---

## 📄 Licencia

Este proyecto es privado y de uso exclusivo del equipo Master de Natación de la Universidad de Chile.

---

## 📞 Contacto

- **Admin:** admin@uch.cl
- **Website:** https://app-masteruchile.vercel.app/
- **Equipo:** Master Natación UCH

---

## 🙏 Agradecimientos

- Equipo Master UCH
- Entrenadores y nadadores
- Supabase por el backend
- Vercel por el hosting
- Comunidad React y Open Source

---

**¡A nadar! 🏊‍♂️🏊‍♀️**

*Última actualización: Enero 2026*  
*Versión: 2.0 (PWA Ready)*