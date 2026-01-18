import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Waves, Lock, Mail, User, Shield, AlertCircle, Bug } from 'lucide-react';
import logo from "figma:asset/f5fa508b6dd6458954cc36bcd7a8a3baa6d8e605.png";
import { createPasswordRequest } from './PasswordRequestsManager';
import { toast } from 'sonner';
import { debugListAllUsers } from '../services/auth';

export function LoginPage() {
  const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestRole, setRequestRole] = useState<'swimmer' | 'coach'>('swimmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDebugUsers = () => {
    console.log('🐛 DEBUG - Verificando usuarios...');
    debugListAllUsers();
    toast.success('Verifica la consola del navegador (F12)');
  };

  const handleQuickAdminLogin = () => {
    setLoginEmail('admin@uch.cl');
    setLoginPassword('admin123');
    toast.success('Credenciales de admin cargadas');
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
    setLoading(true);

    try {
      createPasswordRequest(requestName, requestEmail, requestRole);
      toast.success('Solicitud enviada exitosamente');
      setSuccessMessage('Tu solicitud ha sido enviada. El administrador la revisará pronto.');
      // Limpiar formulario
      setRequestName('');
      setRequestEmail('');
      setRequestRole('swimmer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud');
      toast.error(err instanceof Error ? err.message : 'Error al enviar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-2xl">
              <img
                src={logo}
                alt="Natación Master UCH"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Natación Master UCH
          </h1>
          <p className="text-blue-100 text-lg">
            Universidad de Chile - Sistema de Gestión
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Waves className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200">Temporada 2026</span>
          </div>
        </div>

        {/* Login/Signup Card - Full Width */}
        <Card className="shadow-2xl max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
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
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                      <div className="mt-2 pt-2 border-t border-red-300">
                        <p className="text-xs font-semibold mb-1">¿Problemas para iniciar sesión?</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                          }}
                          className="text-xs h-7"
                        >
                          Limpiar caché y recargar
                        </Button>
                      </div>
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
        <div className="text-center mt-8 text-blue-100 text-sm">
          <p>© 2026 Universidad de Chile - Natación Master</p>
          <p className="mt-1">Sistema de gestión de entrenamientos y nadadores</p>
        </div>
      </div>
    </div>
  );
}