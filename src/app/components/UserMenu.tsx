import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, LogOut, Shield, Key } from 'lucide-react';
import { Badge } from './ui/badge';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { useState } from 'react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return user.email.charAt(0).toUpperCase();
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600">Administrador</Badge>;
      case 'coach':
        return <Badge className="bg-blue-600">Entrenador</Badge>;
      case 'swimmer':
        return <Badge className="bg-green-600">Nadador</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full z-20">
          <Avatar className="h-10 w-10 border-2 border-white shadow-md">
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 z-50" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-semibold">{user.name || 'Usuario'}</span>
            </div>
            <p className="text-xs font-normal text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              {getRoleBadge(user.role)}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setChangePasswordOpen(true)}
          className="cursor-pointer"
        >
          <Key className="w-4 h-4 mr-2" />
          Cambiar Contraseña
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Diálogo de cambio de contraseña */}
      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen}
        user={user}
      />
    </DropdownMenu>
  );
}