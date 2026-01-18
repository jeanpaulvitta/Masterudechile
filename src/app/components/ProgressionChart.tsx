import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { PersonalBestHistory } from '../data/swimmers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProgressionChartProps {
  history: PersonalBestHistory[];
  distance: number;
  style: string;
}

// Función para convertir tiempo MM:SS.SS a segundos
function timeToSeconds(time: string): number {
  const parts = time.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(time);
}

// Función para convertir segundos a formato MM:SS.SS
function secondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${minutes}:${secs.padStart(5, '0')}`;
}

// Función para formatear el eje Y
const formatYAxis = (value: number) => {
  return secondsToTime(value);
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border-2 border-blue-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-900">{data.time}</p>
        <p className="text-sm text-gray-600">{data.formattedDate}</p>
        {data.location && (
          <p className="text-xs text-gray-500 mt-1">{data.location}</p>
        )}
        {data.isPersonalBest && (
          <p className="text-xs font-bold text-yellow-600 mt-1">🏆 Récord Personal</p>
        )}
      </div>
    );
  }
  return null;
};

export function ProgressionChart({ history, distance, style }: ProgressionChartProps) {
  // Filtrar y ordenar el historial por fecha
  const filteredHistory = history
    .filter(h => h.distance === distance && h.style === style)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg">No hay datos históricos para {distance}m {style}</p>
        <p className="text-sm mt-2">Agrega más marcas para ver la progresión</p>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = filteredHistory.map(h => ({
    ...h,
    timeInSeconds: timeToSeconds(h.time),
    formattedDate: format(new Date(h.date), 'dd MMM yyyy', { locale: es }),
    dateShort: format(new Date(h.date), 'dd/MM/yy'),
  }));

  // Encontrar el mejor tiempo (menor valor)
  const bestTime = Math.min(...chartData.map(d => d.timeInSeconds));

  // Calcular rango del eje Y con un margen
  const minTime = bestTime;
  const maxTime = Math.max(...chartData.map(d => d.timeInSeconds));
  const range = maxTime - minTime;
  const yAxisMin = minTime - (range * 0.1 || 1);
  const yAxisMax = maxTime + (range * 0.1 || 1);

  // Calcular mejora total
  const firstTime = chartData[0].timeInSeconds;
  const lastTime = chartData[chartData.length - 1].timeInSeconds;
  const improvement = firstTime - lastTime;
  const improvementPercentage = ((improvement / firstTime) * 100).toFixed(1);

  // Obtener color según el estilo
  const getStyleColor = (style: string) => {
    switch (style) {
      case "Libre": return "#3b82f6"; // blue-500
      case "Espalda": return "#a855f7"; // purple-500
      case "Pecho": return "#22c55e"; // green-500
      case "Mariposa": return "#f97316"; // orange-500
      case "Combinado": return "#ec4899"; // pink-500
      default: return "#6b7280"; // gray-500
    }
  };

  const color = getStyleColor(style);

  return (
    <div className="space-y-4">
      {/* Estadísticas de mejora */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Mejor Marca</p>
          <p className="text-2xl font-bold text-blue-600">{secondsToTime(bestTime)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {chartData.find(d => d.timeInSeconds === bestTime)?.formattedDate}
          </p>
        </div>
        <div className={`${improvement > 0 ? 'bg-green-50 border-green-200' : improvement < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border-2 rounded-lg p-4`}>
          <p className="text-sm text-gray-600 mb-1">Mejora Total</p>
          <p className={`text-2xl font-bold ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {improvement > 0 ? '-' : '+'}{Math.abs(improvement).toFixed(2)}s
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {improvement > 0 ? '↓' : '↑'} {Math.abs(parseFloat(improvementPercentage))}%
          </p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total de Marcas</p>
          <p className="text-2xl font-bold text-purple-600">{chartData.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            Desde {format(new Date(filteredHistory[0].date), 'MMM yyyy', { locale: es })}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="dateShort" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[yAxisMin, yAxisMax]}
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              reversed
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              formatter={() => `Tiempo - ${distance}m ${style}`}
            />
            
            {/* Línea de referencia para el mejor tiempo */}
            <ReferenceLine 
              y={bestTime} 
              stroke="#fbbf24" 
              strokeDasharray="3 3"
              label={{ value: 'Mejor Marca', position: 'insideTopRight', fill: '#f59e0b', fontSize: 12 }}
            />
            
            {/* Línea principal */}
            <Line 
              type="monotone" 
              dataKey="timeInSeconds" 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 5 }}
              activeDot={{ r: 8, fill: color, stroke: '#fff', strokeWidth: 2 }}
              name="Tiempo"
            />
            
            {/* Puntos especiales para récords personales */}
            <Line 
              type="monotone" 
              dataKey={(entry) => entry.isPersonalBest ? entry.timeInSeconds : null}
              stroke="#fbbf24"
              strokeWidth={0}
              dot={{ fill: '#fbbf24', r: 8, stroke: '#fff', strokeWidth: 2 }}
              activeDot={false}
              name="Récord Personal"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de marcas */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <h4 className="font-bold text-gray-900 mb-3">Historial de Marcas</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Tiempo</th>
                <th className="px-4 py-2 text-left">Lugar</th>
                <th className="px-4 py-2 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {chartData.reverse().map((entry, idx) => (
                <tr key={`${entry.id}-${idx}`} className={`border-b hover:bg-gray-50 ${entry.isPersonalBest ? 'bg-yellow-50' : ''}`}>
                  <td className="px-4 py-2">
                    {format(new Date(entry.date), 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-bold" style={{ color }}>{entry.time}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {entry.location || '-'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {entry.isPersonalBest && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                        🏆 RP
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}