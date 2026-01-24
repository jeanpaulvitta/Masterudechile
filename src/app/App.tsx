// Main application component with authentication
import * as api from "./services/api";
import { syncWorkoutsFromLocal } from "./handlers/syncWorkouts";
import { isTeamRecord } from "./utils/recordsUtils";
import { calculateAge, calculateMasterCategory } from "./utils/swimmerUtils";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Users, Calendar, Trophy, Medal, Flag, UserPlus, Filter, Dumbbell, Crown, ClipboardList, Target, TrendingUp, CalendarDays, FileDown, Award, Clipboard, Shield, Waves, Settings, ImageIcon, Activity } from "lucide-react";
import { SwimmerDetailsDialog } from "./components/SwimmerDetailsDialog";
import { AddSwimmerDialog } from "./components/AddSwimmerDialog";
import { MesocicloCalendar } from "./components/MesocicloCalendar";
import { AttendanceTracker } from "./components/AttendanceTracker";
import { TeamRecordsBoard } from "./components/TeamRecordsBoard";
import { StatsAnalyticsDashboard } from "./components/StatsAnalyticsDashboard";
import { MesocicloDialog } from "./components/MesocicloDialog";
import { TrainingVolumeCharts } from "./components/TrainingVolumeCharts";
import { TrainingStats } from "./components/TrainingStats";
import { CompetitionManager } from "./components/CompetitionManager";
import { SwimmersStats } from "./components/SwimmersStats";
import { AttendanceManager } from "./components/AttendanceManager";
import { AchievementsBoard } from "./components/AchievementsBoard";
import { IntegratedCalendar } from "./components/IntegratedCalendar";
import { SwimmerListItem } from "./components/SwimmerListItem";
import { CompetitionResults } from "./components/CompetitionResults";
import { UserMenu } from "./components/UserMenu";
import { UnifiedCalendarManager } from "./components/UnifiedCalendarManager";
import { HolidayManager } from "./components/HolidayManager";
import { TrashManager } from "./components/TrashManager";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TestControlManager } from "./components/TestControlManager";
import { UserManager } from "./components/UserManager";
import { LogoConfig } from "./components/LogoConfig";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { PWAGenerator } from "./components/PWAGenerator";
import { Toaster } from "./components/ui/sonner";
import type { Swimmer, Competition, SwimmerCompetition, PersonalBest, PersonalBestHistory, AttendanceRecord, SwimmerGoal } from "./data/swimmers";
import type { Workout } from "./data/workouts";
import type { Challenge } from "./data/challenges";
import type { Holiday } from "./data/holidays";
import type { TestControl, TestResult } from "./data/testControl";
import { workouts as defaultWorkouts } from "./data/workouts";
import { challenges as defaultChallenges } from "./data/challenges";
import { generateAllSwimmersPDF } from "./utils/pdfGenerator";
import { syncFebruaryWorkouts } from "./handlers/syncFebruaryWorkouts";
import { cleanFebruaryWorkouts } from "./handlers/cleanFebruaryWorkouts";

// Función auxiliar para convertir tiempo MM:SS.SS a segundos
function timeToSeconds(time: string): number {
  const parts = time.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(time);
}

