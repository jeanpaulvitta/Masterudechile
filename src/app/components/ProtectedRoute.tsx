import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'swimmer' | 'coach';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  // Intentar usar el hook de autenticación
  let authState;
  try {
    authState = useAuth();
  } catch (error) {
    console.error('Error accessing auth context:', error);
    // Si hay un error, mostrar página de login por defecto
    return <LoginPage />;
  }
  
  const { user, loading } = authState;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
