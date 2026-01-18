import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { 
  ClipboardList, 
  Plus, 
  Edit2, 
  Trash2, 
  CalendarDays, 
  Trophy, 
  TrendingDown,
  Timer,
  Users,
  BarChart3,
  FileText,
  FileDown,
  RefreshCw
} from "lucide-react";
import type { TestControl, TestItem, TestResult, styles, commonDistances } from "../data/testControl";
import type { Swimmer } from "../data/swimmers";
import * as api from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { generateTestControlsPDF, generateSwimmerTestProgressPDF, generateAllSwimmersTestProgressPDF } from "../utils/pdfGenerator";

interface TestControlManagerProps {
  testControls: TestControl[];
  testResults: TestResult[];
  swimmers: Swimmer[];
  onTestControlAdded: (testControl: TestControl) => void;
  onTestControlUpdated: (testControl: TestControl) => void;
  onTestControlDeleted: (id: string) => void;
  onTestResultAdded: (testResult: TestResult) => void;
  onTestResultUpdated: (testResult: TestResult) => void;
  onTestResultDeleted: (id: string) => void;
  onSyncData?: () => Promise<void>;
  userRole?: string;
}

const styles = ["Libre/Crol", "Espalda", "Pecho", "Mariposa", "Combinado"];
const commonDistances = [25, 50, 100, 200, 400, 800, 1000, 1500, 2000];
const mesociclos = ["Base", "Desarrollo", "Pre-competitivo", "Competitivo"];

// Plantillas de tests predefinidos
const testTemplates = [
  {
    id: "patada-1000",
    name: "1000m Patada Libre",
    description: "Test de resistencia de patada con tabla",
    testItems: [
      { id: "item_1", distance: 1000, style: "Libre/Crol", order: 0 }
    ]
  },
  {
    id: "7x200-progresivo",
    name: "7x200m Crol Progresivo a 5min",
    description: "Series progresivas de velocidad con salida cada 5 minutos",
    testItems: Array.from({ length: 7 }, (_, i) => ({
      id: `item_${i + 1}`,
      distance: 200,
      style: "Libre/Crol",
      order: i
    }))
  },
  {
    id: "8x400-crol",
    name: "8x400m Crol/20\" pausa",
    description: "Test de resistencia aeróbica con series largas",
    testItems: Array.from({ length: 8 }, (_, i) => ({
      id: `item_${i + 1}`,
      distance: 400,
      style: "Libre/Crol",
      order: i
    }))
  },
  {
    id: "2000-continuo",
    name: "2000m Crol Continuados",
    description: "Test de resistencia aeróbica continua",
    testItems: [
      { id: "item_1", distance: 2000, style: "Libre/Crol", order: 0 }
    ]
  },
  {
    id: "10x200-combinado",
    name: "10x200m Combinado/40\" pausa",
    description: "Test de técnica en los cuatro estilos",
    testItems: Array.from({ length: 10 }, (_, i) => ({
      id: `item_${i + 1}`,
      distance: 200,
      style: "Combinado",
      order: i
    }))
  },
  {
    id: "6x400-combinado",
    name: "6x400m Combinado/40\" pausa",
    description: "Test de resistencia técnica en estilos variados",
    testItems: Array.from({ length: 6 }, (_, i) => ({
      id: `item_${i + 1}`,
      distance: 400,
      style: "Combinado",
      order: i
    }))
  }
];

