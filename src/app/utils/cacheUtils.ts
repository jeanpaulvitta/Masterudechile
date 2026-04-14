// Utils para optimizar localStorage y reducir egress

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

/**
 * Guardar datos en localStorage con expiración
 */
export function setCache<T>(key: string, data: T, expiresInMs: number = 1000 * 60 * 30): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to set cache:', error);
  }
}

/**
 * Obtener datos de localStorage si no han expirado
 */
export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);
    const now = Date.now();

    // Verificar si expiró
    if (now - entry.timestamp > entry.expiresIn) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

/**
 * Limpiar toda la caché expirada
 */
export function clearExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return;

        const entry = JSON.parse(item);
        if (entry.timestamp && entry.expiresIn) {
          if (now - entry.timestamp > entry.expiresIn) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignorar errores en items individuales
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
}

/**
 * Obtener estadísticas de uso de caché
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage);
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    keys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
        try {
          const entry = JSON.parse(item);
          if (entry.timestamp && entry.expiresIn) {
            if (now - entry.timestamp > entry.expiresIn) {
              expiredCount++;
            }
          }
        } catch {
          // Ignorar
        }
      }
    });

    return {
      totalKeys: keys.length,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      expiredCount,
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return { totalKeys: 0, totalSizeKB: '0', expiredCount: 0 };
  }
}

// Limpiar caché expirada al cargar
if (typeof window !== 'undefined') {
  clearExpiredCache();
}
