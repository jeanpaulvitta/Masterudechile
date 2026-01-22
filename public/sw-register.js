// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado exitosamente:', registration.scope);
        
        // Verificar actualizaciones periódicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Cada minuto

        // Notificar al usuario cuando hay una actualización disponible
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              console.log('🔄 Nueva versión disponible. Recarga la página para actualizar.');
              
              // Mostrar notificación al usuario
              if (window.confirm('Hay una nueva versión de la app disponible. ¿Deseas actualizar?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Error al registrar el Service Worker:', error);
      });

    // Detectar cuando la app vuelve a estar online
    window.addEventListener('online', () => {
      console.log('🌐 Conexión restaurada');
      // Intentar sincronizar datos pendientes
      if ('sync' in registration) {
        registration.sync.register('sync-attendance').catch((err) => {
          console.error('Error registrando sync:', err);
        });
      }
    });

    // Detectar cuando la app está offline
    window.addEventListener('offline', () => {
      console.log('📵 Sin conexión - Modo offline activado');
    });
  });
}

// Verificar si la app puede instalarse
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 La app puede instalarse');
  // Prevenir el prompt automático
  e.preventDefault();
  // Guardar el evento para usarlo después
  deferredPrompt = e;
  
  // Mostrar botón de instalación personalizado
  showInstallButton();
});

function showInstallButton() {
  // Crear botón de instalación si no existe
  if (!document.getElementById('install-button')) {
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.textContent = '📱 Instalar App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #0ea5e9;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-size: 14px;
    `;
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();
        
        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
        
        // Limpiar el prompt
        deferredPrompt = null;
        installButton.remove();
      }
    });
    
    document.body.appendChild(installButton);
    
    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
      installButton.style.transition = 'opacity 0.3s';
      installButton.style.opacity = '0';
      setTimeout(() => installButton.remove(), 300);
    }, 10000);
  }
}

// Detectar cuando la app fue instalada
window.addEventListener('appinstalled', () => {
  console.log('✅ App instalada exitosamente');
  deferredPrompt = null;
  
  // Ocultar botón de instalación si existe
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.remove();
  }
});