export function TestControlManager({
  testControls,
  testResults,
  swimmers,
  onTestControlAdded,
  onTestControlUpdated,
  onTestControlDeleted,
  onTestResultAdded,
  onTestResultUpdated,
  onTestResultDeleted,
  onSyncData,
  userRole = "swimmer"
}: TestControlManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestControl | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestControl | null>(null);
  const [selectedSwimmer, setSelectedSwimmer] = useState<Swimmer | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  
  // Form state for test control
  const [testName, setTestName] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testDescription, setTestDescription] = useState("");
  const [testMesociclo, setTestMesociclo] = useState("");
  const [testItems, setTestItems] = useState<TestItem[]>([]);

  // Form state for results
  const [resultSwimmerId, setResultSwimmerId] = useState("");
  const [resultTimes, setResultTimes] = useState<{ [key: string]: string }>({});
  const [resultNotes, setResultNotes] = useState("");

  const canManageTests = userRole === "admin" || userRole === "coach";

  const resetForm = () => {
    setTestName("");
    setTestDate(new Date().toISOString().split('T')[0]);
    setTestDescription("");
    setTestMesociclo("");
    setTestItems([]);
    setEditingTest(null);
  };

  const resetResultsForm = () => {
    setResultSwimmerId("");
    setResultTimes({});
    setResultNotes("");
  };

  const handleAddTestItem = () => {
    const newItem: TestItem = {
      id: `item_${Date.now()}`,
      distance: 100,
      style: "Libre/Crol",
      order: testItems.length
    };
    setTestItems([...testItems, newItem]);
  };

  const handleUpdateTestItem = (index: number, field: keyof TestItem, value: any) => {
    const updated = [...testItems];
    updated[index] = { ...updated[index], [field]: value };
    setTestItems(updated);
  };

  const handleRemoveTestItem = (index: number) => {
    setTestItems(testItems.filter((_, i) => i !== index));
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = testTemplates.find(t => t.id === templateId);
    if (template) {
      setTestName(template.name);
      setTestDescription(template.description);
      // Cargar automáticamente las pruebas predefinidas
      setTestItems(template.testItems.map((item, idx) => ({
        ...item,
        id: `item_${Date.now()}_${idx}`
      })));
    }
  };

  const handleSaveTest = async () => {
    if (!testName || testItems.length === 0) {
      alert("Por favor completa el nombre del test y agrega al menos una prueba");
      return;
    }

    const testData: Omit<TestControl, 'id'> = {
      name: testName,
      date: testDate,
      description: testDescription,
      testItems: testItems.map((item, idx) => ({ ...item, order: idx })),
      mesociclo: testMesociclo || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      if (editingTest) {
        const updated = await api.updateTestControl(editingTest.id, testData);
        onTestControlUpdated(updated);
      } else {
        const created = await api.addTestControl(testData);
        onTestControlAdded(created);
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving test control:", error);
      alert("Error al guardar el test control");
    }
  };

  const handleEditTest = (test: TestControl) => {
    setEditingTest(test);
    setTestName(test.name);
    setTestDate(test.date);
    setTestDescription(test.description || "");
    setTestMesociclo(test.mesociclo || "");
    setTestItems([...test.testItems]);
    setDialogOpen(true);
  };

  const handleSync = async () => {
    if (!onSyncData) return;
    
    setIsSyncing(true);
    try {
      await onSyncData();
      console.log("✅ Datos sincronizados correctamente");
    } catch (error) {
      console.error("❌ Error al sincronizar:", error);
      alert("Error al sincronizar los datos");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTestControl = async (id: string) => {
    try {
      await api.deleteTestControl(id);
      onTestControlDeleted(id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      
      // Si el error es 404 "not found", significa que ya fue eliminado
      // Actualizar el estado local silenciosamente sin ningún mensaje
      if (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('404')) {
        onTestControlDeleted(id);
        return; // No mostrar alerta ni ningún mensaje
      }
      
      // Para otros errores, mostrar log de error y alerta
      console.error("❌ Frontend error deleting test control:", error);
      alert("❌ Error al eliminar test control: " + errorMsg);
    }
  };

  const handleOpenResults = (test: TestControl) => {
    setSelectedTest(test);
    setResultsDialogOpen(true);
    resetResultsForm();
  };

  const handleSaveResults = async () => {
    if (!selectedTest || !resultSwimmerId) {
      alert("Por favor selecciona un nadador");
      return;
    }

    try {
      // Save a result for each test item
      for (const item of selectedTest.testItems) {
        const time = resultTimes[item.id];
        if (time) {
          const resultData: Omit<TestResult, 'id'> = {
            testId: selectedTest.id,
            swimmerId: resultSwimmerId,
            testItemId: item.id,
            time: time,
            date: selectedTest.date,
            notes: resultNotes,
            createdAt: new Date().toISOString()
          };

          const created = await api.addTestResult(resultData);
          onTestResultAdded(created);
        }
      }

      alert("Resultados guardados exitosamente");
      setResultsDialogOpen(false);
      resetResultsForm();
    } catch (error) {
      console.error("Error saving test results:", error);
      alert("Error al guardar los resultados");
    }
  };

  const handleShowProgress = (swimmer: Swimmer) => {
    setSelectedSwimmer(swimmer);
    setProgressDialogOpen(true);
  };

  const getSwimmerResults = (testId: string, swimmerId: string) => {
    return testResults.filter(r => r.testId === testId && r.swimmerId === swimmerId);
  };

  const getTestItem = (testId: string, testItemId: string): TestItem | undefined => {
    const test = testControls.find(t => t.id === testId);
    return test?.testItems.find(item => item.id === testItemId);
  };

  const getProgressData = (swimmer: Swimmer) => {
    if (!swimmer) return [];

    // Group results by distance and style
    const groupedData: { [key: string]: any[] } = {};

    testResults
      .filter(r => r.swimmerId === swimmer.id)
      .forEach(result => {
        const test = testControls.find(t => t.id === result.testId);
        const item = getTestItem(result.testId, result.testItemId);
        
        if (test && item) {
          const key = `${item.distance}m ${item.style}`;
          if (!groupedData[key]) {
            groupedData[key] = [];
          }

          groupedData[key].push({
            date: test.date,
            testName: test.name,
            time: result.time,
            timeInSeconds: timeToSeconds(result.time)
          });
        }
      });

    // Sort each group by date
    Object.keys(groupedData).forEach(key => {
      groupedData[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groupedData;
  };

  const timeToSeconds = (time: string): number => {
    const parts = time.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return parseFloat(time);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return mins > 0 ? `${mins}:${secs.padStart(5, '0')}` : `${secs}`;
  };

  const sortedTests = [...testControls].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Test Control
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Evaluaciones periódicas para medir progreso y rendimiento
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Botón sincronizar */}
          {onSyncData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          )}
          
          {/* Botón descargar PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTestControlsPDF(testControls, testResults, swimmers)}
            disabled={testControls.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Descargar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          
          {canManageTests && (
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTest ? "Editar Test Control" : "Nuevo Test Control"}
                  </DialogTitle>
                  <DialogDescription>
                    Define las pruebas que conformarán este test control
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Nombre del Test *</Label>
                    <Input
                      id="test-name"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="Ej: Test Control Marzo 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-date">Fecha</Label>
                      <Input
                        id="test-date"
                        type="date"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test-mesociclo">Mesociclo</Label>
                      <Select value={testMesociclo} onValueChange={setTestMesociclo}>
                        <SelectTrigger id="test-mesociclo">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mesociclos.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-description">Descripción</Label>
                    <Textarea
                      id="test-description"
                      value={testDescription}
                      onChange={(e) => setTestDescription(e.target.value)}
                      placeholder="Objetivos y detalles del test..."
                      rows={2}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-base">Pruebas del Test *</Label>
                      <Button size="sm" onClick={handleAddTestItem} type="button">
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Prueba
                      </Button>
                    </div>

                    {testItems.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay pruebas. Agrega al menos una.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {testItems.map((item, index) => (
                          <div key={item.id} className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Distancia (m)</Label>
                                <Select
                                  value={item.distance.toString()}
                                  onValueChange={(value) => handleUpdateTestItem(index, 'distance', parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {commonDistances.map(d => (
                                      <SelectItem key={d} value={d.toString()}>{d}m</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Estilo</Label>
                                <Select
                                  value={item.style}
                                  onValueChange={(value) => handleUpdateTestItem(index, 'style', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {styles.map(s => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveTestItem(index)}
                              type="button"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTest}>
                    Guardar Test
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tests List */}
      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Tests Programados</TabsTrigger>
          <TabsTrigger value="alternatives">Tests Alternativos</TabsTrigger>
          <TabsTrigger value="progress">Progresión</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {sortedTests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay tests control creados</p>
                {canManageTests && (
                  <p className="text-sm text-gray-400 mt-1">
                    Crea un test para comenzar a evaluar el rendimiento
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            sortedTests.map(test => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {test.name}
                        {test.mesociclo && (
                          <Badge variant="outline">{test.mesociclo}</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(test.date).toLocaleDateString('es-CL')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {test.testItems.length} prueba{test.testItems.length !== 1 ? 's' : ''}
                        </span>
                      </CardDescription>
                      {test.description && (
                        <p className="text-sm text-gray-600 mt-2">{test.description}</p>
                      )}
                    </div>

                    {canManageTests && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditTest(test)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setTestToDelete(test.id);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {test.testItems.map(item => (
                        <div key={item.id} className="p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="font-medium text-sm">{item.distance}m {item.style}</p>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      onClick={() => handleOpenResults(test)}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Registrar Resultados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="alternatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Tests Alternativos Predefinidos
              </CardTitle>
              <CardDescription>
                Plantillas de tests especializados para evaluación de rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testTemplates.map(template => (
                  <Card key={template.id} className="border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Mostrar las pruebas del template */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Pruebas incluidas:</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {template.testItems.map((item, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded border text-xs">
                              {item.distance}m {item.style}
                            </div>
                          ))}
                        </div>
                      </div>

                      {canManageTests && (
                        <Button 
                          className="w-full mt-3"
                          size="sm"
                          onClick={() => {
                            handleLoadTemplate(template.id);
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Usar Esta Plantilla
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!canManageTests && (
                <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
                  <p className="text-sm text-gray-500">
                    Solo administradores y entrenadores pueden crear tests
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Progresión de Nadadores
                  </CardTitle>
                  <CardDescription>
                    Selecciona un nadador para ver su evolución en los tests
                  </CardDescription>
                </div>
                {/* Botón para descargar PDF grupal */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAllSwimmersTestProgressPDF(swimmers, testControls, testResults)}
                  disabled={swimmers.length === 0 || testResults.length === 0}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">PDF Grupal</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {swimmers.map(swimmer => {
                  const swimmerResults = testResults.filter(r => r.swimmerId === swimmer.id);
                  return (
                    <Button
                      key={swimmer.id}
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => handleShowProgress(swimmer)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="text-left flex-1">
                          <p className="font-medium">{swimmer.name}</p>
                          <p className="text-xs text-gray-500">
                            {swimmerResults.length} resultado{swimmerResults.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Resultados</DialogTitle>
            <DialogDescription>
              {selectedTest?.name} - {selectedTest && new Date(selectedTest.date).toLocaleDateString('es-CL')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="result-swimmer">Nadador *</Label>
              <Select value={resultSwimmerId} onValueChange={setResultSwimmerId}>
                <SelectTrigger id="result-swimmer">
                  <SelectValue placeholder="Seleccionar nadador..." />
                </SelectTrigger>
                <SelectContent>
                  {swimmers.map(swimmer => (
                    <SelectItem key={swimmer.id} value={swimmer.id}>
                      {swimmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {resultSwimmerId && selectedTest && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-base">Tiempos</Label>
                {selectedTest.testItems.map(item => (
                  <div key={item.id} className="space-y-1">
                    <Label htmlFor={`time-${item.id}`} className="text-sm font-normal">
                      {item.distance}m {item.style}
                    </Label>
                    <Input
                      id={`time-${item.id}`}
                      type="text"
                      placeholder="MM:SS.SS o SS.SS"
                      value={resultTimes[item.id] || ""}
                      onChange={(e) => setResultTimes({
                        ...resultTimes,
                        [item.id]: e.target.value
                      })}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="result-notes">Notas</Label>
              <Textarea
                id="result-notes"
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResultsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveResults}>
              Guardar Resultados
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Progresión de {selectedSwimmer?.name}
                </DialogTitle>
                <DialogDescription>
                  Evolución de tiempos en los diferentes tests control
                </DialogDescription>
              </div>
              {/* Botón para descargar PDF individual */}
              {selectedSwimmer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateSwimmerTestProgressPDF(selectedSwimmer, testControls, testResults)}
                  className="ml-4"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedSwimmer && Object.entries(getProgressData(selectedSwimmer)).map(([key, data]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">{key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatTime(value)}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatTime(value), 'Tiempo']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('es-CL')}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="timeInSeconds" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Tiempo"
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    {data.map((point, idx) => {
                      const prevTime = idx > 0 ? data[idx - 1].timeInSeconds : null;
                      const improvement = prevTime ? prevTime - point.timeInSeconds : 0;
                      
                      return (
                        <div key={idx} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{point.testName}</p>
                          <p className="text-blue-600 font-bold">{point.time}</p>
                          {improvement !== 0 && (
                            <p className={improvement > 0 ? "text-green-600" : "text-red-600"}>
                              {improvement > 0 ? '↓' : '↑'} {Math.abs(improvement).toFixed(2)}s
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {Object.keys(getProgressData(selectedSwimmer || {} as Swimmer)).length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay resultados registrados para este nadador</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Test Control?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El test control y todos sus resultados serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (testToDelete) {
                  await handleDeleteTestControl(testToDelete);
                  setTestToDelete(null);
                  setDeleteConfirmOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}