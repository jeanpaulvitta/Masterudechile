import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerRegistered: boolean;
  serviceWorkerActive: boolean;
  manifestValid: boolean;
  httpsEnabled: boolean;
  installable: boolean;
}

/**
 * Componente de debug para verificar el estado de la PWA.
 * Solo visible para administradores o en modo desarrollo.
 */
export function PWADebug() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    serviceWorkerRegistered: false,
    serviceWorkerActive: false,
    manifestValid: false,
    httpsEnabled: false,
    installable: false,
  });
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    checkPWAStatus();

    // Actualizar estado de conexión
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPWAStatus = async () => {
    // Verificar si está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    // Verificar HTTPS
    const httpsEnabled = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost';

    // Verificar Service Worker
    let serviceWorkerRegistered = false;
    let serviceWorkerActive = false;

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        serviceWorkerRegistered = !!registration;
        serviceWorkerActive = !!registration?.active;
      } catch (err) {
        console.error('Error verificando Service Worker:', err);
      }
    }

    // Verificar manifest
    let manifestValid = false;
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        manifestValid = !!(manifest.name && manifest.icons && manifest.icons.length > 0);
      }
    } catch (err) {
      console.error('Error verificando manifest:', err);
    }

    // Verificar si es instalable
    const installable = httpsEnabled && manifestValid && serviceWorkerRegistered;

    setStatus({
      isInstalled,
      isOnline: navigator.onLine,
      serviceWorkerRegistered,
      serviceWorkerActive,
      manifestValid,
      httpsEnabled,
      installable,
    });
  };

  const handleRefresh = () => {
    checkPWAStatus();
  };

  const handleUnregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('✅ Service Worker desregistrado');
        alert('Service Worker desregistrado. Recarga la página.');
      }
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Caché limpiado');
      alert('Caché limpiado. Recarga la página.');
    }
  };

  const StatusIcon = ({ condition }: { condition: boolean }) => {
    return condition ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  // Mostrar solo en desarrollo o presionando Ctrl+Shift+D
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(true)}
          className="opacity-20 hover:opacity-100 transition-opacity"
        >
          <AlertCircle className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">PWA Debug Panel</CardTitle>
              <CardDescription className="text-xs">
                Estado de la Progressive Web App
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Estado General */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado General</span>
            <Badge variant={status.installable ? "default" : "destructive"}>
              {status.installable ? "Listo" : "Incompleto"}
            </Badge>
          </div>

          {/* Detalles */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusIcon condition={status.isInstalled} />
                Instalada
              </span>
              <span className="text-xs text-muted-foreground">
                {status.isInstalled ? "Sí" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusIcon condition={status.isOnline} />
                Conexión
              </span>
              <span className="text-xs text-muted-foreground">
                {status.isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusIcon condition={status.httpsEnabled} />
                HTTPS
              </span>
              <span className="text-xs text-muted-foreground">
                {status.httpsEnabled ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusIcon condition={status.manifestValid} />
                Manifest
              </span>
              <span className="text-xs text-muted-foreground">
                {status.manifestValid ? "Válido" : "Inválido"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusIcon condition={status.serviceWorkerRegistered} />
                Service Worker
              </span>
              <span className="text-xs text-muted-foreground">
                {status.serviceWorkerRegistered ? "Registrado" : "No registrado"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusIcon condition={status.serviceWorkerActive} />
                SW Activo
              </span>
              <span className="text-xs text-muted-foreground">
                {status.serviceWorkerActive ? "Sí" : "No"}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              className="flex-1"
            >
              🗑️ Cache
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleUnregisterSW}
            className="w-full"
          >
            Desregistrar SW
          </Button>

          {/* Info */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>💡 Atajo: Ctrl+Shift+D para mostrar/ocultar</p>
            {!status.installable && (
              <p className="text-red-500 mt-1">
                ⚠️ Verifica los requisitos para instalar la PWA
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
