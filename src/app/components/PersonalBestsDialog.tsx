import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Trophy, Plus, Trash2, Award, Crown } from "lucide-react";
import type { PersonalBest, PersonalBestHistory, Swimmer } from "../data/swimmers";
import { isTeamRecord } from "../utils/recordsUtils";

interface PersonalBestsDialogProps {
  swimmerId: string;
  swimmerName: string;
  swimmer: Swimmer;
  allSwimmers: Swimmer[];
  personalBests?: PersonalBest[];
  onSavePersonalBests?: (swimmerId: string, personalBests: PersonalBest[], history: PersonalBestHistory[]) => void;
}

const DISTANCES = [50, 100, 200, 400, 800, 1500];
const STYLES = ["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"] as const;

export function PersonalBestsDialog({ swimmerId, swimmerName, swimmer, allSwimmers, personalBests = [], onSavePersonalBests }: PersonalBestsDialogProps) {
  const [open, setOpen] = useState(false);
  // Asegurarse de que personalBests sea un array
  const validPersonalBests = Array.isArray(personalBests) ? personalBests : [];
  const [bests, setBests] = useState<PersonalBest[]>(validPersonalBests);
  const [history, setHistory] = useState<PersonalBestHistory[]>([]);
  const [newBest, setNewBest] = useState<Partial<PersonalBest>>({
    distance: 50,
    style: "Libre",
    time: "",
    date: new Date().toISOString().split('T')[0],
    location: ""
  });

  // Sincronizar el estado local con las props cuando cambian o cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      const validBests = Array.isArray(personalBests) ? personalBests : [];
      setBests(validBests);
    }
  }, [open, personalBests]);

  // Contar récords del equipo
  const bestsArray = Array.isArray(bests) ? bests : [];
  const teamRecordsCount = bestsArray.filter(pb => 
    isTeamRecord(swimmer, pb, allSwimmers)
  ).length;

  // Función para convertir tiempo a segundos
  const timeToSeconds = (time: string): number => {
    const parts = time.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return parseFloat(time);
  };

  const handleAddBest = () => {
    if (newBest.time && newBest.distance && newBest.style && newBest.date) {
      const best: PersonalBest = {
        distance: newBest.distance,
        style: newBest.style,
        time: newBest.time,
        date: newBest.date,
        location: newBest.location || undefined
      };

      // Verificar si ya existe una marca para esta distancia/estilo
      const existingIndex = bests.findIndex(
        b => b.distance === best.distance && b.style === best.style
      );

      let isPersonalBest = false;
      if (existingIndex >= 0) {
        // Ver si esta marca es mejor que la existente
        const existingTime = timeToSeconds(bests[existingIndex].time);
        const newTime = timeToSeconds(best.time);
        isPersonalBest = newTime < existingTime;

        // Actualizar marca existente si es mejor
        if (isPersonalBest) {
          const updatedBests = [...bests];
          updatedBests[existingIndex] = best;
          setBests(updatedBests);
        }
      } else {
        // Es la primera marca para esta distancia/estilo
        isPersonalBest = true;
        setBests([...bests, best]);
      }

      // Agregar al historial (siempre agregar cada marca)
      // Generar ID único combinando timestamp, random y distancia/estilo
      const uniqueId = `${swimmerId}-${best.distance}-${best.style}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const historyEntry: PersonalBestHistory = {
        id: uniqueId,
        distance: best.distance,
        style: best.style,
        time: best.time,
        timeInSeconds: timeToSeconds(best.time),
        date: best.date,
        location: best.location,
        isPersonalBest: isPersonalBest
      };

      setHistory([...history, historyEntry]);

      // Resetear formulario
      setNewBest({
        distance: 50,
        style: "Libre",
        time: "",
        date: new Date().toISOString().split('T')[0],
        location: ""
      });
    }
  };

  const handleDeleteBest = (index: number) => {
    setBests(bests.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("💾 Guardando marcas personales:", bests);
    console.log("🏊 Nadador ID:", swimmerId);
    onSavePersonalBests && onSavePersonalBests(swimmerId, bests, history);
    setOpen(false);
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case "Libre": return "bg-blue-100 text-blue-800";
      case "Espalda": return "bg-purple-100 text-purple-800";
      case "Pecho": return "bg-green-100 text-green-800";
      case "Mariposa": return "bg-orange-100 text-orange-800";
      case "Combinado": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Agrupar marcas por distancia
  const groupedBests = bestsArray.reduce((acc, best) => {
    if (!acc[best.distance]) {
      acc[best.distance] = [];
    }
    acc[best.distance].push(best);
    return acc;
  }, {} as Record<number, PersonalBest[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Mejores Marcas</span>
          <span className="sm:hidden">Marcas</span>
          {bests.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">{bests.length}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            <span className="truncate">Mejores Marcas - {swimmerName}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Gestiona las mejores marcas en diferentes distancias y estilos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Resumen de Récords del Equipo */}
          {teamRecordsCount > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-bold text-yellow-800">
                    ¡{teamRecordsCount} Récord{teamRecordsCount > 1 ? 's' : ''} del Equipo!
                  </p>
                  <p className="text-sm text-yellow-700">
                    {swimmerName} ostenta {teamRecordsCount} marca{teamRecordsCount > 1 ? 's' : ''} récord en su categoría
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario para agregar nueva marca */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Agregar/Actualizar Marca
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Distancia</Label>
                <Select
                  value={newBest.distance?.toString()}
                  onValueChange={(value) => setNewBest({ ...newBest, distance: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCES.map(dist => (
                      <SelectItem key={dist} value={dist.toString()}>
                        {dist}m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Estilo</Label>
                <Select
                  value={newBest.style}
                  onValueChange={(value: any) => setNewBest({ ...newBest, style: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map(style => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tiempo (MM:SS.SS)</Label>
                <Input
                  type="text"
                  placeholder="01:23.45"
                  value={newBest.time}
                  onChange={(e) => setNewBest({ ...newBest, time: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Fecha</Label>
                <Input
                  type="date"
                  value={newBest.date}
                  onChange={(e) => setNewBest({ ...newBest, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Lugar (opcional)</Label>
                <Input
                  type="text"
                  placeholder="Piscina Olímpica..."
                  value={newBest.location}
                  onChange={(e) => setNewBest({ ...newBest, location: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleAddBest} className="mt-3 w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Marca
            </Button>
          </div>

          {/* Lista de marcas registradas */}
          <div>
            <h3 className="font-semibold mb-3">Marcas Registradas ({bests.length})</h3>
            {bests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay marcas registradas aún
              </p>
            ) : (
              <div className="space-y-4">
                {DISTANCES.map(distance => {
                  const distanceBests = groupedBests[distance];
                  if (!distanceBests || distanceBests.length === 0) return null;

                  return (
                    <div key={distance} className="border rounded-lg p-3">
                      <h4 className="font-semibold mb-2 text-sm text-gray-700">
                        {distance} metros
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {distanceBests.map((best, idx) => {
                          const globalIndex = bests.indexOf(best);
                          const isRecord = isTeamRecord(swimmer, best, allSwimmers);
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between border rounded p-2 hover:bg-gray-50 ${
                                isRecord 
                                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 border-2' 
                                  : 'bg-white'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getStyleColor(best.style)} variant="secondary">
                                    {best.style}
                                  </Badge>
                                  <span className="font-bold text-lg">{best.time}</span>
                                  {isRecord && (
                                    <Badge className="bg-yellow-500 text-white gap-1">
                                      <Crown className="w-3 h-3" />
                                      Récord
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {new Date(best.date).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                  {best.location && ` • ${best.location}`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBest(globalIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar Marcas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}