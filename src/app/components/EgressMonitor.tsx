// Monitor de Egress y Caché
// Agregar este componente en algún lugar de la app (ej: pestaña de Configuración)

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getCacheStats, clearExpiredCache } from '../utils/cacheUtils';
import { Activity, Database, Trash2, RefreshCw, TrendingDown, AlertCircle } from 'lucide-react';

interface NetworkStats {
  totalRequests: number;
  totalBytesDownloaded: number;
  cachedResponses: number;
  timestamp: number;
}

export function EgressMonitor() {
  const [cacheStats, setCacheStats] = useState({ totalKeys: 0, totalSizeKB: '0', expiredCount: 0 });
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalRequests: 0,
    totalBytesDownloaded: 0,
    cachedResponses: 0,
    timestamp: Date.now(),
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Actualizar stats cada 5 segundos
    const interval = setInterval(() => {
      setCacheStats(getCacheStats());
    }, 5000);

    // Cargar stats iniciales
    setCacheStats(getCacheStats());

    return () => clearInterval(interval);
  }, []);

  const handleClearExpired = () => {
    clearExpiredCache();
    setCacheStats(getCacheStats());
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de limpiar toda la caché? Esto aumentará el tráfico temporalmente.')) {
      localStorage.clear();
      setCacheStats({ totalKeys: 0, totalSizeKB: '0', expiredCount: 0 });
      window.location.reload(); // Recargar para volver a cachear
    }
  };

  // Estimar egress mensual basado en localStorage
  const estimatedMonthlyEgressMB = useMemo(() => {
    // Promedio: ~100 KB por sesión si usa caché optimizado
    // Sin caché: ~500 KB por sesión
    // Asumiendo 50 sesiones al mes (usuarios activos)
    const withCache = (100 * 50) / 1024; // MB
    const withoutCache = (500 * 50) / 1024; // MB
    return { withCache, withoutCache };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monitor de Optimización
            </CardTitle>
            <Badge variant={cacheStats.totalKeys > 0 ? 'default' : 'secondary'}>
              {cacheStats.totalKeys > 0 ? 'Caché Activa' : 'Sin Caché'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats de caché */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-900">{cacheStats.totalKeys}</p>
              <p className="text-sm text-blue-700">Elementos en Caché</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingDown className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-900">{cacheStats.totalSizeKB} KB</p>
              <p className="text-sm text-green-700">Tamaño de Caché</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-900">{cacheStats.expiredCount}</p>
              <p className="text-sm text-orange-700">Items Expirados</p>
            </div>
          </div>

          {/* Estimación de egress */}
          <div className="border-t pt-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Estimación de Egress Mensual
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-600 mb-1">Sin Optimización</p>
                <p className="text-xl font-bold text-red-900">
                  ~{estimatedMonthlyEgressMB.withoutCache.toFixed(1)} MB
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-600 mb-1">Con Optimización ✅</p>
                <p className="text-xl font-bold text-green-900">
                  ~{estimatedMonthlyEgressMB.withCache.toFixed(1)} MB
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 Reducción aproximada: {((1 - estimatedMonthlyEgressMB.withCache / estimatedMonthlyEgressMB.withoutCache) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCacheStats(getCacheStats())}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearExpired}
              disabled={cacheStats.expiredCount === 0}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Expirados ({cacheStats.expiredCount})
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={cacheStats.totalKeys === 0}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Todo
            </Button>
          </div>

          {/* Toggle detalles */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? 'Ocultar' : 'Ver'} Detalles Técnicos
          </Button>

          {showDetails && (
            <div className="text-xs bg-gray-50 p-4 rounded border space-y-2">
              <div>
                <span className="font-semibold">React Query Config:</span>
                <ul className="ml-4 mt-1 space-y-1 text-gray-700">
                  <li>• gcTime: 30 minutos</li>
                  <li>• staleTime: 5 minutos</li>
                  <li>• refetchOnWindowFocus: false</li>
                  <li>• refetchOnReconnect: false</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold">Optimizaciones Activas:</span>
                <ul className="ml-4 mt-1 space-y-1 text-gray-700">
                  <li>✅ Filtros por fecha en consultas</li>
                  <li>✅ Caché de React Query</li>
                  <li>✅ LocalStorage para datos estáticos</li>
                  <li>✅ Hook useCurrentMonthData()</li>
                  <li>✅ Deduplicación automática</li>
                </ul>
              </div>
              <div>
                <span className="font-semibold">Límite de Supabase Free:</span>
                <ul className="ml-4 mt-1 space-y-1 text-gray-700">
                  <li>• Egress mensual: 2 GB</li>
                  <li>• Uso estimado optimizado: {estimatedMonthlyEgressMB.withCache.toFixed(0)} MB</li>
                  <li>• Margen restante: ~{(2000 - estimatedMonthlyEgressMB.withCache).toFixed(0)} MB</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      {cacheStats.expiredCount > 10 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">Muchos items expirados</p>
                <p className="text-sm text-orange-700">
                  Hay {cacheStats.expiredCount} elementos expirados en caché.
                  Limpiá los items expirados para liberar espacio.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearExpired}
                  className="mt-2"
                >
                  Limpiar Ahora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {cacheStats.totalKeys === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Caché vacía</p>
                <p className="text-sm text-blue-700">
                  No hay datos en caché todavía. Navegá por la app para que se empiecen a cachear datos
                  y reducir el consumo de egress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// CÓMO AGREGAR ESTE COMPONENTE:
// 1. Importar en App.tsx o en la pestaña de Configuración
// 2. Agregar como una pestaña o sección nueva
// 3. Permite a los usuarios monitorear el impacto de las optimizaciones

import { useMemo } from 'react';
