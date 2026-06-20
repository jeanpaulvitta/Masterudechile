import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Waves, Lock, Mail, User, Shield, AlertCircle, ImageIcon, Settings, Upload, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import * as api from '../services/api';

const LOGO_URL_KEY = 'natacion_master_logo_url';

export function LoginPage() {
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestRole, setRequestRole] = useState<'swimmer' | 'coach'>('swimmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setSuccessMessage('Inicio de sesión exitoso');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      console.log('📝 Enviando solicitud de acceso...');
      console.log('  - Nombre:', requestName);
      console.log('  - Email:', requestEmail);
      console.log('  - Rol:', requestRole);
      
      // Validaciones
      if (!requestName.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      if (!requestEmail.trim()) {
        throw new Error('El email es obligatorio');
      }
      if (!requestEmail.includes('@')) {
        throw new Error('El email debe ser válido');
      }
      
      // Enviar solicitud a Supabase mediante la API
      const newRequest = await api.addPasswordRequest({
        name: requestName.trim(),
        email: requestEmail.trim(),
        role: requestRole,
        requestDate: new Date().toISOString(),
        status: 'pending'
      });
      
      console.log('✅ Solicitud creada:', newRequest);
      toast.success('¡Solicitud enviada exitosamente!');
      setSuccessMessage('Tu solicitud ha sido enviada. El administrador la revisará pronto y te enviará tus credenciales de acceso.');
      
      // Limpiar formulario
      setRequestName('');
      setRequestEmail('');
      setRequestRole('swimmer');
    } catch (err) {
      console.error('❌ Error al enviar solicitud:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error al enviar solicitud';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={handleOpenLogoConfig}
            className="absolute top-0 right-0 p-2 text-white/40 hover:text-white/80 transition-colors"
            title="Configurar logo"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-5">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt="Logo Master UCH"
                  className="w-16 h-16 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" className="w-16 h-16">
                  <rect width="150" height="150" rx="12" fill="#003087"/>
                  <text x="75" y="72" textAnchor="middle" dominantBaseline="middle" fill="#E63946" fontFamily="Arial Black, Impact, sans-serif" fontSize="72" fontWeight="900">U</text>
                  <text x="75" y="108" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" letterSpacing="2">NATACIÓN</text>
                  <text x="75" y="126" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" letterSpacing="3">MASTER</text>
                </svg>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Natación Master UCH
          </h1>
          <p className="text-white/60 text-sm">
            Universidad de Chile
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Waves className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-xs">Temporada 2026</span>
          </div>
        </div>

        {/* Login/Signup Card */}
        <Card className="shadow-2xl bg-white border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-[#003366]">
              <Lock className="w-4 h-4" />
              Acceso al Sistema
            </CardTitle>
            <CardDescription>
              Inicia sesión o solicita acceso si eres nuevo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Solicitar Acceso</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                {/* Mensaje informativo para primera vez */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@correo.cl"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                      {successMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              {/* Request Access Tab */}
              <TabsContent value="signup">
                <form onSubmit={handlePasswordRequest} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Solicitud de Acceso:</strong> Completa este formulario para solicitar acceso al sistema. 
                        El administrador revisará tu solicitud y te enviará tus credenciales de acceso.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="request-name"
                        type="text"
                        placeholder="Juan Pérez"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="request-email"
                        type="email"
                        placeholder="tu@correo.cl"
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-role">Rol Solicitado</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <select
                        id="request-role"
                        value={requestRole}
                        onChange={(e) => setRequestRole(e.target.value as 'swimmer' | 'coach')}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="swimmer">Nadador</option>
                        <option value="coach">Entrenador</option>
                      </select>
                    </div>
                  </div>

                  {/* Nota informativa */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <strong>Proceso de aprobación:</strong> Una vez enviada tu solicitud, el administrador 
                        la revisará y te enviará tus credenciales de acceso por correo electrónico.
                        {requestRole === 'swimmer' && (
                          <p className="mt-2">
                            ℹ️ También se creará automáticamente tu ficha de nadador con tus datos básicos.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                      {successMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Enviando solicitud...' : 'Solicitar Acceso'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-white/30 text-xs">
          <p>© 2026 Universidad de Chile</p>
        </div>
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
              Sube una imagen personalizada para el logo de inicio de sesión
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
    </div>
  );
}