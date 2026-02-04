import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { competitions2026 } from '../utils/initCompetitions2026';
import type { Competition } from '../data/swimmers';

interface CompetitionBulkLoaderProps {
  onAddCompetition: (competition: Omit<Competition, 'id'>) => Promise<void>;
}

export function CompetitionBulkLoader({ onAddCompetition }: CompetitionBulkLoaderProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });

  const handleBulkLoad = async () => {
    if (!confirm(`¿Estás seguro de cargar ${competitions2026.length} competencias del calendario 2026-2027?`)) {
      return;
    }

    setLoading(true);
    setStatus('loading');
    setProgress({ current: 0, total: competitions2026.length });
    setResults({ success: 0, errors: 0 });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < competitions2026.length; i++) {
      try {
        await onAddCompetition(competitions2026[i]);
        successCount++;
        setResults({ success: successCount, errors: errorCount });
      } catch (error) {
        console.error(`Error al cargar competencia ${competitions2026[i].name}:`, error);
        errorCount++;
        setResults({ success: successCount, errors: errorCount });
      }
      setProgress({ current: i + 1, total: competitions2026.length });
      
      // Pequeña pausa para no saturar el servidor
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setLoading(false);
    setStatus(errorCount === 0 ? 'success' : 'error');
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Carga Masiva de Competencias 2026-2027
        </CardTitle>
        <CardDescription>
          Cargar automáticamente el calendario completo de competencias Master
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium text-blue-900">
            📅 Calendario Master 2026-2027
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>{competitions2026.length} competencias</strong> programadas</p>
            <p>• <strong>7 prioritarias</strong> (marcadas con ⭐)</p>
            <p>• <strong>Desde Marzo 2026 hasta Enero 2027</strong></p>
            <p>• Incluye: Locales, Regionales, Nacionales e Internacionales</p>
          </div>
        </div>

        {status === 'idle' && (
          <Button
            onClick={handleBulkLoad}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Cargar {competitions2026.length} Competencias
          </Button>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cargando competencias...</span>
              <span className="font-medium text-blue-600">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>✅ Exitosas: {results.success}</span>
              {results.errors > 0 && <span className="text-red-600">❌ Errores: {results.errors}</span>}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <CheckCircle className="w-5 h-5" />
              ¡Carga completada exitosamente!
            </div>
            <p className="text-sm text-green-700">
              Se cargaron {results.success} competencias correctamente.
            </p>
            <Button
              onClick={() => {
                setStatus('idle');
                setProgress({ current: 0, total: 0 });
                setResults({ success: 0, errors: 0 });
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Listo
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 font-medium">
              <AlertCircle className="w-5 h-5" />
              Carga completada con advertencias
            </div>
            <p className="text-sm text-yellow-700">
              • Exitosas: {results.success}<br />
              • Errores: {results.errors}
            </p>
            <p className="text-xs text-yellow-600">
              Revisa la consola para más detalles sobre los errores.
            </p>
            <Button
              onClick={() => {
                setStatus('idle');
                setProgress({ current: 0, total: 0 });
                setResults({ success: 0, errors: 0 });
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Lista previa de competencias */}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-blue-600">
            Ver lista completa de competencias a cargar ({competitions2026.length})
          </summary>
          <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
            {competitions2026.map((comp, index) => (
              <div
                key={index}
                className="bg-gray-50 p-2 rounded border border-gray-200 text-xs"
              >
                <div className="font-medium text-gray-900">
                  {comp.description?.includes('PRIORITARIO') && '⭐ '}
                  {comp.name}
                </div>
                <div className="text-gray-600 mt-1">
                  📅 {comp.startDate} | 📍 {comp.location} | {comp.type}
                </div>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
