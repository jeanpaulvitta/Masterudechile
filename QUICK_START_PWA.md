# ⚡ Quick Start - PWA Master UCH

## 🎯 Acción Inmediata (5 minutos)

### 1️⃣ Generar Íconos PNG

**Opción A - Online (más fácil):**
```
1. Visita: https://realfavicongenerator.net/
2. Sube: /public/icons/icon.svg
3. Descarga el ZIP
4. Extrae los PNG en: /public/icons/
```

**Opción B - Local:**
```bash
# Abre en tu navegador:
open public/icon-generator.html

# Click en "Descargar Todos los Íconos"
# Mueve los PNG a: /public/icons/
```

### 2️⃣ Desplegar

```bash
git add .
git commit -m "✨ PWA Master UCH lista"
git push origin main
```

Vercel desplegará automáticamente en ~2 minutos.

### 3️⃣ Verificar

```
1. Abre: https://app-masteruchile.vercel.app/
2. Presiona F12
3. Lighthouse → PWA → Generate report
4. Score debe ser > 90 ✅
```

---

## 📱 Instalar en tu Móvil

### Android
```
1. Abre Chrome
2. Ve a: app-masteruchile.vercel.app
3. Espera 30 segundos
4. Click en "Instalar App"
```

### iOS
```
1. Abre Safari
2. Ve a: app-masteruchile.vercel.app
3. Toca el botón compartir (📤)
4. "Agregar a pantalla de inicio"
```

---

## ✅ Checklist Mínimo

- [ ] Íconos PNG en `/public/icons/` (al menos 192x192 y 512x512)
- [ ] Push a GitHub
- [ ] Vercel desplegado
- [ ] Lighthouse score > 90
- [ ] Instalación probada

---

## 📚 Documentación Completa

- **Técnica:** `GUIA_PWA_COMPLETA.md`
- **Usuarios:** `PWA_INSTALACION.md`
- **Resumen:** `RESUMEN_PWA.md`

---

## 🆘 Ayuda Rápida

**No aparece el botón de instalar:**
- Verifica que los PNG existan (especialmente 192x192 y 512x512)
- Limpia caché: Ctrl+Shift+R
- Verifica manifest: DevTools → Application → Manifest

**Error en Service Worker:**
- DevTools → Console → busca errores en rojo
- DevTools → Application → Service Workers → verificar estado

**Funciona en local pero no en producción:**
- Vercel debe tener HTTPS (lo tiene por defecto)
- Verifica que los archivos se subieron: `/manifest.json`, `/service-worker.js`

---

## 💡 Tips

1. **Los íconos son OBLIGATORIOS** - la PWA no funciona sin ellos
2. **HTTPS es requerido** - Vercel lo tiene automáticamente
3. **Prueba en dispositivos reales** - el simulador puede no ser preciso
4. **Limpia caché frecuentemente** durante desarrollo

---

**¡Listo en 5 minutos! 🚀**

Después del deploy, comparte este link con el equipo:  
👉 `https://app-masteruchile.vercel.app/`
