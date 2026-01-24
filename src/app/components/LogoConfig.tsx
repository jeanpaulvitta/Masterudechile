import { useState, useEffect } from 'react';
import { Waves, Settings, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const LOGO_URL_KEY = 'natacion_master_logo_url';

interface LogoConfigProps {
  className?: string;
}

export function LogoConfig({ className = '' }: LogoConfigProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoConfigOpen, setLogoConfigOpen] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);

  // Cargar logo configurado al montar
  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_URL_KEY);
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const handleSaveLogo = () => {
    if (tempLogoUrl.trim()) {
      localStorage.setItem(LOGO_URL_KEY, tempLogoUrl.trim());
      setLogoUrl(tempLogoUrl.trim());
      setLogoError(false);
      alert('Logo actualizado correctamente');
    } else {
      // Eliminar logo personalizado
      localStorage.removeItem(LOGO_URL_KEY);
      setLogoUrl(null);
      alert('Logo restaurado al predeterminado');
    }
    setLogoConfigOpen(false);
    setTempLogoUrl('');
  };

  const handleOpenLogoConfig = () => {
    setTempLogoUrl(logoUrl || '');
    setLogoConfigOpen(true);
  };

  return (
    <>
      {/* Logo con botón de configuración */}
      <div className={`relative group ${className}`}>
        <div className="bg-white rounded-lg p-1.5 sm:p-2 shadow-md">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt="Logo Master UCH"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" className="w-12 h-12 sm:w-16 sm:h-16">
              <rect width="150" height="150" fill="#003366"/>
              <text x="75" y="70" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold">MASTER</text>
              <text x="75" y="95" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="16">UCH</text>
            </svg>
          )}
        </div>
        
        {/* Botón de configuración (visible al hacer hover) */}
        <button
          onClick={handleOpenLogoConfig}
          className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
          title="Configurar logo"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>

      {/* Diálogo de configuración de logo */}
      <Dialog open={logoConfigOpen} onOpenChange={setLogoConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Configurar Logo
            </DialogTitle>
            <DialogDescription>
              Personaliza el logo del sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">URL del Logo</Label>
              <Input
                id="logo-url"
                type="url"
                placeholder="https://ejemplo.com/logo.png"
                value={tempLogoUrl}
                onChange={(e) => setTempLogoUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Ingresa la URL de una imagen (PNG, JPG, SVG). Deja vacío para usar el logo predeterminado.
              </p>
            </div>

            {/* Vista previa */}
            {tempLogoUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-semibold mb-2">Vista previa:</p>
                <div className="flex justify-center">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <img
                      src={tempLogoUrl}
                      alt="Vista previa del logo"
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Ejemplos de URLs */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">💡 Ejemplos de servicios gratuitos:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Imgur.com - Sube tu imagen y copia el enlace directo</li>
                <li>• ImgBB.com - Hosting gratuito de imágenes</li>
                <li>• GitHub - Sube a un repositorio y usa el enlace raw</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoConfigOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveLogo}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}