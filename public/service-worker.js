// Service Worker para PWA Master UCH
const CACHE_NAME = 'master-uch-v1';
const RUNTIME_CACHE = 'master-uch-runtime-v1';

// Archivos esenciales para cachear durante la instalación
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/src/app/App.tsx',
  '/src/styles/index.css',
  '/manifest.json'
];

// URLs que NO deben cachearse (API calls)
const EXCLUDED_URLS = [
  '/functions/v1/',
  'supabase.co',
  'api.',
  'analytics'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files');
        // Solo cachear los archivos que existen
        return cache.addAll(ESSENTIAL_FILES.filter(url => url !== '/index.html'));
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estrategia de caché
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear peticiones a APIs externas
  if (EXCLUDED_URLS.some(excluded => request.url.includes(excluded))) {
    // Network only para API calls
    event.respondWith(fetch(request));
    return;
  }

  // Para peticiones POST, PUT, DELETE - solo network
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // Estrategia: Cache First para assets, Network First para páginas
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    // Cache First para recursos estáticos
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            // Solo cachear respuestas exitosas
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Si falla, retornar una respuesta básica
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
    );
  } else {
    // Network First para páginas HTML y datos
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla, intentar retornar desde cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no hay cache, retornar página offline
            return caches.match('/').then((response) => {
              return response || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/html'
                })
              });
            });
          });
        })
    );
  }
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendanceData());
  }
});

// Función auxiliar para sincronizar datos
async function syncAttendanceData() {
  console.log('[SW] Syncing attendance data...');
  // Aquí podrías implementar lógica de sincronización
  // cuando la app vuelva a estar online
}

// Notificaciones push (opcional)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Master UCH';
  const options = {
    body: data.body || 'Nueva actualización disponible',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
