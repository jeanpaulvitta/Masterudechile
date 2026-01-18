import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { TrendingUp, BarChart3 } from "lucide-react";
import { ProgressionChart } from "./ProgressionChart";
import type { PersonalBestHistory, Swimmer } from "../data/swimmers";

interface ProgressionDialogProps {
  swimmer: Swimmer;
}

const DISTANCES = [50, 100, 200, 400, 800, 1500];
const STYLES = ["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"] as const;

export function ProgressionDialog({ swimmer }: ProgressionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<number>(100);
  const [selectedStyle, setSelectedStyle] = useState<string>("Libre");

  const history = swimmer.personalBestsHistory || [];

  // Obtener combinaciones únicas de distancia/estilo que tienen datos
  const availableCombinations = new Set<string>();
  history.forEach(h => {
    availableCombinations.add(`${h.distance}-${h.style}`);
  });

  // Filtrar distancias y estilos que tienen datos
  const availableDistances = DISTANCES.filter(d => 
    Array.from(availableCombinations).some(combo => combo.startsWith(`${d}-`))
  );

  const availableStyles = STYLES.filter(s => 
    Array.from(availableCombinations).some(combo => combo.endsWith(`-${s}`))
  );

  // Verificar si la combinación seleccionada tiene datos
  const hasData = availableCombinations.has(`${selectedDistance}-${selectedStyle}`);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Ver Progresión</span>
          <span className="sm:hidden">Progresión</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Progresión de Marcas - {swimmer.name}
          </DialogTitle>
          <DialogDescription>
            Visualiza la evolución de tus marcas personales a lo largo del tiempo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-semibold">No hay datos de progresión</p>
              <p className="text-sm mt-2 text-center">
                Agrega marcas en el diálogo de "Mejores Marcas" para comenzar a ver tu progresión
              </p>
            </div>
          ) : (
            <>
              {/* Selectores de Distancia y Estilo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Distancia</Label>
                  <Select
                    value={selectedDistance.toString()}
                    onValueChange={(value) => setSelectedDistance(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTANCES.map(dist => {
                        const hasDataForDistance = availableDistances.includes(dist);
                        return (
                          <SelectItem 
                            key={dist} 
                            value={dist.toString()}
                            disabled={!hasDataForDistance}
                          >
                            {dist}m {!hasDataForDistance && '(sin datos)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Estilo</Label>
                  <Select
                    value={selectedStyle}
                    onValueChange={setSelectedStyle}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map(style => {
                        const hasDataForStyle = availableStyles.includes(style);
                        return (
                          <SelectItem 
                            key={style} 
                            value={style}
                            disabled={!hasDataForStyle}
                          >
                            {style} {!hasDataForStyle && '(sin datos)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gráfico de Progresión */}
              {hasData ? (
                <ProgressionChart 
                  history={history}
                  distance={selectedDistance}
                  style={selectedStyle}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-lg">No hay datos para {selectedDistance}m {selectedStyle}</p>
                  <p className="text-sm mt-2">Selecciona otra combinación o agrega nuevas marcas</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
