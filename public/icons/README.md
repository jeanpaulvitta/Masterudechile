# Íconos de la Aplicación Master UCH

Esta carpeta contiene los íconos de la aplicación en diferentes tamaños para PWA.

## 📱 Tamaños requeridos:
- **72x72** - Mínimo para Android
- **96x96** - Chrome
- **128x128** - Chrome Web Store
- **144x144** - Windows tiles
- **152x152** - iPad
- **192x192** - Android estándar (requerido)
- **384x384** - Android
- **512x512** - Máximo para splash screens (requerido)

## 🎨 Generar íconos PNG desde SVG:

### Opción 1: Herramientas Online (Recomendado)
1. Visita: https://realfavicongenerator.net/
2. Sube el archivo `/public/icons/icon.svg`
3. Descarga el paquete de íconos
4. Coloca los archivos en esta carpeta con el formato: `icon-{size}x{size}.png`

### Opción 2: PWA Builder
1. Visita: https://www.pwabuilder.com/imageGenerator
2. Sube el SVG
3. Descarga los íconos generados

### Opción 3: Usando Sharp (Local)
```bash
npm install sharp
node generate-icons.js
```

## 📂 Estructura de archivos:
```
/public/icons/
├── icon.svg              # Ícono original vectorial
├── icon-72x72.png       # Android mínimo
├── icon-96x96.png       # Chrome
├── icon-128x128.png     # Chrome Web Store
├── icon-144x144.png     # Windows tiles
├── icon-152x152.png     # iPad
├── icon-192x192.png     # Android estándar ⭐
├── icon-384x384.png     # Android
└── icon-512x512.png     # Splash screens ⭐
```

## ⚠️ Importante:
- Los íconos de 192x192 y 512x512 son **obligatorios** para PWA
- Usa fondo sólido (no transparente) para mejor compatibilidad
- El diseño actual usa degradado azul (#0ea5e9 a #0284c7)

## 🔄 Estado actual:
- ✅ SVG creado
- ⏳ PNGs pendientes de generación

Genera los íconos PNG usando alguna de las opciones anteriores para completar la PWA.
