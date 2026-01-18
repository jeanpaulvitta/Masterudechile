import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Trophy } from "lucide-react";
import type { Competition } from "../data/swimmers";

interface EditCompetitionDialogProps {
  competition: Competition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCompetition: (id: string, competition: Omit<Competition, "id">) => void;
}

export function EditCompetitionDialog({
  competition,
  open,
  onOpenChange,
  onEditCompetition,
}: EditCompetitionDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    week: 1,
    startDate: "",
    endDate: "",
    schedule: "",
    cost: "",
    location: "",
    poolType: "50m" as "25m" | "50m",
    type: "Regional" as "Local" | "Regional" | "Nacional" | "Internacional",
    events: [] as string[],
    description: "",
  });
  const [eventInput, setEventInput] = useState("");

  // Cargar datos de la competencia cuando cambia
  useEffect(() => {
    if (competition) {
      setFormData({
        name: competition.name,
        week: competition.week,
        startDate: competition.startDate,
        endDate: competition.endDate || "",
        schedule: competition.schedule || "",
        cost: competition.cost || "",
        location: competition.location,
        poolType: competition.poolType,
        type: competition.type,
        events: competition.events || [],
        description: competition.description || "",
      });
    }
  }, [competition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.location) {
      alert("Por favor completa los campos obligatorios (Nombre, Fecha de inicio, Ubicación)");
      return;
    }

    onEditCompetition(competition.id, formData);
    onOpenChange(false);
  };

  const handleAddEvent = () => {
    if (eventInput.trim()) {
      setFormData({
        ...formData,
        events: [...formData.events, eventInput.trim()],
      });
      setEventInput("");
    }
  };

  const handleRemoveEvent = (index: number) => {
    setFormData({
      ...formData,
      events: formData.events.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Editar Competencia
          </DialogTitle>
          <DialogDescription>
            Actualiza la información de la competencia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Información Básica</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Competencia *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Campeonato Regional Master"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Competencia</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Local" | "Regional" | "Nacional" | "Internacional") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Nacional">Nacional</SelectItem>
                    <SelectItem value="Internacional">Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poolType">Tipo de Piscina</Label>
                <Select
                  value={formData.poolType}
                  onValueChange={(value: "25m" | "50m") =>
                    setFormData({ ...formData, poolType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50m">Piscina 50m</SelectItem>
                    <SelectItem value="25m">Piscina 25m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="week">Semana del Plan</Label>
              <Input
                id="week"
                type="number"
                min="1"
                max="20"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Fechas y Horarios</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Horarios</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="Ej: 09:00 - 18:00"
              />
            </div>
          </div>

          {/* Ubicación e Inscripción */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Ubicación e Inscripción</h3>
            
            <div className="space-y-2">
              <Label htmlFor="location">Lugar *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Centro Acuático Estadio Nacional"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Valor de Inscripción</Label>
              <Input
                id="cost"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="Ej: $15.000"
              />
            </div>
          </div>

          {/* Pruebas Disponibles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Pruebas Disponibles</h3>
            
            <div className="flex gap-2">
              <Input
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                placeholder="Ej: 50m Libre, 100m Espalda"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEvent();
                  }
                }}
              />
              <Button type="button" onClick={handleAddEvent} variant="outline">
                Agregar
              </Button>
            </div>

            {formData.events.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.events.map((event, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {event}
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descripción Adicional */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción Adicional</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Información adicional sobre la competencia..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
