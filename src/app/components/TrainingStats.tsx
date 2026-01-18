import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Activity, Zap, TrendingUp, Target, Wind, Waves, Hand, Footprints, Anchor, Fish, Download } from "lucide-react";
import { generateTrainingPacePDF } from "../utils/pdfGenerator";
import { toast } from "sonner";

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

interface TrainingStatsProps {
  sessions: SessionType[];
  mesociclo?: string;
}

export function TrainingStats({ sessions, mesociclo }: TrainingStatsProps) {
  // Filtrar sesiones si hay mesociclo seleccionado
  const filteredSessions = mesociclo && mesociclo !== "Todos"
    ? sessions.filter(s => s.mesociclo === mesociclo)
    : sessions;

  // Función para descargar PDF
  const handleDownloadPDF = () => {
    try {
      generateTrainingPacePDF(filteredSessions);
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      toast.error("Error al generar el PDF");
    }
  };

  // Calcular volumen por intensidad
  const intensityVolumes: { [key: string]: number } = {
    "Baja": 0,
    "Media": 0,
    "Alta": 0,
    "Muy alta": 0
  };

  filteredSessions.forEach(session => {
    const intensity = session.intensity || "Media";
    if (intensityVolumes[intensity] !== undefined) {
      intensityVolumes[intensity] += session.distance;
    }
  });

  // Calcular volumen en técnica (estimación basada en palabras clave)
  let techniqueVolume = 0;
  let techniqueCount = 0;

  // Calcular volumen por estilo en técnica
  const techniqueByStyle: { [key: string]: number } = {
    "Crol": 0,
    "Espalda": 0,
    "Pecho": 0,
    "Mariposa": 0
  };

  // Calcular volumen por equipamiento
  const equipmentVolumes: { [key: string]: number } = {
    "Pull Buoy": 0,
    "Aletas": 0,
    "Paletas": 0,
    "Patada": 0,
    "Paracaídas": 0
  };

  const equipmentSessionCount: { [key: string]: number } = {
    "Pull Buoy": 0,
    "Aletas": 0,
    "Paletas": 0,
    "Patada": 0,
    "Paracaídas": 0
  };

  filteredSessions.forEach(session => {
    const warmup = session.warmup?.toLowerCase() || "";
    const mainSet = Array.isArray(session.mainSet) 
      ? session.mainSet.join(" ").toLowerCase() 
      : (session.mainSet?.toLowerCase() || "");
    const cooldown = session.cooldown?.toLowerCase() || "";
    const focus = session.focus?.toLowerCase() || "";
    const description = session.description?.toLowerCase() || "";
    
    const combinedText = `${warmup} ${mainSet} ${cooldown} ${focus} ${description}`;
    
    // Palabras clave SOLO para identificar trabajo técnico
    const techniqueKeywords = ["técnica", "tecnica", "drill", "drills"];
    
    // Si contiene palabras clave de técnica
    const hasTechnique = techniqueKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
    
    if (hasTechnique) {
      // Estimación conservadora: 35% del entrenamiento es técnica
      const sessionTechniqueVolume = Math.round(session.distance * 0.35);
      techniqueVolume += sessionTechniqueVolume;
      techniqueCount++;

      // Detectar estilo específico
      const styleKeywords = {
        "Crol": ["crol", "crawl", "libre", "free", "freestyle"],
        "Espalda": ["espalda", "back", "backstroke", "dorso"],
        "Pecho": ["pecho", "breast", "breaststroke", "braza"],
        "Mariposa": ["mariposa", "butterfly", "fly", "delfín", "delfin"]
      };

      let styleDetected = false;
      Object.entries(styleKeywords).forEach(([style, keywords]) => {
        const hasStyle = keywords.some(keyword => combinedText.includes(keyword));
        if (hasStyle) {
          techniqueByStyle[style] += sessionTechniqueVolume;
          styleDetected = true;
        }
      });

      // Si no se detectó estilo específico, distribuir equitativamente
      if (!styleDetected) {
        const volumePerStyle = Math.round(sessionTechniqueVolume / 4);
        Object.keys(techniqueByStyle).forEach(style => {
          techniqueByStyle[style] += volumePerStyle;
        });
      }
    }

    // Detectar equipamiento específico
    const equipmentKeywords = {
      "Pull Buoy": ["pull", "pullbuoy", "pull buoy", "pull-buoy"],
      "Aletas": ["aletas", "fins", "con aletas"],
      "Paletas": ["paletas", "paddles", "manos", "palas"],
      "Patada": ["patada", "kick", "piernas", "pies"],
      "Paracaídas": ["paracaidas", "paracaídas", "resistance", "arrastre", "parachute"]
    };

    Object.entries(equipmentKeywords).forEach(([equipment, keywords]) => {
      const hasEquipment = keywords.some(keyword => combinedText.includes(keyword));
      if (hasEquipment) {
        // Estimación: 25% del entrenamiento usa ese equipamiento
        equipmentVolumes[equipment] += Math.round(session.distance * 0.25);
        equipmentSessionCount[equipment]++;
      }
    });
  });

  // Calcular totales
  const totalDistance = filteredSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalWorkouts = filteredSessions.filter(s => s.type === 'workout').length;

  // Calcular porcentajes
  const techniquePercentage = totalDistance > 0 
    ? Math.round((techniqueVolume / totalDistance) * 100) 
    : 0;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Baja": return "text-green-600 bg-green-50";
      case "Media": return "text-blue-600 bg-blue-50";
      case "Alta": return "text-orange-600 bg-orange-50";
      case "Muy alta": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case "Baja": return Activity;
      case "Media": return Target;
      case "Alta": return TrendingUp;
      case "Muy alta": return Zap;
      default: return Activity;
    }
  };

  const getEquipmentIcon = (equipment: string) => {
    switch (equipment) {
      case "Pull Buoy": return Waves;
      case "Aletas": return Wind;
      case "Paletas": return Hand;
      case "Patada": return Footprints;
      case "Paracaídas": return Anchor;
      default: return Activity;
    }
  };

  const getEquipmentColor = (equipment: string) => {
    switch (equipment) {
      case "Pull Buoy": return "text-blue-600 bg-blue-50";
      case "Aletas": return "text-cyan-600 bg-cyan-50";
      case "Paletas": return "text-indigo-600 bg-indigo-50";
      case "Patada": return "text-teal-600 bg-teal-50";
      case "Paracaídas": return "text-slate-600 bg-slate-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "Crol": return "text-blue-600 bg-blue-50";
      case "Espalda": return "text-purple-600 bg-purple-50";
      case "Pecho": return "text-green-600 bg-green-50";
      case "Mariposa": return "text-pink-600 bg-pink-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con botón de descarga */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Análisis detallado de volumen, intensidades y equipamiento
          </p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar PDF de Ritmo
        </Button>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volumen en Técnica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Volumen en Técnica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Estadística principal */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Volumen estimado en técnica</p>
                <p className="text-4xl font-bold text-purple-600 mb-1">
                  {(techniqueVolume / 1000).toFixed(1)} km
                </p>
                <Badge variant="outline" className="mt-2">
                  {techniquePercentage}% del total
                </Badge>
              </div>

              {/* Detalles por estilo */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(techniqueByStyle).map(([style, volume]) => {
                  const color = getStyleColor(style);
                  const percentage = techniqueVolume > 0 
                    ? Math.round((volume / techniqueVolume) * 100) 
                    : 0;
                  
                  return (
                    <div 
                      key={style} 
                      className={`p-3 rounded-lg border ${
                        volume > 0 ? 'border-current' : 'border-gray-200'
                      } ${volume > 0 ? color : 'bg-gray-50'}`}
                    >
                      <p className={`text-xs mb-1 ${volume > 0 ? '' : 'text-gray-500'}`}>
                        {style}
                      </p>
                      <p className={`text-xl font-bold ${volume > 0 ? color.split(' ')[0] : 'text-gray-400'}`}>
                        {(volume / 1000).toFixed(1)} km
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full transition-all ${volume > 0 ? color : ''}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {volume > 0 && (
                        <p className="text-xs text-gray-600 mt-1">{percentage}%</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Sesiones</p>
                  <p className="text-xl font-bold text-gray-800">{techniqueCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Promedio</p>
                  <p className="text-xl font-bold text-gray-800">
                    {techniqueCount > 0 ? Math.round(techniqueVolume / techniqueCount) : 0}m
                  </p>
                </div>
              </div>

              {/* Nota explicativa */}
              <p className="text-xs text-gray-500 text-center pt-2 border-t">
                * Solo sesiones con palabras clave: técnica o drills
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Volumen por Equipamiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Volumen por Equipamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(equipmentVolumes)
                .map(([equipment, volume]) => {
                  const Icon = getEquipmentIcon(equipment);
                  const color = getEquipmentColor(equipment);
                  const percentage = totalDistance > 0 
                    ? Math.round((volume / totalDistance) * 100) 
                    : 0;
                  const sessionCount = equipmentSessionCount[equipment];
                  const averagePerSession = sessionCount > 0 
                    ? Math.round(volume / sessionCount) 
                    : 0;
                  
                  return (
                    <div 
                      key={equipment} 
                      className={`p-4 rounded-lg border-2 ${
                        volume > 0 ? 'border-current' : 'border-gray-200'
                      } ${volume > 0 ? color : 'bg-gray-50'} transition-all`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 ${volume > 0 ? color.split(' ')[0] : 'text-gray-400'}`} />
                        <span className={`font-medium text-sm ${volume > 0 ? '' : 'text-gray-500'}`}>
                          {equipment}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${volume > 0 ? color.split(' ')[0] : 'text-gray-400'}`}>
                            {volume > 0 ? (volume / 1000).toFixed(1) : '0.0'} km
                          </p>
                          {volume > 0 && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {percentage}% del total
                            </Badge>
                          )}
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${volume > 0 ? color : ''}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Promedio por sesión */}
                        {volume > 0 && (
                          <div className="pt-2 border-t border-gray-300">
                            <p className="text-xs text-gray-600 text-center">
                              {sessionCount} sesión{sessionCount !== 1 ? 'es' : ''}
                            </p>
                            <p className={`text-sm font-bold text-center ${color.split(' ')[0]}`}>
                              ~{averagePerSession}m/sesión
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {Object.values(equipmentVolumes).every(v => v === 0) && (
              <p className="text-sm text-gray-500 text-center py-4 mt-4 border-t">
                No se detectó uso de equipamiento específico en las sesiones
              </p>
            )}
            
            <p className="text-xs text-gray-500 text-center pt-4 mt-4 border-t">
              * Estimación basada en palabras clave detectadas en las descripciones de entrenamientos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}