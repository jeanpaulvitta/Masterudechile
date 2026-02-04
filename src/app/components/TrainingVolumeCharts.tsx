import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Activity, Zap } from "lucide-react";

type SessionType = {
  type: 'workout' | 'challenge';
  mesociclo: string;
  week: number;
  date: string;
  day: string;
  distance: number;
  warmup?: string;
  mainSet?: string[] | string;
  cooldown?: string;
  intensity?: string;
  focus?: string;
  description?: string;
};

interface TrainingVolumeChartsProps {
  sessions: SessionType[];
}

export function TrainingVolumeCharts({ sessions }: TrainingVolumeChartsProps) {
  // Debug: Verificar datos
  console.log('📊 TrainingVolumeCharts - INICIO DEL COMPONENTE');
  console.log('📊 Total sessions recibidas:', sessions?.length || 0);
  console.log('📊 Sessions is array?', Array.isArray(sessions));
  console.log('📊 Sample sessions (primeras 3):', sessions?.slice(0, 3));
  
  // Verificar si hay sesiones
  if (!sessions || sessions.length === 0) {
    console.log('⚠️ NO HAY SESIONES - Mostrando mensaje de fallback');
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No hay datos de entrenamientos disponibles</p>
            <p className="text-sm mt-2">Carga entrenamientos para ver los análisis de volumen</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  console.log('✅ HAY SESIONES - Continuando con el renderizado');

  // Bloques de la temporada 2026-2027
  const trainingBlocks = [
    'Base técnica + aeróbica',
    'Intensificación + velocidad',
    'Potencia + competencia',
    'Reacumulación + técnica',
    'Intensificación 2',
    'Mantenimiento competitivo',
    'Taper final'
  ];

  // Debug: Ver mesociclos únicos en los datos
  const uniqueMesociclos = [...new Set(sessions.map(s => s.mesociclo))];
  console.log('📊 Mesociclos únicos en datos:', uniqueMesociclos);

  // Calcular volúmenes por bloque
  const blockVolumeData = trainingBlocks.map(blockName => {
    const blockSessions = sessions.filter(s => s.mesociclo === blockName);
    const totalDistance = blockSessions.reduce((sum, s) => sum + s.distance, 0);
    const avgDistance = blockSessions.length > 0 ? totalDistance / blockSessions.length : 0;
    const sessionsCount = blockSessions.length;

    console.log(`📊 ${blockName}: ${sessionsCount} sesiones, ${totalDistance}m total`);

    return {
      name: blockName.replace(' + ', '\n'), // Mejor formato para el eje X
      shortName: blockName.split(' ')[0], // Nombre corto
      'Volumen Total (km)': Math.round(totalDistance / 1000 * 10) / 10,
      'Promedio por sesión (m)': Math.round(avgDistance),
      sesiones: sessionsCount
    };
  });

  // Calcular intensidades por bloque
  const blockIntensityData = trainingBlocks.map(blockName => {
    const blockSessions = sessions.filter(s => s.mesociclo === blockName);
    
    const intensityVolumes: { [key: string]: number } = {
      "Baja": 0,
      "Moderada": 0,
      "Mediana": 0,
      "Alta": 0,
      "Muy alta": 0
    };

    blockSessions.forEach(session => {
      const intensity = session.intensity || "Moderada";
      if (intensityVolumes[intensity] !== undefined) {
        intensityVolumes[intensity] += session.distance;
      } else {
        intensityVolumes["Moderada"] += session.distance;
      }
    });

    return {
      name: blockName.split(' ')[0], // Nombre corto
      'Baja': Math.round(intensityVolumes['Baja'] / 1000 * 10) / 10,
      'Moderada': Math.round(intensityVolumes['Moderada'] / 1000 * 10) / 10,
      'Mediana': Math.round(intensityVolumes['Mediana'] / 1000 * 10) / 10,
      'Alta': Math.round(intensityVolumes['Alta'] / 1000 * 10) / 10,
      'Muy alta': Math.round(intensityVolumes['Muy alta'] / 1000 * 10) / 10,
    };
  });

  // Progresión semanal (primeras 44 semanas)
  const weeklyData = Array.from({ length: 44 }, (_, i) => {
    const week = i + 1;
    const weekSessions = sessions.filter(s => s.week === week);
    const weeklyDistance = weekSessions.reduce((sum, s) => sum + s.distance, 0);
    
    return {
      week: `S${week}`,
      'Distancia (km)': Math.round(weeklyDistance / 1000 * 10) / 10,
    };
  });

  // Estadísticas generales
  const totalSessions = sessions.length;
  const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
  const avgSessionDistance = totalSessions > 0 ? totalDistance / totalSessions : 0;

  const COLORS_INTENSITY = {
    'Baja': '#10b981',
    'Moderada': '#3b82f6',
    'Mediana': '#6366f1',
    'Alta': '#f97316',
    'Muy alta': '#ef4444'
  };

  return (
    <div className="space-y-6">
      {/* DEBUG: Mensaje visual de confirmación */}
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
        <p className="font-bold text-lg">🔍 DEBUG: Componente TrainingVolumeCharts renderizado</p>
        <p className="text-sm">Total sesiones: {totalSessions} | Total distancia: {Math.round(totalDistance / 1000)} km</p>
        <p className="text-xs text-gray-600 mt-1">Si ves este mensaje pero no ves los gráficos, hay un problema con Recharts</p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Sesiones Totales</p>
                <p className="text-3xl font-bold text-blue-700">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Volumen Total</p>
                <p className="text-3xl font-bold text-green-700">
                  {Math.round(totalDistance / 1000)} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Promedio por Sesión</p>
                <p className="text-3xl font-bold text-purple-700">
                  {Math.round(avgSessionDistance)} m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volumen Total por Bloque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Volumen Total por Bloque de Entrenamiento
          </CardTitle>
          <CardDescription>
            Distribución del volumen de entrenamiento a lo largo de la temporada 2026-2027
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={blockVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="shortName" 
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: 'Volumen (km)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'Volumen Total (km)') return `${value} km`;
                  if (name === 'Promedio por sesión (m)') return `${value} m`;
                  return value;
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="Volumen Total (km)" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Volumen acumulado en cada bloque de entrenamiento (medido en kilómetros)
          </div>
        </CardContent>
      </Card>

      {/* Intensidades por Bloque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Distribución de Intensidades por Bloque
          </CardTitle>
          <CardDescription>
            Composición del volumen según nivel de intensidad en cada bloque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={blockIntensityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: 'Volumen (km)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => `${value} km`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Baja" stackId="a" fill={COLORS_INTENSITY['Baja']} />
              <Bar dataKey="Moderada" stackId="a" fill={COLORS_INTENSITY['Moderada']} />
              <Bar dataKey="Mediana" stackId="a" fill={COLORS_INTENSITY['Mediana']} />
              <Bar dataKey="Alta" stackId="a" fill={COLORS_INTENSITY['Alta']} />
              <Bar dataKey="Muy alta" stackId="a" fill={COLORS_INTENSITY['Muy alta']} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {Object.entries(COLORS_INTENSITY).map(([intensity, color]) => (
              <div key={intensity} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-700">{intensity}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Distribución de volumen por intensidad: entrenamiento apilado muestra la carga progresiva
          </p>
        </CardContent>
      </Card>

      {/* Progresión Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Progresión Semanal de Volumen (44 semanas)
          </CardTitle>
          <CardDescription>
            Evolución del volumen de entrenamiento semana a semana durante toda la temporada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 10 }}
                interval={3}
              />
              <YAxis 
                label={{ value: 'Distancia (km)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => `${value} km`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Distancia (km)" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Patrón ondulante de periodización: alternancia de semanas de carga y descarga
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Resumen por Bloque */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Detallado por Bloque</CardTitle>
          <CardDescription>
            Información consolidada de sesiones, volumen promedio y totales por bloque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Bloque</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Sesiones</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Vol. Total</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Promedio/Sesión</th>
                </tr>
              </thead>
              <tbody>
                {blockVolumeData.map((block, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-t border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{trainingBlocks[idx]}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{block.sesiones}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      {block['Volumen Total (km)']} km
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {block['Promedio por sesión (m)']} m
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                <tr>
                  <td className="px-4 py-3 font-bold text-gray-900">TOTAL TEMPORADA</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{totalSessions}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">
                    {Math.round(totalDistance / 1000)} km
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">
                    {Math.round(avgSessionDistance)} m
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}