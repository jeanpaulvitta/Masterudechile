import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Edit, Trash2, Trophy } from "lucide-react";
import type { Challenge } from "../data/challenges";
import { useAuth } from "../contexts/AuthContext";

interface ChallengeManagerProps {
  challenges: Challenge[];
  onAddChallenge: (challenge: Omit<Challenge, "id">) => void;
  onEditChallenge: (id: string, challenge: Omit<Challenge, "id">) => void;
  onDeleteChallenge: (id: string) => void;
}

export function ChallengeManager({ challenges, onAddChallenge, onEditChallenge, onDeleteChallenge }: ChallengeManagerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "coach";
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState<Omit<Challenge, "id">>({
    week: 1,
    date: "",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2000,
    duration: 60,
    challengeName: "",
    description: "",
    rules: [""],
    prizes: "",
    intensity: "Media",
  });

  const handleSubmit = () => {
    if (editingChallenge && editingChallenge.id) {
      onEditChallenge(editingChallenge.id, formData);
    } else {
      onAddChallenge(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      week: 1,
      date: "",
      day: "Sábado",
      mesociclo: "Base",
      distance: 2000,
      duration: 60,
      challengeName: "",
      description: "",
      rules: [""],
      prizes: "",
      intensity: "Media",
    });
    setEditingChallenge(null);
  };

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      week: challenge.week,
      date: challenge.date,
      day: challenge.day,
      mesociclo: challenge.mesociclo,
      distance: challenge.distance,
      duration: challenge.duration,
      challengeName: challenge.challengeName,
      description: challenge.description,
      rules: challenge.rules,
      prizes: challenge.prizes,
      intensity: challenge.intensity,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('🗑️ Attempting to delete challenge with ID:', id);
    if (confirm("¿Estás seguro de que deseas eliminar este desafío?")) {
      onDeleteChallenge(id);
    }
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const addRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ""] });
  };

  const removeRule = (index: number) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: newRules });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-600" />
            <CardTitle>Gestionar Desafíos</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Desafío
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChallenge ? "Editar Desafío" : "Nuevo Desafío"}
                </DialogTitle>
                <DialogDescription>
                  {editingChallenge ? "Edita los detalles del desafío." : "Añade un nuevo desafío."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semana</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.week}
                      onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      placeholder="Ej: 7 de marzo"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Día</Label>
                    <Input value="Sábado" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Mesociclo</Label>
                    <Select value={formData.mesociclo} onValueChange={(value) => setFormData({ ...formData, mesociclo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                        <SelectItem value="Pre-competitivo">Pre-competitivo</SelectItem>
                        <SelectItem value="Competitivo">Competitivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nombre del Desafío</Label>
                  <Input
                    placeholder="Ej: Desafío de los 4 Estilos"
                    value={formData.challengeName}
                    onChange={(e) => setFormData({ ...formData, challengeName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Descripción del desafío..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Distancia (m)</Label>
                    <Input
                      type="number"
                      min="1000"
                      step="100"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duración (min)</Label>
                    <Input
                      type="number"
                      min="30"
                      step="5"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intensidad</Label>
                    <Select value={formData.intensity} onValueChange={(value) => setFormData({ ...formData, intensity: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Muy alta">Muy alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reglas</Label>
                  {formData.rules.map((rule, index) => (
                    <div key={`rule-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Regla del desafío..."
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                      />
                      {formData.rules.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRule(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addRule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Regla
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Premios</Label>
                  <Input
                    placeholder="Ej: El equipo ganador elige la música del próximo entrenamiento"
                    value={formData.prizes}
                    onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
                  {editingChallenge ? "Guardar Cambios" : "Crear Desafío"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          Total de desafíos: <span className="font-semibold text-orange-600">{challenges.length}</span>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-semibold">
                  Semana {challenge.week} - {challenge.challengeName}
                </div>
                <div className="text-sm text-gray-600">
                  {challenge.mesociclo} • {challenge.distance}m • {challenge.intensity}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(challenge)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => challenge.id && handleDelete(challenge.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}