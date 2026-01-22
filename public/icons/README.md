# Íconos de la Aplicación Master UCH - Natación

Esta carpeta contiene los íconos oficiales de la aplicación en diferentes tamaños para PWA.

## 🎨 Logo Oficial
El logo oficial del equipo de Natación Master UCH incluye:
- **Fondo**: Azul UCH (#003366) con imagen de nadadores
- **"U" roja**: Logo característico de la Universidad de Chile
- **Texto**: "NATACIÓN MASTER" en blanco
- **Logos institucionales**: DGAF, DeporteAzul, Alumni

## 📱 Tamaños requeridos para PWA:
- **72x72** - Mínimo para Android
- **96x96** - Chrome
- **128x128** - Chrome Web Store
- **144x144** - Windows tiles
- **152x152** - iPad
- **192x192** - Android estándar ⭐ **OBLIGATORIO**
- **384x384** - Android
- **512x512** - Máximo para splash screens ⭐ **OBLIGATORIO**

## 🚀 Generar íconos PNG desde las imágenes oficiales:

### ✨ Opción 1: Generador Integrado (Más Fácil)
1. Abre en tu navegador: `/generate-pwa-icons.html`
2. Sube una de las imágenes oficiales del logo
3. Se generarán automáticamente todos los tamaños
4. Descarga todos los íconos con un clic
5. Guarda los archivos en esta carpeta

### 🌐 Opción 2: Herramienta Online
1. Visita: https://realfavicongenerator.net/
2. Sube la imagen más grande que tengas (preferiblemente 512x512 o mayor)
3. Descarga el paquete de íconos
4. Renombra los archivos al formato: `icon-{size}x{size}.png`
5. Coloca todos los archivos en esta carpeta

### 🎨 Opción 3: Canva o Photoshop
Si tienes la imagen en alta resolución:
1. Abre en Canva/Photoshop
2. Exporta en los siguientes tamaños: 72, 96, 128, 144, 152, 192, 384, 512
3. Nombra cada archivo: `icon-72x72.png`, `icon-96x96.png`, etc.
4. Guarda todos en esta carpeta

## 📂 Estructura de archivos final:
```
/public/icons/
├── favicon.svg           # Favicon vectorial
├── icon.svg             # Ícono SVG original
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
- Los íconos de **192x192** y **512x512** son **OBLIGATORIOS** para PWA
- Usa las imágenes oficiales que subiste (con la "U" roja y fondo azul)
- Mantén la relación de aspecto cuadrada (1:1)
- Formato PNG con fondo sólido (no transparente)

## 🔄 Estado actual:
- ✅ SVG placeholder creado
- ✅ Favicon.svg agregado
- ✅ Imágenes oficiales recibidas (4 tamaños)
- ⏳ **PNGs en todos los tamaños requeridos - PENDIENTE**

## 📋 Próximos pasos:
1. Genera los 8 tamaños PNG usando el generador integrado
2. Guarda todos los archivos en esta carpeta
3. Verifica que todos los nombres coincidan con el manifest.json
4. Haz commit y push de los cambios
5. ¡Tu PWA estará lista para instalarse en smartphones! 🎉

## 🆘 ¿Necesitas ayuda?
Si tienes problemas generando los íconos, puedes:
- Usar el generador integrado en `/generate-pwa-icons.html`
- Compartir las imágenes PNG generadas para integrarlas al proyecto
- El sistema está configurado y solo espera los archivos PNG
