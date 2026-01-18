import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Activity, Clock, TrendingUp } from "lucide-react";
import type { PersonalBest, Swimmer } from "../data/swimmers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PerformanceDialogProps {
  swimmer: Swimmer;
  personalBests?: PersonalBest[];
}

// Configuración de zonas de entrenamiento
const TRAINING_ZONES = {
  Z1_A1: {
    name: "Z1 - A1 Recuperación Aeróbica",
    shortName: "A1",
    zone: "Z1",
    color: "from-green-100 to-emerald-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    increments: { 50: 12, 100: 18, 200: 30, 400: 40 }
  },
  Z1_A2: {
    name: "Z1 - A2 Mantenimiento Aeróbico",
    shortName: "A2",
    zone: "Z1",
    color: "from-green-100 to-emerald-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    increments: { 50: 11, 100: 16, 200: 25, 400: 35 }
  },
  Z1_A3: {
    name: "Z1 - A3 Desarrollo Aeróbico",
    shortName: "A3",
    zone: "Z1",
    color: "from-green-100 to-emerald-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
    increments: { 50: 10, 100: 15, 200: 20, 400: 30 }
  },
  Z2: {
    name: "Z2 - Umbral Anaeróbico",
    shortName: "Z2",
    zone: "Z2",
    color: "from-blue-100 to-cyan-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    increments: { 50: 8, 100: 13, 200: 18, 400: 26 }
  },
  Z3: {
    name: "Z3 - VO2 Máx",
    shortName: "Z3",
    zone: "Z3",
    color: "from-orange-100 to-amber-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-300",
    increments: { 50: 4, 100: 10, 200: 16, 400: 21 }
  },
  Z4: {
    name: "Z4 - Tolerancia Láctica",
    shortName: "Z4",
    zone: "Z4",
    color: "from-red-100 to-rose-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
    increments: { 50: 2, 100: 4, 200: 8, 400: 16 }
  },
  Z5: {
    name: "Z5 - Potencia Láctica",
    shortName: "Z5",
    zone: "Z5",
    color: "from-purple-100 to-fuchsia-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-300",
    increments: { 50: 1, 100: 2, 200: 4, 400: 8 }
  }
};

// Estilos de natación (deben coincidir con PersonalBestsDialog)
const SWIMMING_STYLES = [
  { value: "Libre", label: "Crol (Libre)" },
  { value: "Espalda", label: "Espalda" },
  { value: "Pecho", label: "Pecho" },
  { value: "Mariposa", label: "Mariposa" },
  { value: "Combinado", label: "Combinado" }
];

// Función para convertir tiempo "MM:SS.ms" a segundos totales
function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(timeStr);
}

// Función para convertir segundos a formato "MM:SS.ms"
function secondsToTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  }
  return `${seconds.toFixed(2)}`;
}

// Función para calcular el ritmo de entrenamiento
// Ahora el cálculo es directo: tiempo de la distancia específica + incremento
function calculatePace(personalBests: PersonalBest[], selectedStyle: string, targetDistance: number, increment: number): string {
  // Buscar el tiempo exacto de la distancia objetivo
  const record = personalBests.find(pb => pb.style === selectedStyle && pb.distance === targetDistance);
  
  if (!record || !record.time) return "N/A";
  
  const baseSeconds = timeToSeconds(record.time);
  if (baseSeconds === 0) return "N/A";
  
  // Cálculo directo: tiempo base + incremento
  const trainingTime = baseSeconds + increment;
  
  return secondsToTime(trainingTime);
}

export function PerformanceDialog({ swimmer, personalBests = [] }: PerformanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("Libre");

  // Asegurarse de que personalBests sea un array
  const personalBestsArray = Array.isArray(personalBests) ? personalBests : [];

  // Filtrar mejores marcas por estilo seleccionado
  const bestTimesForStyle = personalBestsArray.filter(pb => pb.style === selectedStyle);

  // Encontrar las mejores marcas para las distancias de referencia
  const getBestTime = (distance: number) => {
    const record = bestTimesForStyle.find(pb => pb.distance === distance);
    return record?.time || "";
  };

  const best100 = getBestTime(100);
  const best200 = getBestTime(200);
  
  // Determinar cuál usar como base (priorizar 100m, luego 200m)
  const baseTime = best100 || best200;
  const baseDistance = best100 ? 100 : 200;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Activity className="w-4 h-4" />
          Ritmos de Entrenamiento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Ritmos de Entrenamiento - {swimmer.name}
          </DialogTitle>
          <DialogDescription>
            Ritmos calculados basados en las mejores marcas personales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Selector de Estilo */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Estilo</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SWIMMING_STYLES.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Mejores Marcas del Estilo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Mejores Marcas - {SWIMMING_STYLES.find(s => s.value === selectedStyle)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestTimesForStyle.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay marcas registradas para este estilo</p>
                  <p className="text-sm mt-2">Agrega marcas personales para ver los ritmos de entrenamiento</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[50, 100, 200, 400].map(distance => {
                    const time = getBestTime(distance);
                    return (
                      <div key={distance} className={`p-3 rounded-lg text-center ${time ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <p className="text-sm text-gray-600">{distance}m</p>
                        <p className={`text-xl font-bold ${time ? 'text-green-600' : 'text-gray-400'}`}>
                          {time || "N/A"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zonas de Entrenamiento */}
          {bestTimesForStyle.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(TRAINING_ZONES).map(([key, zone]) => (
                <Card key={key} className={`bg-gradient-to-r ${zone.color}`}>
                  <CardHeader>
                    <CardTitle className={`text-lg ${zone.textColor}`}>
                      {zone.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[50, 100, 200, 400].map(distance => {
                        const pace = calculatePace(personalBests, selectedStyle, distance, zone.increments[distance as keyof typeof zone.increments]);
                        return (
                          <div key={distance} className="bg-white bg-opacity-70 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-600 font-semibold">{distance}m</p>
                            <p className="text-lg font-bold text-gray-800">{pace}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              +{zone.increments[distance as keyof typeof zone.increments]}s
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-yellow-50 border border-yellow-200">
              <CardContent className="pt-6 text-center">
                <p className="text-yellow-800">
                  No hay marcas registradas para este estilo. Agrega tus mejores tiempos para ver los ritmos de entrenamiento.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Leyenda */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Leyenda de Zonas</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p><strong>Z1 - A1:</strong> Recuperación Aeróbica - Ritmo suave para recuperación activa</p>
              <p><strong>Z1 - A2:</strong> Mantenimiento Aeróbico - Ritmo con mayor intensidad que A1</p>
              <p><strong>Z1 - A3:</strong> Desarrollo Aeróbico - Ritmo para mejorar la capacidad aeróbica</p>
              <p><strong>Z2:</strong> Umbral Anaeróbico - El punto en el cual la acumulación de lactato comienza a elevarse bruscamente</p>
              <p><strong>Z3:</strong> VO2 Máx - Capacidad Aeróbica Máxima - Ritmo aerobico fuerte para mejorar consumo de oxígeno</p>
              <p><strong>Z4:</strong> Tolerancia Láctica - Entrenamieto muy cercano a ritmo de carrera</p>
              <p><strong>Z5:</strong> Potencia Láctica - Ritmo máximo para series de velocidad</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}