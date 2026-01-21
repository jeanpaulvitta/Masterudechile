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
          Administra solicitudes de acceso y usuarios del sistema
        </p>
      </div>

      {/* Todo en una sola vista - Solicitudes de Acceso */}
      <PasswordRequestsManager />
    </div>
  );
}