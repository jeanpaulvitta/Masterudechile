import { useState, useEffect } from 'react';
import { Waves, Settings, ImageIcon, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

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
      toast.success('Logo actualizado correctamente');
    } else {
      // Eliminar logo personalizado
      localStorage.removeItem(LOGO_URL_KEY);
      setLogoUrl(null);
      toast.success('Logo restaurado al predeterminado');
    }
    setLogoConfigOpen(false);
    setTempLogoUrl('');
  };

  const handleOpenLogoConfig = () => {
    setTempLogoUrl(logoUrl || '');
    setLogoConfigOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida (PNG, JPG, SVG)');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Por favor selecciona una imagen menor a 5MB');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setTempLogoUrl(base64String);
      toast.success('Imagen cargada correctamente');
    };
    reader.onerror = () => {
      toast.error('Error al cargar la imagen');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setTempLogoUrl('');
    toast.success('Imagen eliminada');
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Configurar Logo
            </DialogTitle>
            <DialogDescription>
              Sube una imagen personalizada para el logo del sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Vista previa grande */}
            {tempLogoUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white relative">
                <button
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-gray-700">Vista previa:</p>
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <img
                      src={tempLogoUrl}
                      alt="Vista previa del logo"
                      className="w-24 h-24 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botón de subir imagen - Estilo grande y llamativo */}
            {!tempLogoUrl && (
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-white hover:border-blue-500 transition-colors">
                <label htmlFor="logo-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        Haz clic para subir una imagen
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG o SVG (máx 5MB)
                      </p>
                    </div>
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Botón para restaurar logo predeterminado */}
            {tempLogoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Restaurar Logo Predeterminado
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLogoConfigOpen(false);
                setTempLogoUrl(logoUrl || '');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveLogo}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Guardar Logo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}