function MainApp() {
  const { user } = useAuth(); // Obtener usuario autenticado
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [swimmerCompetitions, setSwimmerCompetitions] = useState<SwimmerCompetition[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [testControls, setTestControls] = useState<TestControl[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("entrenamientos");
  const [selectedSwimmer, setSelectedSwimmer] = useState<Swimmer | null>(null);
  const [swimmerDialogOpen, setSwimmerDialogOpen] = useState(false);
  
  // Estados para filtros de nadadores
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Obtener el nadador actual si el usuario es un nadador
  const currentSwimmer = user?.swimmerId 
    ? swimmers.find(s => s.id === user.swimmerId) 
    : null;

  // Cargar datos desde el servidor al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos con manejo de errores individual
      const results = await Promise.allSettled([
        api.fetchSwimmers(),
        api.fetchCompetitions(),
        api.fetchSwimmerCompetitions(),
        api.fetchWorkouts(),
        api.fetchChallenges(),
        api.fetchHolidays(),
        api.fetchTestControls(),
        api.fetchTestResults(),
      ]);

      // Extraer datos exitosos o usar arrays vacíos en caso de error
      const swimmersData = results[0].status === 'fulfilled' ? results[0].value : [];
      const competitionsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const participationsData = results[2].status === 'fulfilled' ? results[2].value : [];
      const workoutsData = results[3].status === 'fulfilled' ? results[3].value : [];
      const challengesData = results[4].status === 'fulfilled' ? results[4].value : [];
      const holidaysData = results[5].status === 'fulfilled' ? results[5].value : [];
      const testControlsData = results[6].status === 'fulfilled' ? results[6].value : [];
      const testResultsData = results[7].status === 'fulfilled' ? results[7].value : [];

      // Log de errores si los hay (sin detener la carga)
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['swimmers', 'competitions', 'participations', 'workouts', 'challenges', 'holidays', 'test-controls', 'test-results'];
          console.warn(`⚠️ Error loading ${names[index]}:`, result.reason);
        }
      });
      
      setSwimmers(swimmersData);
      setCompetitions(competitionsData);
      setSwimmerCompetitions(participationsData);
      
      // Cargar entrenamientos - usar los que vienen de la BD
      console.log('📊 Entrenamientos cargados desde BD:', workoutsData.length);
      setWorkouts(workoutsData);
      
      // Cargar desafíos - usar los que vienen de la BD
      console.log('📊 Desafíos cargados desde BD:', challengesData.length);
      console.log('📋 Challenge IDs:', challengesData.map(c => ({ id: c.id, week: c.week, name: c.challengeName })));
      setChallenges(challengesData);
      
      // Cargar días feriados
      console.log('📊 Días feriados cargados desde BD:', holidaysData.length);
      setHolidays(holidaysData);
      
      // Cargar controles de prueba
      console.log('📊 Controles de prueba cargados desde BD:', testControlsData.length);
      setTestControls(testControlsData);
      
      // Cargar resultados de prueba
      console.log('📊 Resultados de prueba cargados desde BD:', testResultsData.length);
      setTestResults(testResultsData);
      
      console.log("✅ Datos cargados desde Supabase:", {
        swimmers: swimmersData.length,
        competitions: competitionsData.length,
        participations: participationsData.length,
        workouts: workoutsData.length,
        challenges: challengesData.length,
        holidays: holidaysData.length,
        testControls: testControlsData.length,
        testResults: testResultsData.length,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
      console.error("❌ Error cargando datos:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para gestionar nadadores
  const handleAddSwimmer = async (newSwimmer: Omit<Swimmer, "id">) => {
    try {
      const swimmer = await api.addSwimmer(newSwimmer);
      setSwimmers([...swimmers, swimmer]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar nadador: ${errorMsg}`);
      console.error("❌ Error al agregar nadador:", err);
    }
  };

  const handleEditSwimmer = async (id: string, updatedSwimmer: Omit<Swimmer, "id">) => {
    try {
      const swimmer = await api.updateSwimmer(id, updatedSwimmer);
      setSwimmers(swimmers.map(s => s.id === id ? swimmer : s));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar nadador: ${errorMsg}`);
      console.error("❌ Error al actualizar nadador:", err);
    }
  };

  const handleDeleteSwimmer = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este nadador?")) {
      try {
        await api.deleteSwimmer(id);
        setSwimmers(swimmers.filter(s => s.id !== id));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        alert(`Error al eliminar nadador: ${errorMsg}`);
        console.error("❌ Error al eliminar nadador:", err);
      }
    }
  };

  const handleSavePersonalBests = async (swimmerId: string, personalBests: PersonalBest[], history: PersonalBestHistory[]) => {
    try {
      const swimmer = swimmers.find(s => s.id === swimmerId);
      if (!swimmer) {
        console.error("❌ Nadador no encontrado:", swimmerId);
        return;
      }

      console.log(`🏊 Guardando marcas para nadador: ${swimmer.name} (${swimmerId})`);
      console.log(`📊 Marcas personales a guardar:`, personalBests.length, personalBests);
      console.log(`📈 Historial a agregar:`, history.length, history);

      // Convertir tiempo a segundos para cada entrada del historial
      const processedHistory = history.map(h => ({
        ...h,
        timeInSeconds: h.timeInSeconds || timeToSeconds(h.time)
      }));

      // Agregar nuevas marcas al historial existente
      const existingHistory = swimmer.personalBestsHistory || [];
      const updatedHistory = [...existingHistory, ...processedHistory];

      console.log(`📚 Historial existente:`, existingHistory.length);
      console.log(`📚 Historial actualizado:`, updatedHistory.length);

      const updatedSwimmer = { 
        ...swimmer, 
        personalBests,
        personalBestsHistory: updatedHistory
      };
      
      console.log(`💾 Llamando a api.updateSwimmer con:`, {
        id: swimmerId,
        personalBestsCount: updatedSwimmer.personalBests?.length,
        historyCount: updatedSwimmer.personalBestsHistory?.length
      });
      
      await api.updateSwimmer(swimmerId, updatedSwimmer);
      
      // Actualizar la lista de nadadores
      const updatedSwimmers = swimmers.map(s => s.id === swimmerId ? { ...s, personalBests, personalBestsHistory: updatedHistory } : s);
      setSwimmers(updatedSwimmers);
      
      // Actualizar el nadador seleccionado si es el mismo
      if (selectedSwimmer && selectedSwimmer.id === swimmerId) {
        setSelectedSwimmer({ ...selectedSwimmer, personalBests, personalBestsHistory: updatedHistory });
      }
      
      console.log("✅ Mejores marcas guardadas exitosamente");
      alert("✅ Mejores marcas guardadas exitosamente");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      console.error("❌ Error al guardar mejores marcas:", err);
      alert(`Error al guardar mejores marcas: ${errorMsg}`);
    }
  };

  const handleUpdateGoals = async (swimmerId: string, goals: SwimmerGoal[]) => {
    try {
      const swimmer = swimmers.find(s => s.id === swimmerId);
      if (!swimmer) return;

      const updatedSwimmer = { 
        ...swimmer, 
        goals
      };
      await api.updateSwimmer(swimmerId, updatedSwimmer);
      
      // Actualizar la lista de nadadores
      const updatedSwimmers = swimmers.map(s => s.id === swimmerId ? { ...s, goals } : s);
      setSwimmers(updatedSwimmers);
      
      // Actualizar el nadador seleccionado si es el mismo
      if (selectedSwimmer && selectedSwimmer.id === swimmerId) {
        setSelectedSwimmer({ ...selectedSwimmer, goals });
      }
      
      console.log("✅ Metas actualizadas:", goals);
      alert("✅ Metas actualizadas exitosamente");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar metas: ${errorMsg}`);
      console.error("❌ Error al actualizar metas:", err);
    }
  };

  // Funciones para gestionar competencias
  const handleAddCompetition = async (newCompetition: Omit<Competition, "id">) => {
    try {
      const competition = await api.addCompetition(newCompetition);
      setCompetitions([...competitions, competition]);
      console.log("✅ Competencia agregada:", competition);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar competencia: ${errorMsg}`);
      console.error("❌ Error al agregar competencia:", err);
    }
  };

  const handleEditCompetition = async (id: string, updatedCompetition: Omit<Competition, "id">) => {
    try {
      const competition = await api.updateCompetition(id, updatedCompetition);
      setCompetitions(competitions.map(c => c.id === id ? competition : c));
      console.log("✅ Competencia actualizada:", competition);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar competencia: ${errorMsg}`);
      console.error("❌ Error al actualizar competencia:", err);
    }
  };

  const handleDeleteCompetition = async (id: string) => {
    try {
      await api.deleteCompetition(id);
      setCompetitions(competitions.filter(c => c.id !== id));
      // También eliminar participaciones relacionadas
      setSwimmerCompetitions(swimmerCompetitions.filter(sc => sc.competitionId !== id));
      console.log("✅ Competencia eliminada:", id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al eliminar competencia: ${errorMsg}`);
      console.error("❌ Error al eliminar competencia:", err);
    }
  };

  const handleToggleCompetitionParticipation = async (
    swimmerId: string,
    competitionId: string,
    participates: boolean
  ) => {
    try {
      // Buscar si ya existe una participación
      const existing = swimmerCompetitions.find(
        sc => sc.swimmerId === swimmerId && sc.competitionId === competitionId
      );

      if (existing) {
        // Actualizar participación existente
        const updated = { ...existing, participates };
        await api.updateSwimmerCompetition(existing.id, updated);
        setSwimmerCompetitions(
          swimmerCompetitions.map(sc => sc.id === existing.id ? updated : sc)
        );
      } else {
        // Crear nueva participación
        const newParticipation: Omit<SwimmerCompetition, "id"> = {
          swimmerId,
          competitionId,
          participates,
          events: [],
        };
        const created = await api.addSwimmerCompetition(newParticipation);
        setSwimmerCompetitions([...swimmerCompetitions, created]);
      }

      console.log(`✅ Participación ${participates ? 'marcada' : 'desmarcada'}:`, {
        swimmerId,
        competitionId,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar participación: ${errorMsg}`);
      console.error("❌ Error al actualizar participación:", err);
    }
  };

  // Función para actualizar resultados de competencias
  const handleUpdateCompetitionResults = async (
    competitionId: string,
    events: { event: string; time?: string; position?: number; points?: number }[]
  ) => {
    if (!currentSwimmer) {
      alert("No se pudo identificar tu perfil de nadador");
      return;
    }

    try {
      const result = await api.updateCompetitionResults(
        currentSwimmer.id,
        competitionId,
        events
      );

      // Actualizar estado local con la participación actualizada
      const existingIndex = swimmerCompetitions.findIndex(
        sc => sc.id === result.participation.id
      );

      if (existingIndex !== -1) {
        const updated = [...swimmerCompetitions];
        updated[existingIndex] = result.participation;
        setSwimmerCompetitions(updated);
      } else {
        setSwimmerCompetitions([...swimmerCompetitions, result.participation]);
      }

      // Actualizar el nadador con las marcas personales actualizadas
      const updatedSwimmers = swimmers.map(s => 
        s.id === currentSwimmer.id ? result.swimmer : s
      );
      setSwimmers(updatedSwimmers);

      alert("✅ Resultados guardados exitosamente. Tus marcas personales se han actualizado automáticamente.");
      console.log("✅ Resultados de competencia guardados:", result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al guardar resultados: ${errorMsg}`);
      console.error("❌ Error al guardar resultados de competencia:", err);
    }
  };

  // Funciones para gestionar entrenamientos
  const handleAddWorkout = async (workout: Omit<Workout, "id">) => {
    try {
      const newWorkout = await api.addWorkout(workout);
      setWorkouts([...workouts, newWorkout]);
      console.log("✅ Entrenamiento agregado:", newWorkout);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar entrenamiento: ${errorMsg}`);
      console.error("❌ Error al agregar entrenamiento:", err);
    }
  };

  const handleEditWorkout = async (id: string, workout: Omit<Workout, "id">) => {
    try {
      const updated = await api.updateWorkout(id, workout);
      setWorkouts(workouts.map(w => w.id === id ? updated : w));
      console.log("✅ Entrenamiento actualizado:", updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar entrenamiento: ${errorMsg}`);
      console.error("❌ Error al actualizar entrenamiento:", err);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await api.deleteWorkout(id);
      setWorkouts(workouts.filter(w => w.id !== id));
      console.log("✅ Entrenamiento eliminado:", id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al eliminar entrenamiento: ${errorMsg}`);
      console.error("❌ Error al eliminar entrenamiento:", err);
    }
  };

  const handleSyncFromLocal = () => syncWorkoutsFromLocal(workouts, setWorkouts);

  const handleSyncFebruary = () => syncFebruaryWorkouts(workouts, setWorkouts);

  const handleCleanFebruary = () => cleanFebruaryWorkouts(workouts, setWorkouts);

  // Funciones para gestionar desafíos
  const handleAddChallenge = async (challenge: Omit<Challenge, "id">) => {
    try {
      const newChallenge = await api.addChallenge(challenge);
      setChallenges([...challenges, newChallenge]);
      console.log("✅ Desafío agregado:", newChallenge);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar desafío: ${errorMsg}`);
      console.error("❌ Error al agregar desafío:", err);
    }
  };

  const handleEditChallenge = async (id: string, challenge: Omit<Challenge, "id">) => {
    try {
      const updated = await api.updateChallenge(id, challenge);
      setChallenges(challenges.map(c => c.id === id ? updated : c));
      console.log("✅ Desafío actualizado:", updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar desafío: ${errorMsg}`);
      console.error("❌ Error al actualizar desafío:", err);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      console.log('🗑️ Frontend: Deleting challenge with ID:', id);
      await api.deleteChallenge(id);
      setChallenges(challenges.filter(c => c.id !== id));
      console.log("✅ Desafío eliminado:", id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al eliminar desafío: ${errorMsg}`);
      console.error("❌ Error al eliminar desafío:", err);
    }
  };

  // ==================== HOLIDAYS HANDLERS ====================

  const handleAddHoliday = async (holiday: Omit<Holiday, 'id'>) => {
    try {
      const newHoliday = await api.addHoliday(holiday);
      setHolidays([...holidays, newHoliday]);
      console.log("✅ Día feriado agregado:", newHoliday);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar día feriado: ${errorMsg}`);
      console.error("❌ Error al agregar día feriado:", err);
    }
  };

  const handleEditHoliday = async (id: string, holiday: Omit<Holiday, 'id'>) => {
    try {
      const updatedHoliday = await api.updateHoliday(id, holiday);
      setHolidays(holidays.map(h => h.id === id ? updatedHoliday : h));
      console.log("✅ Día feriado actualizado:", updatedHoliday);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar día feriado: ${errorMsg}`);
      console.error("❌ Error al actualizar día feriado:", err);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await api.deleteHoliday(id);
      setHolidays(holidays.filter(h => h.id !== id));
      console.log("✅ Día feriado eliminado:", id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al eliminar día feriado: ${errorMsg}`);
      console.error("❌ Error al eliminar día feriado:", err);
    }
  };

  // ==================== TEST CONTROL HANDLERS ====================

  const handleAddTestControl = async (testControl: TestControl) => {
    try {
      console.log('✅ App: Test control added from child component:', testControl.id);
      
      // Solo actualizar el estado con el test control ya creado
      setTestControls(prev => [...prev, testControl]);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar test control: ${errorMsg}`);
      console.error("❌ Error al agregar test control:", err);
      
      // En caso de error, recargar para sincronizar
      try {
        const fresh = await api.fetchTestControls();
        setTestControls(fresh);
      } catch (reloadErr) {
        console.error("❌ Error recargando después de fallo:", reloadErr);
      }
    }
  };

  const handleEditTestControl = async (testControl: TestControl) => {
    try {
      console.log('✅ App: Test control updated from child component:', testControl.id);
      
      // Solo actualizar el estado con el test control ya actualizado
      setTestControls(testControls.map(tc => tc.id === testControl.id ? testControl : tc));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar test control: ${errorMsg}`);
      console.error("❌ Error al actualizar test control:", err);
      
      // En caso de error, recargar para sincronizar
      try {
        const fresh = await api.fetchTestControls();
        setTestControls(fresh);
      } catch (reloadErr) {
        console.error('❌ Error recargando:', reloadErr);
      }
    }
  };

  const handleDeleteTestControl = async (id: string) => {
    try {
      // Eliminar directamente del servidor
      await api.deleteTestControl(id);
      
      // Actualizar el estado local inmediatamente
      setTestControls(prev => prev.filter(tc => tc.id !== id));
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      
      // Si hay un error 404, significa que ya fue eliminado - actualizar estado silenciosamente sin log
      if (errorMsg.toLowerCase().includes('404') || errorMsg.toLowerCase().includes('not found')) {
        setTestControls(prev => prev.filter(tc => tc.id !== id));
        return; // Salir sin mostrar alerta ni ningún mensaje
      }
      
      // Para otros errores, mostrar log de error, alerta e intentar sincronizar
      console.error('❌ Error al eliminar test control:', errorMsg);
      alert(`❌ Error al eliminar test control: ${errorMsg}`);
      
      try {
        const fresh = await api.fetchTestControls();
        setTestControls(fresh);
      } catch (reloadErr) {
        console.error('❌ Error recargando:', reloadErr);
      }
    }
  };

  const handleAddTestResult = async (testResult: Omit<TestResult, 'id'>) => {
    try {
      const newTestResult = await api.addTestResult(testResult);
      setTestResults([...testResults, newTestResult]);
      console.log("✅ Resultado de test agregado:", newTestResult);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al agregar resultado de test: ${errorMsg}`);
      console.error("❌ Error al agregar resultado de test:", err);
    }
  };

  const handleEditTestResult = async (id: string, testResult: Omit<TestResult, 'id'>) => {
    try {
      const updated = await api.updateTestResult(id, testResult);
      setTestResults(testResults.map(tr => tr.id === id ? updated : tr));
      console.log("✅ Resultado de test actualizado:", updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al actualizar resultado de test: ${errorMsg}`);
      console.error("❌ Error al actualizar resultado de test:", err);
    }
  };

  const handleDeleteTestResult = async (id: string) => {
    try {
      await api.deleteTestResult(id);
      setTestResults(testResults.filter(tr => tr.id !== id));
      console.log("✅ Resultado de test eliminado:", id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al eliminar resultado de test: ${errorMsg}`);
      console.error("❌ Error al eliminar resultado de test:", err);
    }
  };

  // Función de sincronización para test controls y results
  const handleSyncTestData = async () => {
    try {
      console.log("🔄 Sincronizando datos de test controls...");
      const [freshTestControls, freshTestResults] = await Promise.all([
        api.fetchTestControls(),
        api.fetchTestResults()
      ]);
      setTestControls(freshTestControls);
      setTestResults(freshTestResults);
      console.log("✅ Datos sincronizados:", {
        testControls: freshTestControls.length,
        testResults: freshTestResults.length
      });
    } catch (err) {
      console.error("❌ Error sincronizando datos:", err);
      throw err;
    }
  };

  // Combinar entrenamientos y desafíos en una sola lista
  const allSessions = [
    // Filtrar entrenamientos de sábado (solo quedan Lunes, Miércoles, Viernes)
    ...workouts
      .filter(w => w.day !== "Sábado")
      .map((w, idx) => ({ 
        ...w, 
        type: 'workout' as const,
        // Si week no existe, calcularlo basado en el índice (3 entrenamientos por semana)
        week: w.week || Math.floor(idx / 3) + 1
      })),
    ...challenges.map((c, idx) => ({ 
      ...c,
      type: 'challenge' as const,
      // Si week no existe, calcularlo basado en el índice (1 desafío por semana)
      week: c.week || idx + 1
    }))
  ];

  // Función para convertir texto de fecha a formato ISO
  const parseDateToISO = (dateText: string, week: number): string => {
    // Mapa de meses en español a números
    const monthMap: { [key: string]: number } = {
      'enero': 0,
      'febrero': 1,
      'marzo': 2,
      'abril': 3,
      'mayo': 4,
      'junio': 5,
      'julio': 6,
      'agosto': 7,
      'septiembre': 8,
      'octubre': 9,
      'noviembre': 10,
      'diciembre': 11
    };

    // Extraer día y mes del texto (formato: "2 de marzo")
    const regex = /(\d+)\s+de\s+(\w+)/i;
    const match = dateText.match(regex);
    
    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase();
      const month = monthMap[monthName];
      
      if (month !== undefined) {
        // Crear fecha con año 2026
        const date = new Date(2026, month, day);
        return date.toISOString().split('T')[0];
      }
    }
    
    // Fallback: usar cálculo basado en semana si no se puede parsear
    const baseDate = new Date(2026, 2, 2); // 2 de marzo de 2026
    let daysToAdd = (week - 1) * 7;
    
    // Agregar días según el día de la semana
    if (dateText.includes("Miércoles") || dateText.includes("miércoles")) {
      daysToAdd += 2;
    } else if (dateText.includes("Viernes") || dateText.includes("viernes")) {
      daysToAdd += 4;
    } else if (dateText.includes("Sábado") || dateText.includes("sábado")) {
      daysToAdd += 5;
    }
    
    const resultDate = new Date(baseDate);
    resultDate.setDate(resultDate.getDate() + daysToAdd);
    
    return resultDate.toISOString().split('T')[0];
  };

  // Generar fechas ISO para todas las sesiones
  const allSessionsWithDates = allSessions.map((session, idx) => ({
    ...session,
    dateISO: parseDateToISO(session.date, session.week)
  }));

  // Debug: Verificar que tenemos sesiones
  console.log("📅 Sesiones para calendario:", {
    totalSessions: allSessionsWithDates.length,
    workouts: workouts.length,
    challenges: challenges.length,
    sample: allSessionsWithDates.slice(0, 3)
  });

  // Función para convertir registros de AttendanceManager a formato SwimmerCard
  const convertAttendanceRecords = (swimmerId: string) => {
    // Por ahora retornamos un array vacío ya que AttendanceManager maneja su propio estado
    // Esto se puede mejorar en el futuro para compartir datos entre componentes
    return [];
  };

  // Función para filtrar nadadores
  const getFilteredSwimmers = () => {
    return swimmers.filter((swimmer) => {
      // Filtro por género
      if (filterGender !== "all" && swimmer.gender !== filterGender) {
        return false;
      }
      
      // Filtro por categoría
      if (filterCategory !== "all") {
        const age = calculateAge(swimmer.dateOfBirth);
        const category = calculateMasterCategory(age);
        if (category !== filterCategory) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Obtener todas las categorías únicas de los nadadores
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    swimmers.forEach((swimmer) => {
      const age = calculateAge(swimmer.dateOfBirth);
      const category = calculateMasterCategory(age);
      categories.add(category);
    });
    return Array.from(categories).sort();
  };

  const filteredSwimmers = getFilteredSwimmers();
  const uniqueCategories = getUniqueCategories();

  // Agrupar sesiones por semana
  const groupSessionsByWeek = () => {
    const grouped: { [week: number]: typeof allSessions } = {};
    allSessions.forEach((session) => {
      if (!grouped[session.week]) {
        grouped[session.week] = [];
      }
      grouped[session.week].push(session);
    });
    return grouped;
  };

  const sessionsByWeek = groupSessionsByWeek();

  // Calcular estadísticas
  const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
  const challengeDistance = challenges.reduce((sum, c) => sum + c.distance, 0);
  const totalWorkouts = workouts.length;
  const totalChallenges = challenges.length;
  const avgDistance = Math.round(totalDistance / totalWorkouts);

  const mesocicloStats = [
    {
      name: "Mantenimiento",
      weeks: 4,
      description: "Periodo de acondicionamiento previo al inicio de temporada",
      icon: Activity,
      color: "text-green-600",
    },
    {
      name: "Base",
      weeks: 5,
      description: "Construcción de resistencia aeróbica",
      icon: Target,
      color: "text-blue-600",
    },
    {
      name: "Desarrollo",
      weeks: 5,
      description: "Aumento de intensidad y velocidad",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      name: "Pre-competitivo",
      weeks: 5,
      description: "Trabajo específico de competencia",
      icon: CalendarDays,
      color: "text-orange-600",
    },
    {
      name: "Competitivo",
      weeks: 5,
      description: "Puesta a punto y campeonato",
      icon: Trophy,
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6 mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <LogoConfig />
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight">Natación Master UCH</h1>
                <p className="text-blue-200 text-sm sm:text-lg">Universidad de Chile</p>
              </div>
            </div>
            <UserMenu />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/20">
              <p className="text-xs sm:text-sm text-blue-200"> 1er Semestre 2026</p>
              <p className="font-semibold text-xs sm:text-base">2 Mar - 20 Jul</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/20">
              <p className="text-xs sm:text-sm text-blue-200">Entrenamientos</p>
              <p className="font-semibold text-xs sm:text-base">{totalWorkouts} sesiones</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/20">
              <p className="text-xs sm:text-sm text-blue-200">Desafíos</p>
              <p className="font-semibold text-xs sm:text-base">{totalChallenges} desafíos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 border border-white/20">
              <p className="text-xs sm:text-sm text-blue-200">Distancia Total</p>
              <p className="font-semibold text-xs sm:text-base">{((totalDistance + challengeDistance) / 1000).toFixed(1)} km</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* NAVEGACIÓN PRINCIPAL POR SECCIONES */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className={`grid w-full ${user?.role === "admin" ? "grid-cols-4 sm:grid-cols-10" : "grid-cols-4 sm:grid-cols-8"} mb-4 sm:mb-8 h-auto gap-1`}>
            <TabsTrigger value="entrenamientos" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline">Entrenamientos</span>
              <span className="lg:hidden">Entrenos</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="nadadores" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nadadores</span>
            </TabsTrigger>
            <TabsTrigger value="competencias" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline">Competencias</span>
              <span className="lg:hidden">Compet.</span>
            </TabsTrigger>
            <TabsTrigger value="test-control" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Clipboard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline">Test Control</span>
              <span className="lg:hidden">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Récords</span>
            </TabsTrigger>
            <TabsTrigger value="logros" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Logros</span>
            </TabsTrigger>
            <TabsTrigger value="asistencia" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Asistencia</span>
            </TabsTrigger>
            {/* Pestaña de Usuarios - Solo para Administradores */}
            {user?.role === "admin" && (
              <>
                <TabsTrigger value="usuarios" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Usuarios</span>
                </TabsTrigger>
                <TabsTrigger value="pwa" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>PWA</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* SECCIÓN 1: ENTRENAMIENTOS Y COMPETENCIAS */}
          <TabsContent value="entrenamientos" className="space-y-8">
            {/* Mesociclos Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Estructura de la Temporada</h2>
              <p className="text-gray-600 mb-6">Haz clic en cada mesociclo para ver las semanas y entrenamientos detallados</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mesocicloStats.map((mesociclo) => (
                  <MesocicloDialog
                    key={mesociclo.name}
                    mesociclo={mesociclo}
                    sessions={allSessions}
                  />
                ))}
              </div>
            </div>

            {/* Gestión de Entrenamientos y Desafíos (solo para admins/coaches) */}
            {(user?.role === "admin" || user?.role === "coach") && (
              <div className="space-y-4">
                {/* Calendario Unificado de Entrenamientos y Desafíos */}
                <UnifiedCalendarManager
                  workouts={workouts}
                  challenges={challenges}
                  onAddWorkout={handleAddWorkout}
                  onEditWorkout={handleEditWorkout}
                  onDeleteWorkout={handleDeleteWorkout}
                  onAddChallenge={handleAddChallenge}
                  onEditChallenge={handleEditChallenge}
                  onDeleteChallenge={handleDeleteChallenge}
                  onSyncFromLocal={handleSyncFromLocal}
                />

                {/* Gestión de Días Feriados */}
                <HolidayManager
                  holidays={holidays}
                  onAddHoliday={handleAddHoliday}
                  onEditHoliday={handleEditHoliday}
                  onDeleteHoliday={handleDeleteHoliday}
                />

                {/* Papelera de Reciclaje */}
                <TrashManager />
              </div>
            )}

            {/* Estadísticas de Entrenamiento */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Análisis de Volumen de Entrenamiento</h2>
              <TrainingVolumeCharts sessions={allSessions} />
            </div>

            {/* Estadísticas de Entrenamiento */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Estadísticas de Entrenamiento</h2>
              <TrainingStats sessions={allSessions} />
            </div>

            {/* Objetivo del campeonato */}
            <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Trophy className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Campeonato Nacional Master 2026
                    </h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Fecha:</strong> Semana del 20 de julio de 2026
                    </p>
                    <p className="text-gray-700">
                      Después de 20 semanas de preparación sistemática, estaremos listos
                      para competir al más alto nivel. La progresión desde 1500m hasta
                      2500m y la periodización en mesociclos garantiza una puesta a punto
                      óptima.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 1.5: CALENDARIO INTEGRADO */}
          <TabsContent value="calendario" className="space-y-8">
            <IntegratedCalendar
              sessions={allSessionsWithDates.map((s, idx) => ({
                id: `session_${s.week}_${idx}`,
                week: s.week,
                date: s.dateISO,
                mesociclo: s.mesociclo,
                distance: s.distance,
                type: s.type,
                description: s.description
              }))}
              competitions={competitions}
              swimmers={swimmers}
              swimmerCompetitions={swimmerCompetitions}
              attendanceRecords={attendanceRecords}
              currentUser={currentSwimmer}
              holidays={holidays}
            />
          </TabsContent>

          {/* SECCIÓN 2: NADADORES */}
          <TabsContent value="nadadores" className="space-y-4 sm:space-y-8">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <h2 className="text-xl sm:text-3xl font-bold">Nadadores</h2>
              </div>
              {(user?.role === "admin" || user?.role === "coach") && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Preparar datos para el PDF
                      const attendanceRecordsBySwimmer = new Map();
                      const teamRecordsBySwimmer = new Map();
                      
                      swimmers.forEach((swimmer) => {
                        // Por ahora, registros vacíos - se pueden llenar con datos reales
                        attendanceRecordsBySwimmer.set(swimmer.id, []);
                        
                        // Contar récords del equipo
                        const personalBestsArray = Array.isArray(swimmer.personalBests) 
                          ? swimmer.personalBests 
                          : [];
                        const recordsCount = personalBestsArray.filter(pb => 
                          isTeamRecord(swimmer, pb, swimmers)
                        ).length || 0;
                        teamRecordsBySwimmer.set(swimmer.id, recordsCount);
                      });
                      
                      generateAllSwimmersPDF(swimmers, attendanceRecordsBySwimmer, teamRecordsBySwimmer);
                    }}
                    disabled={swimmers.length === 0}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    
                  </Button>
                  <AddSwimmerDialog onAddSwimmer={handleAddSwimmer} />
                </div>
              )}
            </div>

            {/* Estadísticas Generales */}
            <SwimmersStats swimmers={swimmers} />

            {/* Tabs por horario */}
            <div className="mt-8">
              <Tabs defaultValue="all">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all">Todos los Nadadores</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  {/* Filtros */}
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">Filtros</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Filtro por Género */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Género</label>
                          <Select value={filterGender} onValueChange={setFilterGender}>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos los géneros" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Filtro por Categoría */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Categoría Master</label>
                          <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Todas las categorías" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas</SelectItem>
                              {uniqueCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Botón para limpiar filtros */}
                        <div className="space-y-2 flex items-end">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setFilterGender("all");
                              setFilterCategory("all");
                            }}
                            className="w-full"
                          >
                            Limpiar Filtros
                          </Button>
                        </div>
                      </div>
                      
                      {/* Contador de resultados */}
                      <div className="mt-4 text-sm text-gray-600">
                        Mostrando <span className="font-semibold text-blue-600">{filteredSwimmers.length}</span> de {swimmers.length} nadadores
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de nadadores */}
                  {filteredSwimmers.length === 0 ? (
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                      <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          {swimmers.length === 0 
                            ? "No hay nadadores registrados"
                            : "No hay nadadores que coincidan con los filtros"}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {swimmers.length === 0
                            ? "Comienza agregando nadadores al equipo usando el botón \"Agregar Nadador\" arriba."
                            : "Intenta ajustar los filtros para ver más resultados."}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {filteredSwimmers.map((swimmer) => (
                        <SwimmerListItem
                          key={swimmer.id}
                          swimmer={swimmer}
                          allSwimmers={swimmers}
                          onClick={() => {
                            setSelectedSwimmer(swimmer);
                            setSwimmerDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* SECCIÓN 3: COMPETENCIAS */}
          <TabsContent value="competencias" className="space-y-8">
            {/* Gestión de Competencias - visible para todos */}
            <div>
              <CompetitionManager
                competitions={competitions}
                onAddCompetition={handleAddCompetition}
                onEditCompetition={handleEditCompetition}
                onDeleteCompetition={handleDeleteCompetition}
                weeks={20}
              />
            </div>

            {/* Mis Resultados - solo para nadadores con perfil vinculado */}
            {currentSwimmer && (
              <div className="border-t-4 border-blue-200 pt-8">
                <CompetitionResults
                  swimmer={currentSwimmer}
                  competitions={competitions}
                  swimmerCompetitions={swimmerCompetitions}
                  onUpdateResults={handleUpdateCompetitionResults}
                />
              </div>
            )}
          </TabsContent>

          {/* SECCIÓN 3.5: TEST CONTROL */}
          <TabsContent value="test-control" className="space-y-8">
            <TestControlManager
              testControls={testControls}
              testResults={testResults}
              swimmers={swimmers}
              onTestControlAdded={handleAddTestControl}
              onTestControlUpdated={handleEditTestControl}
              onTestControlDeleted={handleDeleteTestControl}
              onTestResultAdded={handleAddTestResult}
              onTestResultUpdated={handleEditTestResult}
              onTestResultDeleted={handleDeleteTestResult}
              onSyncData={handleSyncTestData}
              userRole={user?.role}
            />
          </TabsContent>

          {/* SECCIÓN 4: RÉCORDS */}
          <TabsContent value="records" className="space-y-8">
            <TeamRecordsBoard swimmers={swimmers} />
          </TabsContent>

          {/* SECCIÓN 5: LOGROS */}
          <TabsContent value="logros" className="space-y-8">
            <AchievementsBoard
              swimmers={swimmers}
              attendanceRecords={attendanceRecords}
              competitions={competitions}
              selectedSwimmerId={currentSwimmer?.id}
            />
          </TabsContent>

          {/* SECCIÓN 6: ASISTENCIA */}
          <TabsContent value="asistencia" className="space-y-8">
            <AttendanceManager 
              swimmers={swimmers} 
              sessions={allSessions.map((s, idx) => ({
                id: `session_${s.week}_${idx}`,
                week: s.week,
                date: s.date,
                mesociclo: s.mesociclo,
                distance: s.distance,
                type: s.type
              }))}
            />
          </TabsContent>

          {/* SECCIÓN 7: USUARIOS */}
          <TabsContent value="usuarios" className="space-y-8">
            <UserManager swimmers={swimmers} />
          </TabsContent>

          {/* SECCIÓN 8: GENERADOR PWA */}
          <TabsContent value="pwa" className="space-y-8">
            <PWAGenerator />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-200">
            Equipo de Natación Master - Universidad de Chile
          </p>
          <p className="text-sm text-blue-300 mt-2">
            Planificación Temporada 2026 | 3 entrenamientos semanales | Lunes, Miércoles, Viernes + Sábados de Desafíos
          </p>
        </div>
      </footer>

      {/* Diálogo de detalles del nadador */}
      <SwimmerDetailsDialog
        swimmer={selectedSwimmer}
        open={swimmerDialogOpen}
        onOpenChange={setSwimmerDialogOpen}
        attendanceRecords={selectedSwimmer ? convertAttendanceRecords(selectedSwimmer.id) : []}
        onDelete={handleDeleteSwimmer}
        onEdit={handleEditSwimmer}
        onSavePersonalBests={handleSavePersonalBests}
        swimmerCompetitions={swimmerCompetitions}
        competitions={competitions}
        allSwimmers={swimmers}
        onToggleCompetitionParticipation={handleToggleCompetitionParticipation}
        onUpdateCompetitionResults={handleUpdateCompetitionResults}
        onUpdateGoals={handleUpdateGoals}
      />
    </div>
  );
}

export default function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <AuthProvider>
      <div>
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
        <PWAInstallPrompt />
        <Toaster />
      </div>
    </AuthProvider>
  );
}