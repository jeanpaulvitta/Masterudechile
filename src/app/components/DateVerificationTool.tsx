import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface DateVerificationResult {
  week: number;
  lunes: { date: string; dayName: string; isCorrect: boolean };
  miercoles: { date: string; dayName: string; isCorrect: boolean };
  viernes: { date: string; dayName: string; isCorrect: boolean };
}

export function DateVerificationTool() {
  const [showVerification, setShowVerification] = useState(false);
  const [results, setResults] = useState<DateVerificationResult[]>([]);

  const verifyDates = () => {
    const verificationResults: DateVerificationResult[] = [];

    // Verificar primeras 10 semanas como muestra
    for (let week = 1; week <= 10; week++) {
      const daysOffset = (week - 1) * 7;

      // Lunes
      const monday = new Date(2026, 2, 2); // marzo = 2
      monday.setDate(2 + daysOffset);
      const mondayName = monday.toLocaleDateString('es-ES', { weekday: 'long' });
      const mondayDate = monday.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // Miércoles
      const wednesday = new Date(2026, 2, 2);
      wednesday.setDate(2 + daysOffset + 2);
      const wednesdayName = wednesday.toLocaleDateString('es-ES', { weekday: 'long' });
      const wednesdayDate = wednesday.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // Viernes
      const friday = new Date(2026, 2, 2);
      friday.setDate(2 + daysOffset + 4);
      const fridayName = friday.toLocaleDateString('es-ES', { weekday: 'long' });
      const fridayDate = friday.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      verificationResults.push({
        week,
        lunes: {
          date: mondayDate,
          dayName: mondayName,
          isCorrect: mondayName === 'lunes',
        },
        miercoles: {
          date: wednesdayDate,
          dayName: wednesdayName,
          isCorrect: wednesdayName === 'miércoles',
        },
        viernes: {
          date: fridayDate,
          dayName: fridayName,
          isCorrect: fridayName === 'viernes',
        },
      });
    }

    setResults(verificationResults);
    setShowVerification(true);
  };

  const allCorrect = results.every(
    (r) => r.lunes.isCorrect && r.miercoles.isCorrect && r.viernes.isCorrect
  );

  return (
    <Card className="border-purple-300 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Calendar className="w-5 h-5" />
          Verificación de Fechas de Temporada
        </CardTitle>
        <CardDescription className="text-purple-700">
          Herramienta de diagnóstico para verificar que las fechas coincidan con los días correctos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showVerification ? (
          <Button onClick={verifyDates} className="w-full bg-purple-600 hover:bg-purple-700">
            <Calendar className="w-4 h-4 mr-2" />
            Verificar Fechas (primeras 10 semanas)
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Resultado general */}
            <div
              className={`p-4 rounded-lg ${
                allCorrect
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      ✅ Todas las fechas son correctas
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      ❌ Se encontraron fechas incorrectas
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Tabla de resultados */}
            <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-purple-900">
                        Semana
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-purple-900">
                        Lunes
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-purple-900">
                        Miércoles
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-purple-900">
                        Viernes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.week} className="border-t border-purple-100">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          Semana {result.week}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {result.lunes.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <div className="text-xs">
                              <div className="font-medium">{result.lunes.date}</div>
                              <div className="text-gray-500">({result.lunes.dayName})</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {result.miercoles.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <div className="text-xs">
                              <div className="font-medium">{result.miercoles.date}</div>
                              <div className="text-gray-500">({result.miercoles.dayName})</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {result.viernes.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <div className="text-xs">
                              <div className="font-medium">{result.viernes.date}</div>
                              <div className="text-gray-500">({result.viernes.dayName})</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fechas clave */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">
                📅 Fechas Clave Verificadas:
              </p>
              <div className="space-y-1 text-xs text-blue-800">
                <div>
                  • <strong>Semana 1 (Lunes):</strong> {results[0]?.lunes.date || 'N/A'} → Inicio
                  Bloque 1
                </div>
                <div>
                  • <strong>Semana 6 (Viernes):</strong> {results[5]?.viernes.date || 'N/A'} →
                  Fin Bloque 1
                </div>
                <div>
                  • <strong>Semana 7 (Lunes):</strong> {results[6]?.lunes.date || 'N/A'} → Inicio
                  Bloque 2
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowVerification(false)}
              variant="outline"
              className="w-full"
            >
              Cerrar Verificación
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
