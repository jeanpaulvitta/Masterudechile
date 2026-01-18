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
      // Verificar si el email ya existe
      const emailExists = checkEmailExists(request.email);
      if (emailExists) {
        // Si el usuario ya existe, marcar la solicitud como aprobada pero informar al admin
        await api.updatePasswordRequest(request.id, {
          status: 'approved',
          generatedPassword: 'Ya existente'
        });
        
        await loadRequests(); // Recargar desde Supabase
        toast.error('Este usuario ya tiene una cuenta creada. La solicitud se marcó como aprobada.');
        return;
      }

      console.log('🔐 PasswordRequestsManager - Iniciando aprobación de solicitud:');
      console.log('  - Email:', request.email);
      console.log('  - Nombre:', request.name);
      console.log('  - Rol:', request.role);
      
      // Crear la cuenta del usuario
      const credentials = await createUserAccount(request.email, request.name, request.role);
      
      console.log('✅ PasswordRequestsManager - Credenciales recibidas:');
      console.log('  - Email:', credentials.email);
      console.log('  - Password:', credentials.password);
      console.log('  - Longitud password:', credentials.password.length);
      
      // IMPORTANTE: Guardar también en localStorage directamente
      const REGISTERED_USERS_KEY = 'natacion_master_users';
      const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
      
      // Crear el objeto de usuario con el formato correcto
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const userId = `user_${timestamp}_${randomStr}`;
      
      const newUser = {
        id: userId,
        email: credentials.email,
        name: request.name,
        password: credentials.password,
        role: request.role
      };
      
      // Agregar a la lista y guardar
      registeredUsers.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
      
      console.log('✅ Usuario guardado en localStorage:', newUser);
      console.log('📋 Total usuarios en localStorage:', registeredUsers.length);
      
      // Actualizar el estado de la solicitud en Supabase
      await api.updatePasswordRequest(request.id, {
        status: 'approved',
        generatedPassword: credentials.password
      });
      
      // Recargar solicitudes desde Supabase
      await loadRequests();
      
      // Mostrar credenciales generadas
      setApprovedCredentials(credentials);
      setShowApproveDialog(true);
      
      console.log('✅ PasswordRequestsManager - Solicitud aprobada y credenciales guardadas');
      toast.success('Solicitud aprobada y cuenta creada');
    } catch (error) {
      console.error('❌ PasswordRequestsManager - Error al aprobar solicitud:', error);
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
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Aprobadas</p>
                <p className="text-3xl font-bold text-green-700">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
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
            Usuarios que ya tienen acceso al sistema. Click en "Copiar Datos" para compartir credenciales.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                            const text = `📧 Credenciales de Acceso - Equipo Natación Master UCH\n\n` +
                              `👤 Nombre: ${request.name}\n` +
                              `📨 Email: ${request.email}\n` +
                              `🔑 Contraseña: ${request.generatedPassword}\n` +
                              `👔 Rol: ${request.role === 'coach' ? 'Entrenador' : 'Nadador'}\n\n` +
                              `🔗 Acceso al Sistema:\n` +
                              `Ingresa con tu email y contraseña en el sistema.\n\n` +
                              `⚠️ IMPORTANTE: Esta contraseña es temporal. Te recomendamos cambiarla desde tu perfil después de iniciar sesión.`;
                            
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
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    email,
    role,
    requestDate: new Date().toISOString(),
    status: 'pending',
  };
  
  requests.push(newRequest);
  savePasswordRequests(requests);
}