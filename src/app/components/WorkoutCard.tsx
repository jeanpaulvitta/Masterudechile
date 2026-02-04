import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Waves, Clock, Ruler, Download } from "lucide-react";
import { generateWorkoutPDF } from "../utils/pdfGenerator";
import type { Workout } from "../data/workouts";

interface WorkoutCardProps {
  date: string;
  day: string;
  mesociclo: string;
  distance: number;
  duration: number;
  warmup: string;
  mainSet: string[];
  cooldown: string;
  intensity: string;
}

export function WorkoutCard({
  date,
  day,
  mesociclo,
  distance,
  duration,
  warmup,
  mainSet,
  cooldown,
  intensity,
}: WorkoutCardProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case "baja":
        return "bg-green-500";
      case "media":
        return "bg-yellow-500";
      case "alta":
        return "bg-orange-500";
      case "muy alta":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getMesocicloColor = (mesociclo: string) => {
    if (mesociclo.includes("Base")) return "bg-blue-100 text-blue-800";
    if (mesociclo.includes("Desarrollo")) return "bg-purple-100 text-purple-800";
    if (mesociclo.includes("Pre-competitivo")) return "bg-orange-100 text-orange-800";
    if (mesociclo.includes("Competitivo")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleDownloadPDF = () => {
    const workout: Workout = {
      week: 0, // Este campo no se muestra en el PDF
      date,
      day,
      mesociclo,
      distance,
      duration,
      warmup,
      mainSet,
      cooldown,
      intensity,
    };
    generateWorkoutPDF(workout);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{day}</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{date}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={`${getMesocicloColor(mesociclo)} text-xs`}>{mesociclo}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              title="Descargar PDF"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-medium">{distance}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-medium">{duration} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${getIntensityColor(intensity)}`}
            />
            <span className="text-xs sm:text-sm font-medium">{intensity}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 flex-1">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Calentamiento
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{warmup}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Serie Principal
          </h4>
          <ul className="space-y-1.5">
            {mainSet.map((set, index) => (
              <li key={index} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                <span className="text-blue-600 font-medium flex-shrink-0">•</span>
                <span>{set}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Enfriamiento
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{cooldown}</p>
        </div>
      </CardContent>
    </Card>
  );
}