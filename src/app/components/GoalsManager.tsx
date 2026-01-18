import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Trophy,
  AlertCircle,
} from "lucide-react";
import type { Swimmer, SwimmerGoal } from "../data/swimmers";
import {
  calculateAllGoalsProgress,
  getActiveGoals,
  getAchievedGoals,
  getExpiredGoals,
  timeToSeconds,
  secondsToTime,
  suggestGoals,
  type GoalProgress,
} from "../utils/goalsUtils";

interface GoalsManagerProps {
  swimmer: Swimmer;
  onUpdateGoals: (goals: SwimmerGoal[]) => void;
}

const DISTANCES = [50, 100, 200, 400, 800, 1500];
const STYLES = ["Libre", "Espalda", "Pecho", "Mariposa", "Combinado"];

export function GoalsManager({ swimmer, onUpdateGoals }: GoalsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "achieved" | "expired" | "all">("active");

  // Formulario para nueva meta
  const [distance, setDistance] = useState<number>(100);
  const [style, setStyle] = useState<string>("Libre");
  const [targetTime, setTargetTime] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Calcular progreso de todas las metas
  const allProgress = calculateAllGoalsProgress(swimmer);

  // Filtrar metas según el modo de vista
  const displayedProgress = allProgress.filter((progress) => {
    if (viewMode === "active") return !progress.goal.achieved && progress.daysRemaining > 0;
    if (viewMode === "achieved") return progress.goal.achieved;
    if (viewMode === "expired") return !progress.goal.achieved && progress.daysRemaining === 0;
    return true; // all
  });

  // Estadísticas
  const activeGoals = getActiveGoals(swimmer);
  const achievedGoals = getAchievedGoals(swimmer);
  const expiredGoals = getExpiredGoals(swimmer);
  const suggestions = suggestGoals(swimmer);

  const handleAddGoal = () => {
    if (!targetTime || !targetDate) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const newGoal: SwimmerGoal = {
      id: `goal_${Date.now()}`,
      distance,
      style: style as SwimmerGoal["style"],
      targetTime,
      targetTimeInSeconds: timeToSeconds(targetTime),
      targetDate,
      createdAt: new Date().toISOString().split("T")[0],
      achieved: false,
      notes: notes || undefined,
    };

    const updatedGoals = [...(swimmer.goals || []), newGoal];
    onUpdateGoals(updatedGoals);

    // Limpiar formulario
    setTargetTime("");
    setTargetDate("");
    setNotes("");
    setDialogOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta meta?")) return;

    const updatedGoals = (swimmer.goals || []).filter((g) => g.id !== goalId);
    onUpdateGoals(updatedGoals);
  };

  const handleMarkAsAchieved = (goalId: string) => {
    const updatedGoals = (swimmer.goals || []).map((g) =>
      g.id === goalId
        ? { ...g, achieved: true, achievedAt: new Date().toISOString().split("T")[0] }
        : g
    );
    onUpdateGoals(updatedGoals);
  };

  const getStatusColor = (status: GoalProgress["status"]) => {
    switch (status) {
      case "achieved":
        return "text-green-600 bg-green-50 border-green-200";
      case "on-track":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "needs-improvement":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "no-baseline":
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: GoalProgress["status"]) => {
    switch (status) {
      case "achieved":
        return <CheckCircle2 className="w-5 h-5" />;
      case "on-track":
        return <TrendingUp className="w-5 h-5" />;
      case "needs-improvement":
        return <AlertCircle className="w-5 h-5" />;
      case "no-baseline":
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: GoalProgress["status"]) => {
    switch (status) {
      case "achieved":
        return "¡Logrado!";
      case "on-track":
        return "En camino";
      case "needs-improvement":
        return "Requiere esfuerzo";
      case "no-baseline":
        return "Sin marca base";
    }
  };

  const formatTimeImprovement = (seconds: number) => {
    if (seconds === 0) return "0.00s";
    return `${Math.abs(seconds).toFixed(2)}s`;
  };

  const useSuggestion = (suggestion: typeof suggestions[0]) => {
    setDistance(suggestion.distance);
    setStyle(suggestion.style);
    setTargetTime(suggestion.suggestedTarget);
    // Sugerir fecha: 3 meses desde ahora
    const suggestedDate = new Date();
    suggestedDate.setMonth(suggestedDate.getMonth() + 3);
    setTargetDate(suggestedDate.toISOString().split("T")[0]);
    setNotes(`Meta sugerida: Mejorar ${suggestion.improvementPercentage.toFixed(1)}% desde ${suggestion.currentTime}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Metas y Objetivos</h2>
          <p className="text-gray-600">
            Establece tiempos objetivo y sigue tu progreso
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Meta</DialogTitle>
              <DialogDescription>
                Define un tiempo objetivo para una distancia y estilo específico
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Distancia y Estilo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Distancia</Label>
                  <Select
                    value={distance.toString()}
                    onValueChange={(v) => setDistance(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTANCES.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estilo</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tiempo objetivo y fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tiempo Objetivo (MM:SS.SS)</Label>
                  <Input
                    type="text"
                    placeholder="1:15.50"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha Objetivo</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Ej: Para el campeonato nacional"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Sugerencias */}
              {suggestions.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Sugerencias basadas en tus marcas actuales:
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">
                            {suggestion.distance}m {suggestion.style}
                          </p>
                          <p className="text-sm text-gray-600">
                            {suggestion.currentTime} → {suggestion.suggestedTarget} (
                            {suggestion.improvementPercentage.toFixed(1)}% mejora)
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => useSuggestion(suggestion)}
                        >
                          Usar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddGoal}>Crear Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <p className="text-sm text-gray-600">Metas Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{achievedGoals.length}</p>
            <p className="text-sm text-gray-600">Logradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{expiredGoals.length}</p>
            <p className="text-sm text-gray-600">Vencidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">
              {achievedGoals.length > 0
                ? Math.round((achievedGoals.length / (swimmer.goals?.length || 1)) * 100)
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600">Tasa de Éxito</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de vista */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={viewMode === "active" ? "default" : "outline"}
          onClick={() => setViewMode("active")}
        >
          Activas ({activeGoals.length})
        </Button>
        <Button
          variant={viewMode === "achieved" ? "default" : "outline"}
          onClick={() => setViewMode("achieved")}
        >
          Logradas ({achievedGoals.length})
        </Button>
        <Button
          variant={viewMode === "expired" ? "default" : "outline"}
          onClick={() => setViewMode("expired")}
        >
          Vencidas ({expiredGoals.length})
        </Button>
        <Button
          variant={viewMode === "all" ? "default" : "outline"}
          onClick={() => setViewMode("all")}
        >
          Todas ({swimmer.goals?.length || 0})
        </Button>
      </div>

      {/* Lista de metas */}
      <div className="space-y-4">
        {displayedProgress.length === 0 ? (
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="pt-12 pb-12 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay metas en esta categoría
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primera meta para comenzar a seguir tu progreso
              </p>
            </CardContent>
          </Card>
        ) : (
          displayedProgress.map((progress) => (
            <Card
              key={progress.goal.id}
              className={`border-2 ${getStatusColor(progress.status)}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(progress.status)}
                      {progress.goal.distance}m {progress.goal.style}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {progress.goal.notes || "Sin notas"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(progress.status)}>
                    {getStatusText(progress.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Información de tiempos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Actual</p>
                    <p className="font-bold">
                      {progress.currentTime
                        ? secondsToTime(progress.currentTime)
                        : "Sin marca"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Objetivo</p>
                    <p className="font-bold text-blue-600">
                      {progress.goal.targetTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mejora Necesaria</p>
                    <p
                      className={`font-bold ${
                        progress.improvement <= 0 ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {progress.improvement <= 0
                        ? "¡Logrado!"
                        : `-${formatTimeImprovement(progress.improvement)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha Objetivo</p>
                    <p className="font-bold">
                      {new Date(progress.goal.targetDate).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                {progress.status !== "no-baseline" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso hacia la meta</span>
                      <span className="font-semibold">
                        {progress.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={progress.progressPercentage}
                      className="h-3"
                    />
                  </div>
                )}

                {/* Proyección */}
                {progress.projectedDate &&
                  progress.status !== "achieved" &&
                  progress.status !== "no-baseline" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">
                            Proyección de Logro
                          </p>
                          <p className="text-sm text-blue-700">
                            Basado en tu tendencia actual, podrías alcanzar esta
                            meta el{" "}
                            <strong>
                              {new Date(progress.projectedDate).toLocaleDateString(
                                "es-CL"
                              )}
                            </strong>
                          </p>
                          {progress.averageImprovementNeeded > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Necesitas mejorar ~
                              {formatTimeImprovement(
                                progress.averageImprovementNeeded
                              )}{" "}
                              por semana
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Días restantes */}
                {progress.status !== "achieved" && progress.daysRemaining > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {progress.daysRemaining} día
                      {progress.daysRemaining !== 1 ? "s" : ""} restantes
                    </span>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  {!progress.goal.achieved && progress.improvement <= 0 && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleMarkAsAchieved(progress.goal.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Marcar como Lograda
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteGoal(progress.goal.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
