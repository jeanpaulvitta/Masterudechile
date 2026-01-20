import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { UserPlus, CheckCircle, XCircle, Clock, Copy, Shield, Mail, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { checkEmailExists } from '../services/auth';
import * as api from '../services/api';
import { copyToClipboard } from '../utils/clipboard';

// Usar el tipo de la API
type PasswordRequest = api.PasswordRequest;

const REQUESTS_KEY = 'natacion_master_password_requests';

function getPasswordRequests(): PasswordRequest[] {
  const stored = localStorage.getItem(REQUESTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function savePasswordRequests(requests: PasswordRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function PasswordRequestsManager() {
  const [requests, setRequests] = useState<PasswordRequest[]>([]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PasswordRequest | null>(null);
  const [approvedCredentials, setApprovedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Obtener el contexto de autenticación
  const auth = useAuth();
  const { user, createUserAccount } = auth;

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Cargar solicitudes desde Supabase
      const requests = await api.fetchPasswordRequests();
      setRequests(requests);
      console.log('✅ Solicitudes de contraseña cargadas desde Supabase:', requests);
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error);
      // Fallback a localStorage si falla
      const localRequests = getPasswordRequests();
      setRequests(localRequests);
    }
  };

  const handleApproveRequest = async (request: PasswordRequest) => {
    setLoading(true);
    try {
      console.log('🔐 Aprobando solicitud para:', request.email);
      
      // Verificar si el usuario ya existe en Supabase
      const emailExists = await checkEmailExists(request.email);
      
      if (emailExists) {
        toast.error('Este usuario ya tiene una cuenta. Usa "Resetear Contraseña" en Usuarios Registrados.');
        await api.updatePasswordRequest(request.id, {
          status: 'approved',
          generatedPassword: 'Usuario ya existe'
        });
        await loadRequests();
        return;
      }

      // Generar ID y contraseña para el nuevo usuario
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const userId = 'user_' + timestamp + '_' + randomStr;
      const password = userId; // La contraseña es el ID
      
      console.log('🆕 Creando usuario:', { email: request.email, userId, passwordLength: password.length });
      
      // Crear el usuario directamente en Supabase mediante la API
      const newUser = {
        id: userId,
        email: request.email,
        name: request.name,
        password: password,
        role: request.role
      };
      
      // Llamar a la API para crear el usuario
      const response = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
        },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario');
      }
      
      const result = await response.json();
      const createdUser = result.user;
      console.log('✅ Usuario creado en Supabase:', createdUser.id);
      
      // Si es nadador, crear ficha automáticamente
      if (request.role === 'swimmer') {
        try {
          const today = new Date();
          const defaultBirthYear = today.getFullYear() - 25;
          const monthNum = today.getMonth() + 1;
          const dayNum = today.getDate();
          const monthStr = monthNum < 10 ? '0' + monthNum : String(monthNum);
          const dayStr = dayNum < 10 ? '0' + dayNum : String(dayNum);
          const defaultDateOfBirth = String(defaultBirthYear) + '-' + monthStr + '-' + dayStr;
          
          const swimmerData = {
            name: request.name,
            email: request.email,
            rut: '00.000.000-0',
            gender: 'Masculino',
            dateOfBirth: defaultDateOfBirth,
            schedule: '7am',
            joinDate: new Date().toISOString().split('T')[0],
            personalBests: [],
            personalBestsHistory: [],
            goals: []
          };
          
          await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/swimmers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
            },
            body: JSON.stringify(swimmerData)
          });
          
          console.log('✅ Ficha de nadador creada');
        } catch (swimmerError) {
          console.error('⚠️ Error al crear ficha:', swimmerError);
        }
      }
      
      // Actualizar el estado de la solicitud en Supabase
      await api.updatePasswordRequest(request.id, {
        status: 'approved',
        generatedPassword: password
      });
      
      // Recargar solicitudes
      await loadRequests();
      
      // Mostrar credenciales generadas
      setApprovedCredentials({ email: request.email, password: password });
      setShowApproveDialog(true);
      
      console.log('✅ Solicitud aprobada completamente');
      toast.success('¡Cuenta creada exitosamente!');
      
    } catch (error) {
      console.error('❌ Error al aprobar solicitud:', error);
      toast.error(error instanceof Error ? error.message : 'Error al aprobar solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Actualizar el estado en Supabase
      await api.updatePasswordRequest(requestId, { status: 'rejected' });
      
      // Recargar solicitudes
      await loadRequests();
      
      toast.success('Solicitud rechazada');
    } catch (error) {
      console.error('❌ Error al rechazar solicitud:', error);
      toast.error('Error al rechazar solicitud');
    }
  };

  const handleCopyCredentials = () => {
    if (approvedCredentials) {
      const message = `🏊‍♂️ NATACIÓN MASTER UCH - Credenciales de Acceso

¡Hola! Tu solicitud de acceso ha sido aprobada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${approvedCredentials.email}
🔑 Contraseña: ${approvedCredentials.password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 INSTRUCCIONES:
1. Ingresa a la aplicación con estas credenciales
2. Cambia tu contraseña desde tu perfil (recomendado)
3. La contraseña es temporal y única

⚠️ IMPORTANTE: 
• Guarda estas credenciales en un lugar seguro
• No compartas tu contraseña con nadie
• Si olvidas tu contraseña, contacta al administrador

¡Bienvenido al equipo de Natación Master UCH! 🏊‍♂️💪`;
      
      copyToClipboard(message).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('✅ Mensaje completo copiado al portapapeles');
      }).catch(error => {
        toast.error(error instanceof Error ? error.message : 'Error al copiar');
      });
    }
  };

  const handleCopyEmail = () => {
    if (approvedCredentials) {
      copyToClipboard(approvedCredentials.email).then(() => {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
        toast.success('Email copiado al portapapeles');
      }).catch(error => {
        toast.error(error instanceof Error ? error.message : 'Error al copiar');
      });
    }
  };

  const handleCopyPassword = () => {
    if (approvedCredentials) {
      copyToClipboard(approvedCredentials.password).then(() => {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
        toast.success('Contraseña copiada al portapapeles');
      }).catch(error => {
        toast.error(error instanceof Error ? error.message : 'Error al copiar');
      });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            Solo los administradores pueden acceder a esta sección
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Descripción */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Sistema de Solicitudes de Acceso</p>
            <p>Las solicitudes aprobadas se mueven automáticamente a "Usuarios Registrados" donde puedes copiar las credenciales en cualquier momento.</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-700">{pendingRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Rechazadas</p>
                <p className="text-3xl font-bold text-red-700">{rejectedRequests.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitudes Pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Solicitudes Pendientes
          </CardTitle>
          <CardDescription>
            Aprueba o rechaza solicitudes de acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        <Badge variant={request.role === 'coach' ? 'default' : 'secondary'}>
                          {request.role === 'coach' ? 'Entrenador' : 'Nadador'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={loading}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solicitudes Aprobadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Solicitudes Aprobadas
          </CardTitle>
          <CardDescription>
            ⚠️ IMPORTANTE: No uses las contraseñas de esta tabla para login. Ve a "Usuarios Registrados" para obtener las credenciales reales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-900 mb-2">⛔ NO USAR ESTAS CONTRASEÑAS</p>
                <p className="text-sm text-yellow-800 mb-3">
                  Las contraseñas mostradas aquí pueden estar desactualizadas. Para obtener las credenciales correctas:
                </p>
                <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                  <li>Ve a la pestaña <strong>"Usuarios Registrados"</strong></li>
                  <li>Busca el usuario</li>
                  <li>Haz clic en el botón <strong>🔑 Resetear</strong></li>
                  <li>Copia las credenciales del diálogo que aparece</li>
                </ol>
              </div>
            </div>
          </div>
          {approvedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay solicitudes aprobadas todavía
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Contraseña Generada</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        <Badge variant={request.role === 'coach' ? 'default' : 'secondary'}>
                          {request.role === 'coach' ? 'Entrenador' : 'Nadador'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {request.generatedPassword?.substring(0, 20)}...
                        </code>
                      </TableCell>
                      <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nl = '\\n';
                            const text = '📧 Credenciales de Acceso - Equipo Natación Master UCH' + nl + nl +
                              '👤 Nombre: ' + request.name + nl +
                              '📨 Email: ' + request.email + nl +
                              '🔑 Contraseña: ' + request.generatedPassword + nl +
                              '👔 Rol: ' + (request.role === 'coach' ? 'Entrenador' : 'Nadador') + nl + nl +
                              '🔗 Acceso al Sistema:' + nl +
                              'Ingresa con tu email y contraseña en el sistema.' + nl + nl +
                              '⚠️ IMPORTANTE: Esta contraseña es temporal. Te recomendamos cambiarla desde tu perfil después de iniciar sesión.';
                            
                            copyToClipboard(text).then(() => {
                              toast.success('✅ Credenciales copiadas al portapapeles');
                            }).catch(error => {
                              toast.error(error instanceof Error ? error.message : 'Error al copiar');
                            });
                          }}
                          className="gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar Datos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de credenciales aprobadas */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="bg-green-50 -mx-6 -mt-6 px-6 py-4 border-b border-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <DialogTitle className="text-green-900">¡Solicitud Aprobada!</DialogTitle>
            </div>
            <DialogDescription className="text-green-700">
              La cuenta ha sido creada exitosamente. Comparte estas credenciales con el usuario.
            </DialogDescription>
          </DialogHeader>

          {approvedCredentials && (
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>IMPORTANTE:</strong> Copia estas credenciales y envíalas al usuario de forma segura. 
                    La contraseña es temporal y el usuario podrá cambiarla desde su perfil.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Correo Electrónico
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyEmail}
                      className="h-6 px-2"
                    >
                      {copiedEmail ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <p className="font-mono text-sm break-all select-all">{approvedCredentials.email}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Contraseña Temporal
                    </Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyPassword}
                      className="h-6 px-2"
                    >
                      {copiedPassword ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <p className="font-mono text-sm break-all select-all">{approvedCredentials.password}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              onClick={handleCopyCredentials}
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ¡Ambas Copiadas!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Todo
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setShowApproveDialog(false);
                setApprovedCredentials(null);
                setCopied(false);
                setCopiedEmail(false);
                setCopiedPassword(false);
              }}
              variant="outline"
              className="flex-1"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Función helper para crear una nueva solicitud (se llamará desde LoginPage)
export function createPasswordRequest(name: string, email: string, role: 'swimmer' | 'coach'): void {
  const requests = getPasswordRequests();
  
  // Verificar si ya existe una solicitud para este email
  if (requests.some(r => r.email === email && r.status === 'pending')) {
    throw new Error('Ya existe una solicitud pendiente para este correo electrónico');
  }
  
  const newRequest: PasswordRequest = {
    id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name,
    email,
    role,
    requestDate: new Date().toISOString(),
    status: 'pending',
  };
  
  requests.push(newRequest);
  savePasswordRequests(requests);
}