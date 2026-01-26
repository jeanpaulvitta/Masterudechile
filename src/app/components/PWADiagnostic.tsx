import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function PWADiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    https: false,
    serviceWorker: false,
    manifest: false,
    installable: false,
    standalone: false,
    platform: '',
    browser: ''
  });

  const [swStatus, setSWStatus] = useState('checking');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    runDiagnostics();

    // Detectar evento de instalación
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setDiagnostics(prev => ({ ...prev, installable: true }));
    });

    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
      setDiagnostics(prev => ({ ...prev, standalone: true }));
    });
  }, []);

  const runDiagnostics = async () => {
    // 1. Verificar HTTPS
    const isHttps = window.location.protocol === 'https:';

    // 2. Verificar Service Worker
    let hasSW = false;
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        hasSW = !!registration;
        setSWStatus(registration ? 'registered' : 'not-registered');
      } catch (err) {
        setSWStatus('error');
      }
    }

    // 3. Verificar Manifest
    let hasManifest = false;
    try {
      const response = await fetch('/manifest.json');
      hasManifest = response.ok;
    } catch {
      hasManifest = false;
    }

    // 4. Verificar si está en modo standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // 5. Detectar plataforma y navegador
    const ua = navigator.userAgent;
    let platform = 'Unknown';
    let browser = 'Unknown';

    if (/iPhone|iPad|iPod/.test(ua)) {
      platform = 'iOS';
    } else if (/Android/.test(ua)) {
      platform = 'Android';
    } else if (/Windows/.test(ua)) {
      platform = 'Windows';
    } else if (/Mac/.test(ua)) {
      platform = 'macOS';
    }

    if (/Chrome/.test(ua) && !/Edge/.test(ua)) {
      browser = 'Chrome';
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      browser = 'Safari';
    } else if (/Firefox/.test(ua)) {
      browser = 'Firefox';
    } else if (/Edge/.test(ua)) {
      browser = 'Edge';
    }

    setDiagnostics({
      https: isHttps,
      serviceWorker: hasSW,
      manifest: hasManifest,
      installable: false, // Se actualiza con el evento
      standalone: isStandalone,
      platform,
      browser
    });
  };

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      setInstallPrompt(null);
    }
  };

  const DiagnosticItem = ({ label, value, status }: { label: string; value: any; status: 'success' | 'error' | 'warning' }) => {
    const Icon = status === 'success' ? CheckCircle : status === 'error' ? XCircle : AlertCircle;
    const color = status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-yellow-600';

    return (
      <div className="flex items-center justify-between py-2 border-b last:border-0">
        <span className="font-medium text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{String(value)}</span>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔍 Diagnóstico PWA</span>
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Requisitos técnicos */}
          <div>
            <h3 className="font-semibold mb-3">Requisitos Técnicos</h3>
            <DiagnosticItem
              label="HTTPS"
              value={diagnostics.https ? 'Sí' : 'No'}
              status={diagnostics.https ? 'success' : 'error'}
            />
            <DiagnosticItem
              label="Service Worker"
              value={diagnostics.serviceWorker ? 'Registrado' : 'No registrado'}
              status={diagnostics.serviceWorker ? 'success' : 'error'}
            />
            <DiagnosticItem
              label="Manifest"
              value={diagnostics.manifest ? 'Válido' : 'No encontrado'}
              status={diagnostics.manifest ? 'success' : 'error'}
            />
          </div>

          {/* Estado de instalación */}
          <div>
            <h3 className="font-semibold mb-3">Estado de Instalación</h3>
            <DiagnosticItem
              label="Instalable"
              value={diagnostics.installable ? 'Sí' : 'No'}
              status={diagnostics.installable ? 'success' : 'warning'}
            />
            <DiagnosticItem
              label="Modo Standalone"
              value={diagnostics.standalone ? 'Sí (Instalada)' : 'No'}
              status={diagnostics.standalone ? 'success' : 'warning'}
            />
          </div>

          {/* Información del dispositivo */}
          <div>
            <h3 className="font-semibold mb-3">Información del Dispositivo</h3>
            <DiagnosticItem
              label="Plataforma"
              value={diagnostics.platform}
              status="success"
            />
            <DiagnosticItem
              label="Navegador"
              value={diagnostics.browser}
              status="success"
            />
          </div>

          {/* Botón de instalación */}
          {diagnostics.installable && installPrompt && (
            <div className="pt-4">
              <Button
                onClick={handleInstall}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📱 Instalar Aplicación
              </Button>
            </div>
          )}

          {/* Instrucciones específicas */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">📝 Instrucciones para instalar:</h3>
            {diagnostics.platform === 'iOS' && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-2">
                <p className="font-medium">Para iOS (Safari):</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Abre esta página en <strong>Safari</strong></li>
                  <li>Toca el botón <strong>Compartir</strong> (↗️)</li>
                  <li>Selecciona <strong>"Añadir a pantalla de inicio"</strong></li>
                  <li>Toca <strong>"Añadir"</strong></li>
                </ol>
              </div>
            )}
            {diagnostics.platform === 'Android' && (
              <div className="bg-green-50 p-3 rounded-lg text-sm space-y-2">
                <p className="font-medium">Para Android (Chrome):</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Abre esta página en <strong>Chrome</strong></li>
                  <li>Toca el menú <strong>⋮</strong> (arriba a la derecha)</li>
                  <li>Selecciona <strong>"Instalar aplicación"</strong></li>
                  <li>Confirma la instalación</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  O espera el banner automático de instalación
                </p>
              </div>
            )}
          </div>

          {/* Estado del Service Worker */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Service Worker Status:</h3>
            <Badge
              variant={swStatus === 'registered' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {swStatus === 'registered' ? '✅ Activo' : 
               swStatus === 'not-registered' ? '❌ No registrado' : 
               '⚠️ Error'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
