import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bug, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { debugListAllUsers, debugClearRegisteredUsers } from '../services/auth';

export function DebugPanel() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [users, setUsers] = useState<{ demo: any[], registered: any[] } | null>(null);

  const handleListUsers = () => {
    const result = debugListAllUsers();
    setUsers(result);
    toast.success('Usuarios listados en consola');
  };

  const handleClearUsers = () => {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los usuarios registrados? Esta acción no se puede deshacer.')) {
      debugClearRegisteredUsers();
      setUsers(null);
      toast.success('✅ Usuarios registrados eliminados correctamente');
    }
  };

  const handleRefresh = () => {
    const result = debugListAllUsers();
    setUsers(result);
    toast.success('Lista actualizada');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-orange-600" />
          Panel de Diagnóstico
        </CardTitle>
        <CardDescription>
          Herramientas de debugging para inspeccionar el estado del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleListUsers}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Listar Usuarios
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={!users}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowPasswords(!showPasswords)}
            variant="outline"
            disabled={!users}
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        {users && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Usuarios Demo ({users.demo.length})</h3>
                <Badge variant="secondary">Hardcodeados</Badge>
              </div>
              <div className="space-y-2">
                {users.demo.map((u, i) => (
                  <div key={i} className="bg-gray-50 p-2 rounded text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="font-semibold">{u.email}</span>
                      <Badge variant="outline" className="text-xs">{u.role}</Badge>
                    </div>
                    {showPasswords && (
                      <div className="text-gray-600 mt-1">
                        Password: <span className="text-blue-600">{u.password}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Usuarios Registrados ({users.registered.length})</h3>
                <Badge variant="default">LocalStorage</Badge>
              </div>
              {users.registered.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No hay usuarios registrados
                </div>
              ) : (
                <div className="space-y-2">
                  {users.registered.map((u, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="font-semibold">{u.email}</span>
                        <Badge variant="outline" className="text-xs">{u.role}</Badge>
                      </div>
                      <div className="text-gray-600 mt-1">
                        ID: <span className="text-gray-800">{u.id}</span>
                      </div>
                      {showPasswords && (
                        <div className="text-gray-600 mt-1">
                          Password: <span className="text-blue-600 break-all">{u.password}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <Button
            onClick={handleClearUsers}
            variant="destructive"
            className="w-full"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Usuarios Registrados
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ⚠️ Esta acción eliminará todos los usuarios registrados (no los demo)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}