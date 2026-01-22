import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Chrome, Apple } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar si ya fue descartado en esta sesión
    const isDismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar el prompt después de 30 segundos
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando se instala
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('✅ PWA instalada exitosamente');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostrar el prompt nativo
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó la instalación');
    } else {
      console.log('❌ Usuario rechazó la instalación');
    }

    // Limpiar el prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // No mostrar si está instalada, descartada, o no debe mostrarse
  if (isInstalled || dismissed || !showPrompt) {
    return null;
  }

  // Prompt para iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Card className="shadow-lg border-blue-500 border-2">
          <CardHeader className="relative pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Apple className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-lg">Instalar App</CardTitle>
            </div>
            <CardDescription>
              Instala Master UCH en tu iPhone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription className="text-sm ml-2">
                Para instalar esta app:
              </AlertDescription>
            </Alert>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Toca el botón <strong>Compartir</strong> <span className="inline-block">📤</span></li>
              <li>Selecciona <strong>"Agregar a pantalla de inicio"</strong></li>
              <li>Toca <strong>"Agregar"</strong></li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Tendrás acceso rápido desde tu pantalla de inicio y podrás usar la app offline.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prompt para Android/Desktop
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="shadow-lg border-blue-500 border-2 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Chrome className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-lg">Instalar App</CardTitle>
          </div>
          <CardDescription>
            Instala Master UCH como aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Ventajas de instalar:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✅ Acceso rápido desde tu pantalla de inicio</li>
                <li>✅ Funciona sin conexión (modo offline)</li>
                <li>✅ Experiencia de app nativa</li>
                <li>✅ Notificaciones de entrenamientos</li>
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={handleInstallClick}
            className="w-full bg-blue-500 hover:bg-blue-600"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Instalar Ahora
          </Button>
          
          <Button 
            onClick={handleDismiss}
            variant="ghost"
            className="w-full text-xs"
            size="sm"
          >
            Recordarme más tarde
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
