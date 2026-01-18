import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import {
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Key,
} from "lucide-react";
import type { User } from "../contexts/AuthContext";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const REGISTERED_USERS_KEY = 'natacion_master_users';

// Cuenta de administrador del sistema
const SYSTEM_ADMIN = {
  id: 'user_admin_1',
  email: 'admin@uch.cl',
  password: 'admin123',
  name: 'Administrador UCH',
  role: 'admin' as const,
};

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

function getRegisteredUsers() {
  const stored = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: any[]) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function getAllUsers() {
  return getRegisteredUsers();
}

export function ChangePasswordDialog({ open, onOpenChange, user }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setSuccess(false);
    onOpenChange(false);
  };

  const validateForm = (): boolean => {
    setError("");

    if (!currentPassword) {
      setError("Por favor ingresa tu contraseña actual");
      return false;
    }

    if (!newPassword) {
      setError("Por favor ingresa una nueva contraseña");
      return false;
    }

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (newPassword === currentPassword) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return false;
    }

    if (!confirmPassword) {
      setError("Por favor confirma tu nueva contraseña");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar si es el administrador del sistema
      const isSystemAdmin = user.id === SYSTEM_ADMIN.id;
      
      if (isSystemAdmin) {
        // Para el admin del sistema, verificar contra la contraseña guardada en localStorage o la por defecto
        const storedAdminPassword = localStorage.getItem('system_admin_password') || SYSTEM_ADMIN.password;
        
        if (currentPassword !== storedAdminPassword) {
          setError("La contraseña actual es incorrecta");
          setLoading(false);
          return;
        }
        
        // Guardar la nueva contraseña del admin en localStorage
        localStorage.setItem('system_admin_password', newPassword);
        console.log('✅ Contraseña de administrador del sistema actualizada');
      } else {
        // Para usuarios registrados
        const registeredUsers = getRegisteredUsers();
        const userIndex = registeredUsers.findIndex((u: any) => u.id === user.id);

        if (userIndex === -1) {
          setError("Usuario no encontrado en registros");
          setLoading(false);
          return;
        }

        // Verificar contraseña actual
        if (registeredUsers[userIndex].password !== currentPassword) {
          setError("La contraseña actual es incorrecta");
          setLoading(false);
          return;
        }

        // Actualizar contraseña
        registeredUsers[userIndex].password = newPassword;
        saveRegisteredUsers(registeredUsers);
        console.log('✅ Contraseña de usuario registrado actualizada');
      }

      setSuccess(true);

      // Cerrar diálogo después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('❌ Error al cambiar contraseña:', err);
      setError("Ocurrió un error al cambiar la contraseña. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">
                      ¡Contraseña Actualizada!
                    </p>
                    <p className="text-sm text-green-700">
                      Tu contraseña ha sido cambiada exitosamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contraseña actual */}
            <div>
              <Label htmlFor="currentPassword">
                Contraseña Actual <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="border-t my-4" />

            {/* Nueva contraseña */}
            <div>
              <Label htmlFor="newPassword">
                Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showNewPassword ? (
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
                    setNewPassword(generated);
                    setConfirmPassword(generated);
                    setShowNewPassword(true);
                    setShowConfirmPassword(true);
                  }}
                  className="gap-2"
                  title="Generar contraseña segura"
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4" />
                  Generar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Usa el botón "Generar" para crear una contraseña segura
              </p>
            </div>

            {/* Confirmar nueva contraseña */}
            <div>
              <Label htmlFor="confirmPassword">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Requisitos de contraseña */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold mb-1">Requisitos:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li className={newPassword.length >= 6 ? "text-green-700" : ""}>
                        Mínimo 6 caracteres
                      </li>
                      <li className={newPassword !== currentPassword && newPassword ? "text-green-700" : ""}>
                        Diferente a la contraseña actual
                      </li>
                      <li className={newPassword === confirmPassword && confirmPassword ? "text-green-700" : ""}>
                        Las contraseñas coinciden
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Cambiar Contraseña"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}