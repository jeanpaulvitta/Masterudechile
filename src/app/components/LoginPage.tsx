import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Waves, Lock, Mail, User, Shield, AlertCircle, Bug, ImageIcon, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { debugListAllUsers } from '../services/auth';
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

  const handleDebugUsers = () => {
    console.log('🐛 DEBUG - Verificando usuarios...');
    debugListAllUsers();
    toast.success('Verifica la consola del navegador (F12)');
  };

  const handleDiagnostics = async () => {
    try {
      setLoading(true);
      console.clear();
      console.log('🔍 EJECUTANDO DIAGNÓSTICO COMPLETO...\n');
      
      // Diagnóstico de usuarios
      const usersRes = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/users', {
        headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'}
      });
      const users = await usersRes.json();
      
      console.log('👤 USUARIOS REGISTRADOS:', users.users?.length || 0);
      users.users?.forEach((u: any) => {
        console.log(`\n📧 ${u.email}`);
        console.log(`   Nombre: ${u.name}`);
        console.log(`   Rol: ${u.role}`);
        console.log(`   🔑 Password: ${u.password}`);
      });
      
      // Diagnóstico de solicitudes
      const requestsRes = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/password-requests', {
        headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'}
      });
      const requests = await requestsRes.json();
      
      console.log('\n\n📋 SOLICITUDES:', requests.requests?.length || 0);
      requests.requests?.forEach((r: any) => {
        console.log(`\n${r.status === 'approved' ? '✅' : r.status === 'pending' ? '⏳' : '❌'} ${r.name} (${r.email})`);
        console.log(`   Estado: ${r.status}`);
        if (r.generatedPassword) {
          console.log(`   🔑 Password: ${r.generatedPassword}`);
        }
      });
      
      console.log('\n\n' + '='.repeat(60));
      console.log('✅ DIAGNÓSTICO COMPLETADO');
      console.log('='.repeat(60));
      
      toast.success('Diagnóstico completado - Revisa la consola (F12)');
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      toast.error('Error en diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = () => {
    setLoginEmail('admin@uch.cl');
    setLoginPassword('admin123');
    toast.success('Credenciales de admin cargadas');
  };

  const handleResetAdmin = async () => {
    try {
      setLoading(true);
      console.log('🔧 Reseteando admin en Supabase Auth...');
      
      const response = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/auth/reset-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
        }
      });
      
      const data = await response.json();
      console.log('✅ Respuesta reset admin:', data);
      
      if (response.ok) {
        toast.success('✅ Admin reseteado - Email: admin@uch.cl | Password: admin123');
        setLoginEmail('admin@uch.cl');
        setLoginPassword('admin123');
        setError(''); // Limpiar error
        
        // Mostrar las credenciales en la consola
        console.log('🔑 CREDENCIALES DE ADMIN:');
        console.log('  Email: admin@uch.cl');
        console.log('  Password: admin123');
        console.log('  Ahora puedes hacer clic en "Iniciar Sesión"');
      } else {
        console.error('Error response:', data);
        toast.error(data.error || 'Error al resetear admin');
      }
    } catch (error) {
      console.error('❌ Error reseteando admin:', error);
      toast.error('Error al resetear admin: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleTestSupabaseAuth = async () => {
    try {
      setLoading(true);
      console.clear();
      console.log('🔍 VERIFICANDO SUPABASE AUTH...\n');
      
      // Test 1: Verificar endpoint de salud
      console.log('1️⃣ Verificando servidor...');
      const healthRes = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/health', {
        headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'}
      });
      const health = await healthRes.json();
      console.log('✅ Servidor funcionando:', health);
      
      // Test 2: Listar usuarios de Supabase Auth
      console.log('\n2️⃣ Listando usuarios en Supabase Auth...');
      const usersRes = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/users', {
        headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'}
      });
      const users = await usersRes.json();
      console.log('Total usuarios:', users.users?.length || 0);
      
      const adminUser = users.users?.find((u: any) => u.email === 'admin@uch.cl');
      if (adminUser) {
        console.log('✅ Usuario admin encontrado:');
        console.log('   ID:', adminUser.id);
        console.log('   Email:', adminUser.email);
        console.log('   Rol:', adminUser.role);
        console.log('   Metadata:', adminUser.user_metadata);
      } else {
        console.log('❌ Usuario admin NO encontrado en Supabase Auth');
        console.log('   Necesitas hacer clic en "Resetear Admin en Supabase"');
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ VERIFICACIÓN COMPLETADA');
      console.log('='.repeat(60));
      
      if (!adminUser) {
        toast.error('Admin no encontrado - Haz clic en "Resetear Admin"');
      } else {
        toast.success('Admin encontrado - Puedes intentar login');
      }
    } catch (error) {
      console.error('❌ Error en verificación:', error);
      toast.error('Error en verificación: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Botón de configuración de logo (esquina superior derecha) */}
          <button
            onClick={handleOpenLogoConfig}
            className="absolute top-0 right-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Configurar logo"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-6 shadow-2xl">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Waves className="w-16 h-16 text-blue-600" />
              )}
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
                      <div className="mt-3 pt-3 border-t border-red-300 space-y-2">
                        <p className="text-xs font-semibold mb-2">¿Problemas para iniciar sesión?</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetAdmin}
                            className="text-xs h-7 flex-1 bg-blue-600 text-white hover:bg-blue-700"
                            disabled={loading}
                          >
                            🔧 Resetear Admin en Supabase
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              localStorage.clear();
                              window.location.reload();
                            }}
                            className="text-xs h-7 flex-1"
                          >
                            Limpiar caché
                          </Button>
                        </div>
                        <p className="text-xs text-red-500 mt-2">
                          👆 Haz clic en "Resetear Admin en Supabase" para crear/resetear el usuario admin@uch.cl con contraseña admin123
                        </p>
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

      {/* Diálogo de configuración de logo */}
      <Dialog open={logoConfigOpen} onOpenChange={setLogoConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Configurar Logo
            </DialogTitle>
            <DialogDescription>
              Personaliza el logo de la página de inicio de sesión
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
                  <div className="bg-white rounded-full p-4 shadow-md">
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
    </div>
  );
}