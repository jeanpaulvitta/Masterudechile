import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trophy, Calendar, Flame, Award, Download } from "lucide-react";
import { generateChallengePDF } from "../utils/pdfGenerator";
import type { Challenge } from "../data/challenges";

interface ChallengeCardProps {
  date: string;
  day: string;
  mesociclo: string;
  distance: number;
  duration: number;
  challengeName: string;
  description: string;
  rules: string[];
  prizes: string;
  intensity: string;
}

export function ChallengeCard({
  date,
  day,
  mesociclo,
  distance,
  duration,
  challengeName,
  description,
  rules,
  prizes,
  intensity,
}: ChallengeCardProps) {
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
    const challenge: Challenge = {
      week: 0, // Este campo no se muestra en el PDF
      date,
      day,
      mesociclo,
      distance,
      duration,
      challengeName,
      description,
      rules,
      prizes,
      intensity,
    };
    generateChallengePDF(challenge);
  };

  return (
    <Card className="hover:shadow-xl transition-all border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <Badge className="bg-yellow-500 text-white">DESAFÍO SÁBADO</Badge>
            </div>
            <CardTitle className="text-xl mb-2">{challengeName}</CardTitle>
            <p className="text-sm text-gray-700 italic">{description}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
              <Badge className={getMesocicloColor(mesociclo)} variant="outline">
                {mesociclo}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPDF}
            className="h-8 px-2"
            title="Descargar PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{distance}m</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
            <span className="text-sm font-medium">{duration} min</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
            <div className={`w-3 h-3 rounded-full ${getIntensityColor(intensity)}`} />
            <span className="text-sm font-medium">{intensity}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3">
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-blue-600">📋</span> Reglas del Desafío
            </h4>
            <ul className="space-y-1">
              {rules.map((rule, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border-2 border-yellow-300">
            <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              Premio
            </h4>
            <p className="text-sm text-gray-800 font-medium">{prizes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}