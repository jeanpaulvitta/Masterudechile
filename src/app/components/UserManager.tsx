import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Waves,
  Trash2,
  Edit,
  Mail,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Key,
  Inbox,
  Bug,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Swimmer } from "../data/swimmers";
import { PasswordRequestsManager } from "./PasswordRequestsManager";
import { DebugPanel } from "./DebugPanel";
import { copyToClipboard } from "../utils/clipboard";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "admin" | "coach" | "swimmer";
  password?: string;
  swimmerId?: string;
  origin?: "manual" | "request"; // Nuevo campo para identificar el origen
  requestDate?: string; // Fecha de la solicitud si aplica
}

interface UserManagerProps {
  swimmers: Swimmer[];
}

const REGISTERED_USERS_KEY = 'natacion_master_users';

// Función para generar contraseña aleatoria segura
function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%&*-_';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Asegurar al menos uno de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Rellenar el resto
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function UserManager({ swimmers }: UserManagerProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [createdUserPassword, setCreatedUserPassword] = useState<string | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<UserData | null>(null);
  
  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "coach" | "swimmer">("swimmer");
  const [formSwimmerId, setFormSwimmerId] = useState("");
  const [error, setError] = useState("");

  // Cargar usuarios registrados
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('🔄 Cargando usuarios desde Supabase...');
      
      // Limpiar localStorage viejo
      localStorage.removeItem(REGISTERED_USERS_KEY);
      console.log('🗑️ localStorage limpiado');
      
      // Cargar usuarios desde Supabase
      const response = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/users', {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuarios cargados desde Supabase:', data.users?.length || 0, 'usuarios');
        console.table(data.users);
        setUsers(data.users || []);
      } else {
        console.error('❌ Error al cargar usuarios desde Supabase:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      setUsers([]);
    }
  };

  const saveUsers = async (updatedUsers: UserData[]) => {
    // Ya no guardar en localStorage
    setUsers(updatedUsers);
  };

  const handleOpenDialog = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormEmail(user.email);
      setFormName(user.name);
      setFormPassword("");
      setFormRole(user.role);
      setFormSwimmerId(user.swimmerId || "");
    } else {
      setEditingUser(null);
      setFormEmail("");
      setFormName("");
      setFormPassword("");
      setFormRole("swimmer");
      setFormSwimmerId("");
    }
    setError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setError("");
    setShowPassword(false);
    setPasswordCopied(false);
    setCreatedUserPassword(null);
    setCreatedUserData(null);
  };

  const validateForm = (): boolean => {
    if (!formEmail || !formName) {
      setError("Email y nombre son obligatorios");
      return false;
    }

    if (!editingUser && !formPassword) {
      setError("La contraseña es obligatoria para nuevos usuarios");
      return false;
    }

    if (formPassword && formPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    // Verificar email duplicado (excepto al editar el mismo usuario)
    const emailExists = users.some(
      (u) => u.email === formEmail && u.id !== editingUser?.id
    );
    if (emailExists) {
      setError("Este correo electrónico ya está registrado");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    if (editingUser) {
      // Editar usuario existente
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              email: formEmail,
              name: formName,
              role: formRole,
              ...(formPassword ? { password: formPassword } : {}),
            }
          : u
      );
      saveUsers(updatedUsers);
    } else {
      // Crear nuevo usuario
      const newUser: UserData = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: formEmail,
        name: formName,
        password: formPassword,
        role: formRole,
      };
      saveUsers([...users, newUser]);
      
      // Si es nadador, crear ficha automáticamente
      if (formRole === 'swimmer') {
        createSwimmerProfile(newUser);
      }
      
      setCreatedUserPassword(formPassword);
      setCreatedUserData(newUser);
      setConfirmationDialogOpen(true);
    }

    handleCloseDialog();
  };

  const createSwimmerProfile = async (user: UserData) => {
    try {
      console.log('🏊‍♂️ Creando ficha automática para:', user.name);
      
      const today = new Date();
      const defaultBirthYear = today.getFullYear() - 25;
      const monthNum = today.getMonth() + 1;
      const dayNum = today.getDate();
      const monthStr = monthNum < 10 ? '0' + monthNum : String(monthNum);
      const dayStr = dayNum < 10 ? '0' + dayNum : String(dayNum);
      const defaultDateOfBirth = String(defaultBirthYear) + '-' + monthStr + '-' + dayStr;
      
      const swimmerData = {
        name: user.name,
        email: user.email,
        rut: '00.000.000-0',
        gender: 'Masculino',
        dateOfBirth: defaultDateOfBirth,
        schedule: '7am',
        joinDate: new Date().toISOString().split('T')[0],
        personalBests: [],
        personalBestsHistory: [],
        goals: []
      };
      
      const response = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/swimmers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
        },
        body: JSON.stringify(swimmerData)
      });
      
      if (response.ok) {
        console.log('✅ Ficha de nadador creada automáticamente');
      } else {
        console.error('⚠️ Error al crear ficha automática');
      }
    } catch (error) {
      console.error('⚠️ Error creando ficha de nadador:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const confirmMsg = user.role === 'swimmer' 
      ? `¿Estás seguro de eliminar a ${user.name}?\n\n⚠️ Esto también eliminará su ficha de nadador y todos sus datos (marcas, asistencias, etc.)`
      : `¿Estás seguro de eliminar a ${user.name}?`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
      console.log('🗑️ Eliminando usuario:', user.email);
      
      // Si es nadador, eliminar primero su ficha
      if (user.role === 'swimmer') {
        try {
          console.log('🏊‍♂️ Buscando ficha de nadador para eliminar...');
          
          // Obtener todas las fichas
          const swimmersRes = await fetch('https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/swimmers', {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
            }
          });
          
          if (swimmersRes.ok) {
            const swimmersData = await swimmersRes.json();
            const swimmer = swimmersData.swimmers?.find((s: any) => s.email === user.email);
            
            if (swimmer) {
              console.log('🗑️ Eliminando ficha de nadador:', swimmer.id);
              
              const deleteSwimmerRes = await fetch(`https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/swimmers/${swimmer.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
                }
              });
              
              if (deleteSwimmerRes.ok) {
                console.log('✅ Ficha de nadador eliminada');
              } else {
                console.warn('⚠️ No se pudo eliminar la ficha de nadador');
              }
            } else {
              console.log('ℹ️ No se encontró ficha de nadador para este usuario');
            }
          }
        } catch (swimmerError) {
          console.error('⚠️ Error al eliminar ficha de nadador:', swimmerError);
          // Continuar con la eliminación del usuario aunque falle la ficha
        }
      }
      
      // Eliminar el usuario de Supabase
      console.log('🗑️ Eliminando usuario de Supabase...');
      const deleteUserRes = await fetch(`https://rztiyofwhlwvofwhcgue.supabase.co/functions/v1/make-server-000a47d9/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dGl5b2Z3aGx3dm9md2hjZ3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTk3ODUsImV4cCI6MjA4MjU5NTc4NX0.cuYH2GPWE4SocLIEHUaPIa8l2wNBifT9NdLKjyeaDsE'
        }
      });
      
      if (deleteUserRes.ok) {
        console.log('✅ Usuario eliminado de Supabase');
        
        // Recargar usuarios
        await loadUsers();
        
        alert('✅ Usuario eliminado correctamente' + (user.role === 'swimmer' ? ' (incluyendo su ficha de nadador)' : ''));
      } else {
        console.error('❌ Error al eliminar usuario de Supabase');
        alert('❌ Error al eliminar usuario');
      }
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      alert('❌ Error al eliminar usuario');
    }
  };

  const handleResetPassword = (userId: string, userName: string) => {
    if (confirm(`¿Deseas generar una nueva contraseña para ${userName}?`)) {
      const newPassword = generateSecurePassword();
      const updatedUsers = users.map((u) =>
        u.id === userId
          ? { ...u, password: newPassword }
          : u
      );
      saveUsers(updatedUsers);
      
      // Mostrar la nueva contraseña
      const user = updatedUsers.find(u => u.id === userId);
      if (user) {
        setCreatedUserPassword(newPassword);
        setCreatedUserData(user);
        setConfirmationDialogOpen(true);
      }
    }
  };

  const handleCopyCredentials = (user: UserData) => {
    // Mostrar las credenciales actuales sin cambiar la contraseña
    setCreatedUserPassword(user.password || '');
    setCreatedUserData(user);
    setConfirmationDialogOpen(true);
  };
  
  // Usuarios reales
  const allUsers = users;

  // Estadísticas
  const stats = {
    total: allUsers.length,
    admins: allUsers.filter((u) => u.role === "admin").length,
    coaches: allUsers.filter((u) => u.role === "coach").length,
    swimmers: allUsers.filter((u) => u.role === "swimmer").length,
    registered: users.length,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-600">Administrador</Badge>;
      case "coach":
        return <Badge className="bg-blue-600">Entrenador</Badge>;
      case "swimmer":
        return <Badge className="bg-green-600">Nadador</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5 text-purple-600" />;
      case "coach":
        return <Users className="w-5 h-5 text-blue-600" />;
      case "swimmer":
        return <Waves className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Gestión de Usuarios</h2>
        <p className="text-gray-600">
          Administra cuentas y solicitudes de acceso al sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Usuarios Registrados
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Inbox className="w-4 h-4" />
            Solicitudes de Acceso
          </TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios Registrados */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Cuentas Activas</h3>
              <p className="text-gray-600 text-sm">
                Administra cuentas de nadadores, coaches y administradores
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{stats.coaches}</p>
                <p className="text-sm text-gray-600">Coaches</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Waves className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{stats.swimmers}</p>
                <p className="text-sm text-gray-600">Nadadores</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <UserPlus className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{stats.registered}</p>
                <p className="text-sm text-gray-600">Registrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Usuarios Registrados ({allUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay usuarios registrados todavía</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleOpenDialog()}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Primer Usuario
                    </Button>
                  </div>
                ) : (
                  allUsers.map((user) => {
                    const swimmer = user.swimmerId
                      ? swimmers.find((s) => s.id === user.swimmerId)
                      : null;

                    return (
                      <Card
                        key={user.id}
                        className={`${
                          "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">{getRoleIcon(user.role)}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold">{user.name}</h3>
                                  {getRoleBadge(user.role)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                  </div>

                                  {swimmer ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Ficha: {swimmer.name}</span>
                                    </div>
                                  ) : user.role === "swimmer" ? (
                                    <div className="flex items-center gap-2 text-orange-600">
                                      <XCircle className="w-4 h-4" />
                                      <span>Sin ficha de nadador</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(user as UserData)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetPassword(user.id, user.name)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyCredentials(user)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Diálogo de crear/editar usuario */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingUser ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Modifica la información del usuario"
                    : "Crea una nueva cuenta de usuario"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="usuario@uch.cl"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <Label htmlFor="name">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Nombre y Apellido"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <Label htmlFor="password">
                    Contraseña {!editingUser && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={
                          editingUser ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"
                        }
                        className="pl-10 pr-10"
                        required={!editingUser}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const generated = generateSecurePassword();
                        setFormPassword(generated);
                        setShowPassword(true);
                      }}
                      className="gap-2"
                      title="Generar contraseña segura"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Generar
                    </Button>
                  </div>
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Deja este campo vacío si no quieres cambiar la contraseña
                    </p>
                  )}
                  {!editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Usa el botón "Generar" para crear una contraseña segura automáticamente
                    </p>
                  )}
                </div>

                {/* Rol */}
                <div>
                  <Label htmlFor="role">
                    Rol <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formRole} onValueChange={(value: any) => setFormRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-600" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="coach">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Entrenador
                        </div>
                      </SelectItem>
                      <SelectItem value="swimmer">
                        <div className="flex items-center gap-2">
                          <Waves className="w-4 h-4 text-green-600" />
                          Nadador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formRole === 'swimmer' && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      La ficha de nadador se creará automáticamente
                    </p>
                  )}
                </div>

                {/* ID de nadador (solo para swimmers) */}
                {formRole === "swimmer" && (
                  <div>
                    <Label htmlFor="swimmerId">Ficha de Nadador (Opcional)</Label>
                    <Select
                      value={formSwimmerId || "none"}
                      onValueChange={(value) => setFormSwimmerId(value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Asociar con una ficha existente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin ficha asociada</SelectItem>
                        {swimmers.map((swimmer) => (
                          <SelectItem key={swimmer.id} value={swimmer.id}>
                            {swimmer.name} - {swimmer.email || "Sin email"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Si no seleccionas ninguna, se creará automáticamente al iniciar sesión
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Guardar Cambios" : "Crear Usuario"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Diálogo de confirmación de creación de usuario */}
          <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ¡Usuario Creado Exitosamente!
                </DialogTitle>
                <DialogDescription>
                  Guarda esta información para entregar al usuario. Puedes copiar la contraseña haciendo clic en el ícono.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">
                          Importante
                        </p>
                        <p className="text-sm text-green-700">
                          Esta contraseña solo se mostrará una vez. Asegúrate de copiarla y entregarla al usuario de forma segura.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label>Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={createdUserData?.email || ""}
                      readOnly
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label>Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      value={createdUserData?.name || ""}
                      readOnly
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label>Contraseña Generada</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={createdUserPassword || ""}
                      readOnly
                      className="pl-10 pr-20 bg-yellow-50 border-yellow-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-10 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const message = `🏊‍♂️ NATACIÓN MASTER UCH - Credenciales de Acceso

¡Hola ${createdUserData?.name}! Tu cuenta ha sido creada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${createdUserData?.email}
🔑 Contraseña: ${createdUserPassword}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 INSTRUCCIONES:
1. Ingresa a la aplicación con estas credenciales
2. Cambia tu contraseña desde tu perfil (recomendado)
3. La contraseña es temporal y única

⚠️ IMPORTANTE: 
• Guarda estas credenciales en un lugar seguro
• No compartas tu contraseña con nadie
• Si olvidas tu contraseña, contacta al administrador

¡Bienvenido al equipo! 🏊‍♂️💪`;
                          
                          console.log('📋 Intentando copiar:', message);
                          await copyToClipboard(message);
                          setPasswordCopied(true);
                          setTimeout(() => setPasswordCopied(false), 2000);
                          console.log('✅ Copiado exitosamente');
                          alert('✅ Credenciales copiadas al portapapeles');
                        } catch (error) {
                          console.error('❌ Error al copiar:', error);
                          alert('❌ Error al copiar. Selecciona y copia el texto manualmente.');
                        }
                      }}
                      className="absolute right-3 top-3 text-gray-400 hover:text-green-600"
                    >
                      {passwordCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {passwordCopied ? "✓ Contraseña copiada al portapapeles" : "Haz clic en el ícono para copiar"}
                  </p>
                </div>

                <div>
                  <Label>Rol Asignado</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    {getRoleIcon(createdUserData?.role || "")}
                    <span className="font-medium">
                      {createdUserData?.role === "admin" && "Administrador"}
                      {createdUserData?.role === "coach" && "Entrenador"}
                      {createdUserData?.role === "swimmer" && "Nadador"}
                    </span>
                    {getRoleBadge(createdUserData?.role || "")}
                  </div>
                </div>

                {createdUserData?.swimmerId && (
                  <div>
                    <Label>Ficha de Nadador</Label>
                    <div className="relative">
                      <Waves className="absolute left-3 top-3 w-4 h-4 text-green-400" />
                      <Input
                        type="text"
                        value={swimmers.find(s => s.id === createdUserData.swimmerId)?.name || "Asociada"}
                        readOnly
                        className="pl-10 bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const message = `🏊‍♂️ NATACIÓN MASTER UCH - Credenciales de Acceso

¡Hola ${createdUserData?.name}! Tu cuenta ha sido creada.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: ${createdUserData?.email}
🔑 Contraseña: ${createdUserPassword}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 INSTRUCCIONES:
1. Ingresa a la aplicación con estas credenciales
2. Cambia tu contraseña desde tu perfil (recomendado)
3. La contraseña es temporal y única

⚠️ IMPORTANTE: 
• Guarda estas credenciales en un lugar seguro
• No compartas tu contraseña con nadie
• Si olvidas tu contraseña, contacta al administrador

¡Bienvenido al equipo! 🏊‍♂️💪`;
                      
                      console.log('📋 Intentando copiar:', message);
                      await copyToClipboard(message);
                      setPasswordCopied(true);
                      setTimeout(() => setPasswordCopied(false), 2000);
                      console.log('✅ Copiado exitosamente');
                      alert('✅ Credenciales copiadas al portapapeles');
                    } catch (error) {
                      console.error('❌ Error al copiar:', error);
                      alert('❌ Error al copiar. Selecciona y copia el texto manualmente.');
                    }
                  }}
                  className="gap-2"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Todo
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setConfirmationDialogOpen(false);
                    setShowPassword(false);
                    setPasswordCopied(false);
                  }}
                >
                  Entendido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab de Solicitudes de Acceso */}
        <TabsContent value="requests" className="space-y-6">
          <PasswordRequestsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}