import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Trophy, Calendar, MapPin } from "lucide-react";
import type { Swimmer, PersonalBest } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "../utils/swimmerUtils";
import { timeToSeconds } from "../utils/recordsUtils";

interface TeamRecordsBoardProps {
  swimmers: Swimmer[];
}

interface RecordEntry {
  swimmer: Swimmer;
  record: PersonalBest;
  age: number;
  category: string;
}

const STYLES = ["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"] as const;
const DISTANCES = [50, 100, 200, 400, 800, 1500] as const;

// Convertir tiempo MM:SS.SS a segundos para comparación
// const timeToSeconds = (time: string): number => {
//   const parts = time.split(":");
//   if (parts.length === 2) {
//     const minutes = parseInt(parts[0]);
//     const seconds = parseFloat(parts[1]);
//     return minutes * 60 + seconds;
//   }
//   return parseFloat(time);
// };

export function TeamRecordsBoard({ swimmers }: TeamRecordsBoardProps) {
  const [selectedStyle, setSelectedStyle] = useState<typeof STYLES[number]>("Libre");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

  // Obtener todas las categorías disponibles
  const getAvailableCategories = () => {
    const categories = new Set<string>();
    swimmers.forEach((swimmer) => {
      if (swimmer.gender && swimmer.gender !== "Otro") {
        const age = calculateAge(swimmer.dateOfBirth);
        categories.add(calculateMasterCategory(age));
      }
    });
    return Array.from(categories).sort();
  };

  const availableCategories = getAvailableCategories();

  // Obtener todos los récords organizados
  const getRecordsByStyleGenderCategory = (
    style: typeof STYLES[number],
    gender: "Masculino" | "Femenino",
    distance: number
  ) => {
    const records: Map<string, RecordEntry> = new Map();

    swimmers.forEach((swimmer) => {
      // Verificar que el nadador tenga género definido
      if (!swimmer.gender || swimmer.gender === "Otro") return;
      if (swimmer.gender !== gender) return;

      const age = calculateAge(swimmer.dateOfBirth);
      const category = calculateMasterCategory(age);

      // Validar que personalBests sea un array
      if (!swimmer.personalBests || !Array.isArray(swimmer.personalBests)) return;

      swimmer.personalBests.forEach((pb) => {
        if (pb.style === style && pb.distance === distance) {
          const key = `${category}-${distance}`;
          const existing = records.get(key);

          if (!existing || timeToSeconds(pb.time) < timeToSeconds(existing.record.time)) {
            records.set(key, {
              swimmer,
              record: pb,
              age,
              category,
            });
          }
        }
      });
    });

    return records;
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "Libre":
        return "bg-blue-500";
      case "Espalda":
        return "bg-purple-500";
      case "Pecho":
        return "bg-green-500";
      case "Mariposa":
        return "bg-orange-500";
      case "Combinado":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderRecordsTable = (gender: "Masculino" | "Femenino") => {
    // Obtener todas las categorías únicas
    const categories = new Set<string>();
    swimmers.forEach((swimmer) => {
      if (swimmer.gender === gender) {
        const age = calculateAge(swimmer.dateOfBirth);
        categories.add(calculateMasterCategory(age));
      }
    });

    const sortedCategories = Array.from(categories).sort();
    
    // Filtrar por categoría seleccionada
    const filteredCategories = selectedCategory === "all" 
      ? sortedCategories 
      : sortedCategories.filter(cat => cat === selectedCategory);

    return (
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Categoría {category} - {gender === "Masculino" ? "Hombres" : "Mujeres"}
              </CardTitle>
              <CardDescription>
                Mejores marcas del equipo en {selectedStyle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DISTANCES.map((distance) => {
                  const records = getRecordsByStyleGenderCategory(
                    selectedStyle,
                    gender,
                    distance
                  );
                  const record = records.get(`${category}-${distance}`);

                  if (!record) {
                    return (
                      <div
                        key={distance}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{distance}m</span>
                          <Badge variant="outline" className="text-xs">
                            Sin registro
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          No hay marcas registradas
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={distance}
                      className="border-2 border-yellow-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-white hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-lg">{distance}m</span>
                        <Badge className={`${getStyleColor(selectedStyle)} text-white`}>
                          <Trophy className="w-3 h-3 mr-1" />
                          Récord
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {record.record.time}
                          </p>
                        </div>
                        <div className="border-t pt-2">
                          <p className="font-semibold text-gray-800">
                            {record.swimmer.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{record.record.date}</span>
                          </div>
                          {record.record.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{record.record.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No hay nadadores registrados en esta categoría</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Récords del Equipo</h2>
        <p className="text-gray-600">
          Mejores marcas por estilo, género y categoría de edad
        </p>
      </div>

      {/* Selector de Estilo */}
      <div className="flex flex-wrap gap-2 px-1">
        {STYLES.map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedStyle === style
                ? `${getStyleColor(style)} text-white shadow-lg scale-105`
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Selector de Categoría */}
      {availableCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtrar por Categoría de Edad:</h3>
          <div className="flex flex-wrap gap-2 px-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-yellow-500 text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Todas
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-yellow-500 text-white shadow-lg scale-105"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs por Género */}
      <Tabs defaultValue="masculino" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="masculino">Masculino</TabsTrigger>
          <TabsTrigger value="femenino">Femenino</TabsTrigger>
        </TabsList>

        <TabsContent value="masculino" className="mt-6">
          {renderRecordsTable("Masculino")}
        </TabsContent>

        <TabsContent value="femenino" className="mt-6">
          {renderRecordsTable("Femenino")}
        </TabsContent>
      </Tabs>
    </div>
  );
}