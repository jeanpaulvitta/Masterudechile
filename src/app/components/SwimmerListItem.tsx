import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { User, Crown } from "lucide-react";
import type { Swimmer } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "../utils/swimmerUtils";
import { isTeamRecord } from "../utils/recordsUtils";

interface SwimmerListItemProps {
  swimmer: Swimmer;
  onClick: () => void;
  allSwimmers?: Swimmer[];
}

export function SwimmerListItem({ swimmer, onClick, allSwimmers = [] }: SwimmerListItemProps) {
  // Calcular edad y categoría
  const age = calculateAge(swimmer.dateOfBirth);
  const category = calculateMasterCategory(age);

  // Contar récords del equipo que tiene este nadador
  // Asegurarse de que personalBests sea un array
  const personalBestsArray = Array.isArray(swimmer.personalBests) 
    ? swimmer.personalBests 
    : [];
  
  const teamRecordsCount = personalBestsArray.filter(pb => 
    isTeamRecord(swimmer, pb, allSwimmers)
  ).length || 0;

  const getScheduleColor = (schedule: string) => {
    if (schedule === "7am") return "bg-orange-100 text-orange-800 border-orange-200";
    if (schedule === "8am") return "bg-blue-100 text-blue-800 border-blue-200";
    if (schedule === "9pm") return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getGenderColor = (gender: string) => {
    if (gender === "Masculino") return "bg-blue-50 text-blue-700 border-blue-200";
    if (gender === "Femenino") return "bg-pink-50 text-pink-700 border-pink-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <Button
      variant="ghost"
      className="w-full h-auto p-3 sm:p-4 justify-start hover:bg-blue-50 transition-all border border-gray-200 hover:border-blue-300 hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-md overflow-hidden">
            {swimmer.profileImage ? (
              <img 
                src={swimmer.profileImage} 
                alt={swimmer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base sm:text-lg truncate">{swimmer.name}</h3>
            {teamRecordsCount > 0 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-200">
                <Crown className="w-3 h-3" />
                <span className="text-xs font-bold">{teamRecordsCount}</span>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="outline" className={`text-xs ${getScheduleColor(swimmer.schedule)}`}>
              {swimmer.schedule}
            </Badge>
            <Badge variant="outline" className={`text-xs hidden sm:inline-flex ${getGenderColor(swimmer.gender)}`}>
              {swimmer.gender}
            </Badge>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              {category}
            </Badge>
            {personalBestsArray.length > 0 && (
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                {personalBestsArray.length} marcas
              </Badge>
            )}
          </div>
        </div>

        {/* Indicador visual para clic */}
        <div className="flex-shrink-0 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Button>
  );
}