import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Target, TrendingUp, CalendarDays, Trophy, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { WorkoutCard } from "./WorkoutCard";
import { ChallengeCard } from "./ChallengeCard";

type SessionType = {
  type: 'workout' | 'challenge';
  mesociclo: string;
  week: number;
  sessionNumber: number;
  date: string;
  day: string;
  distance: number;
  warmUp?: string;
  mainSet?: string;
  coolDown?: string;
  challengeType?: string;
  description?: string;
  focus?: string;
  estimatedTime?: number;
  schedule?: 'AM' | 'PM';
};

interface MesocicloDialogProps {
  mesociclo: {
    name: string;
    weeks: number;
    description: string;
    objective?: string;
    startDate?: string;
    endDate?: string;
    icon: typeof Target;
    color: string;
    bgColor?: string;
    borderColor?: string;
  };
  sessions: SessionType[];
}

export function MesocicloDialog({ mesociclo, sessions }: MesocicloDialogProps) {
  const [open, setOpen] = useState(false);
  const Icon = mesociclo.icon;

  // Mapeo de bloques a rangos de semanas
  const blockRanges = [
    { name: "Base técnica + aeróbica", weekStart: 1, weekEnd: 6 },           // Bloque 1
    { name: "Intensificación + velocidad", weekStart: 7, weekEnd: 13 },      // Bloque 2
    { name: "Potencia + competencia", weekStart: 14, weekEnd: 19 },          // Bloque 3
    { name: "Reacumulación + técnica", weekStart: 20, weekEnd: 24 },         // Bloque 4
    { name: "Intensificación 2", weekStart: 25, weekEnd: 32 },               // Bloque 5
    { name: "Mantenimiento competitivo", weekStart: 33, weekEnd: 38 },       // Bloque 6
    { name: "Taper final", weekStart: 39, weekEnd: 44 },                     // Bloque 7
  ];

  // Encontrar el rango de semanas para este mesociclo
  const currentBlock = blockRanges.find(block => block.name === mesociclo.name);
  
  // Filtrar sesiones por mesociclo (buscar por nombre exacto O por rango de semanas)
  const mesocicloSessions = sessions.filter(s => {
    // Método 1: Por nombre exacto (para entrenamientos antiguos)
    if (s.mesociclo === mesociclo.name) return true;
    
    // Método 2: Por rango de semanas (para entrenamientos nuevos con "Bloque X")
    if (currentBlock && s.week >= currentBlock.weekStart && s.week <= currentBlock.weekEnd) {
      return true;
    }
    
    // Método 3: Buscar si el mesociclo contiene "Bloque X" donde X corresponde al índice
    const blockMatch = s.mesociclo?.match(/Bloque (\d+)/);
    if (blockMatch && currentBlock) {
      const blockNumber = parseInt(blockMatch[1]);
      const blockIndex = blockRanges.findIndex(b => b.name === mesociclo.name);
      if (blockNumber === blockIndex + 1) return true;
    }
    
    return false;
  });
  
  // Agrupar por semana
  const sessionsByWeek: { [key: number]: SessionType[] } = {};
  mesocicloSessions.forEach((session) => {
    if (!sessionsByWeek[session.week]) {
      sessionsByWeek[session.week] = [];
    }
    sessionsByWeek[session.week].push(session);
  });

  // Ordenar las sesiones dentro de cada semana (Lunes, Miércoles, Viernes, Sábado)
  Object.keys(sessionsByWeek).forEach((weekKey) => {
    const dayOrder: { [key: string]: number } = {
      'Lunes': 1,
      'Martes': 2,
      'Miércoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'Sábado': 6,
      'Domingo': 7
    };
    
    sessionsByWeek[Number(weekKey)].sort((a, b) => {
      // Ordenar por día de la semana
      const dayComparison = (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);
      if (dayComparison !== 0) return dayComparison;
      
      // Si es el mismo día, ordenar por horario (AM antes que PM)
      const scheduleA = (a as any).schedule || 'AM';
      const scheduleB = (b as any).schedule || 'AM';
      if (scheduleA === 'AM' && scheduleB === 'PM') return -1;
      if (scheduleA === 'PM' && scheduleB === 'AM') return 1;
      
      return 0;
    });
  });

  // Calcular estadísticas
  const totalWorkouts = mesocicloSessions.filter(s => s.type === 'workout').length;
  const totalChallenges = mesocicloSessions.filter(s => s.type === 'challenge').length;
  const totalDistance = mesocicloSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalSessions = totalWorkouts + totalChallenges;
  const avgDistance = totalSessions > 0 ? Math.round(totalDistance / totalSessions) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Card className={`hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] ${mesociclo.bgColor || 'bg-white'} ${mesociclo.borderColor ? `border-2 ${mesociclo.borderColor}` : ''}`}>
            <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${mesociclo.bgColor || 'bg-gray-50'} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${mesociclo.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">{mesociclo.name}</h3>
                  <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-2">
                    {mesociclo.description}
                  </p>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="space-y-1.5 sm:space-y-2 border-t pt-2 sm:pt-3">
                {mesociclo.objective && (
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-xs font-medium text-gray-500 flex-shrink-0">Foco técnico:</span>
                    <span className="text-xs text-gray-700 italic line-clamp-2">{mesociclo.objective}</span>
                  </div>
                )}
                
                {mesociclo.startDate && mesociclo.endDate && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-500">Fechas:</span>
                    <span className="text-xs text-gray-700">{mesociclo.startDate} - {mesociclo.endDate}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2 pt-1 sm:pt-2">
                  <Badge variant="outline" className={`${mesociclo.color} text-xs`}>
                    {mesociclo.weeks} semanas
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="text-xs hidden sm:inline">Ver detalles</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className={`p-2 sm:p-3 rounded-lg ${mesociclo.bgColor || 'bg-gray-50'} flex-shrink-0`}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${mesociclo.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold truncate">{mesociclo.name}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
                {mesociclo.description}
              </DialogDescription>
            </div>
          </div>
          
          {/* Información del bloque */}
          <div className={`${mesociclo.bgColor} border ${mesociclo.borderColor} rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2`}>
            {mesociclo.objective && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-gray-700">🎯 Foco técnico:</span>
                <span className="text-sm text-gray-600 italic">{mesociclo.objective}</span>
              </div>
            )}
            
            {mesociclo.startDate && mesociclo.endDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">📅 Periodo:</span>
                <span className="text-sm text-gray-600">{mesociclo.startDate} - {mesociclo.endDate}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">⏱️ Duración:</span>
              <span className="text-sm text-gray-600">{mesociclo.weeks} semanas</span>
            </div>
          </div>
        </DialogHeader>

        {/* Estadísticas del mesociclo */}
        <Card className={`${mesociclo.bgColor} border ${mesociclo.borderColor}`}>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📊 Estadísticas del Bloque</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Entrenamientos</p>
                <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Desafíos</p>
                <p className="text-2xl font-bold text-gray-900">{totalChallenges}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Distancia Total</p>
                <p className="text-2xl font-bold text-gray-900">{(totalDistance / 1000).toFixed(1)} km</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Promedio/Sesión</p>
                <p className="text-2xl font-bold text-gray-900">{avgDistance}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acordeón de entrenamientos por semana */}
        <Accordion type="multiple" className="space-y-4 mt-6">
          {Object.keys(sessionsByWeek)
            .map(Number)
            .sort((a, b) => a - b)
            .map((weekNumber) => {
              const weekSessions = sessionsByWeek[weekNumber];
              
              if (!weekSessions || weekSessions.length === 0) {
                return null;
              }
              
              const weekWorkouts = weekSessions.filter(s => s.type === 'workout');
              const weekChallenge = weekSessions.find(s => s.type === 'challenge');
              const weekDistance = weekSessions.reduce((sum, s) => sum + s.distance, 0);
              
              // Formatear número de semana para negativos (Mantenimiento)
              const weekLabel = weekNumber < 0 ? `M${Math.abs(weekNumber)}` : weekNumber.toString();
              
              return (
                <AccordionItem 
                  key={weekNumber} 
                  value={`week-${weekNumber}`}
                  className="border rounded-lg px-2 sm:px-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="hover:no-underline py-2 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-2 sm:pr-4 gap-1 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm sm:text-lg">Semana {weekLabel}</span>
                          <span className="text-[10px] sm:text-sm text-gray-600">{weekSessions[0]?.date || ''}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm">
                        <div className="text-center">
                          <p className="text-gray-600 text-[10px] sm:text-sm">Entrenos</p>
                          <p className="font-bold text-xs sm:text-base">{weekWorkouts.length}</p>
                        </div>
                        {weekChallenge && (
                          <div className="text-center">
                            <p className="text-gray-600 text-[10px] sm:text-sm">Desafío</p>
                            <p className="font-bold text-xs sm:text-base">1</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-gray-600 text-[10px] sm:text-sm">Distancia</p>
                          <p className="font-bold text-xs sm:text-base">{(weekDistance / 1000).toFixed(1)}km</p>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pt-6 pb-4 px-2 snap-x snap-mandatory scrollbar-thin">
                      {weekSessions.map((session, index) => (
                        <div key={`${weekNumber}-${index}`} className="flex-shrink-0 w-[85vw] sm:w-[400px] md:w-[450px] snap-start">
                          {session.type === 'workout' ? (
                            <WorkoutCard {...session} />
                          ) : (
                            <ChallengeCard {...session} />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}