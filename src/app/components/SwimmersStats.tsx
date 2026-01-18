import { Card, CardContent } from "./ui/card";
import { Users } from "lucide-react";
import type { Swimmer } from "../data/swimmers";

interface SwimmersStatsProps {
  swimmers: Swimmer[];
}

export function SwimmersStats({ swimmers }: SwimmersStatsProps) {
  // Calcular estadísticas globales
  const totalSwimmers = swimmers.length;

  // Nadadores por horario
  const by7am = swimmers.filter(s => s.schedule === "7am").length;
  const by8am = swimmers.filter(s => s.schedule === "8am").length;
  const by9pm = swimmers.filter(s => s.schedule === "9pm").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Nadadores</p>
              <p className="text-2xl font-bold">{totalSwimmers}</p>
              <p className="text-xs text-gray-500">
                7am: {by7am} | 8am: {by8am} | 9pm: {by9pm}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}