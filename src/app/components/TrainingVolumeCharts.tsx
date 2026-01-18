import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

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
  // Calcular volúmenes e intensidades por mesociclo
  const mesocicloData = ['Base', 'Desarrollo', 'Pre-competitivo', 'Competitivo'].map(mesociclo => {
    const mesocicloSessions = sessions.filter(s => s.mesociclo === mesociclo);
    
    const intensityVolumes: { [key: string]: number } = {
      "Baja": 0,
      "Media": 0,
      "Alta": 0,
      "Muy alta": 0
    };

    mesocicloSessions.forEach(session => {
      const intensity = session.intensity || "Media";
      if (intensityVolumes[intensity] !== undefined) {
        intensityVolumes[intensity] += session.distance;
      }
    });

    return {
      name: mesociclo,
      'Baja': Math.round(intensityVolumes['Baja'] / 1000 * 10) / 10,
      'Media': Math.round(intensityVolumes['Media'] / 1000 * 10) / 10,
      'Alta': Math.round(intensityVolumes['Alta'] / 1000 * 10) / 10,
      'Muy alta': Math.round(intensityVolumes['Muy alta'] / 1000 * 10) / 10,
    };
  });

  const COLORS_INTENSITY = {
    'Baja': '#10b981',
    'Media': '#3b82f6',
    'Alta': '#f97316',
    'Muy alta': '#ef4444'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Volúmenes e Intensidades por Periodo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mesocicloData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Volumen (km)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: number) => `${value} km`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Legend />
            <Bar dataKey="Baja" stackId="a" fill={COLORS_INTENSITY['Baja']} />
            <Bar dataKey="Media" stackId="a" fill={COLORS_INTENSITY['Media']} />
            <Bar dataKey="Alta" stackId="a" fill={COLORS_INTENSITY['Alta']} />
            <Bar dataKey="Muy alta" stackId="a" fill={COLORS_INTENSITY['Muy alta']} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Distribución de volumen de entrenamiento por intensidad en cada mesociclo
        </div>
      </CardContent>
    </Card>
  );
}