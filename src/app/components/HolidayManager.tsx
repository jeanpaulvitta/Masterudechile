import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { CalendarOff, Plus, Trash2, Edit2, X } from 'lucide-react';
import type { Holiday } from '../data/holidays';

interface HolidayManagerProps {
  holidays: Holiday[];
  onAddHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<void>;
  onEditHoliday: (id: string, holiday: Omit<Holiday, 'id'>) => Promise<void>;
  onDeleteHoliday: (id: string) => Promise<void>;
}

export function HolidayManager({
  holidays,
  onAddHoliday,
  onEditHoliday,
  onDeleteHoliday,
}: HolidayManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useRange, setUseRange] = useState(false);
  const [formData, setFormData] = useState<Omit<Holiday, 'id'>>({
    date: '',
    name: '',
    type: 'feriado',
    description: '',
    isRecurring: false,
  });
  const [endDate, setEndDate] = useState('');

  // Función para generar todas las fechas entre startDate y endDate
  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.name) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    // Validar rango si está activado
    if (useRange && !endDate) {
      alert('Por favor selecciona la fecha de fin');
      return;
    }

    if (useRange && endDate && endDate < formData.date) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      if (editingId) {
        await onEditHoliday(editingId, formData);
      } else {
        // Si es rango, crear múltiples feriados
        if (useRange && endDate) {
          const dates = generateDateRange(formData.date, endDate);
          console.log(`📅 Creando ${dates.length} días feriados...`);
          
          for (const date of dates) {
            await onAddHoliday({
              ...formData,
              date,
            });
          }
          
          alert(`✅ Se crearon ${dates.length} días feriados exitosamente`);
        } else {
          // Agregar un solo día
          await onAddHoliday(formData);
        }
      }
      
      // Reset form
      setFormData({
        date: '',
        name: '',
        type: 'feriado',
        description: '',
        isRecurring: false,
      });
      setEndDate('');
      setUseRange(false);
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error al guardar día feriado:', error);
      alert('Error al guardar. Intenta nuevamente.');
    }
  };

  const handleEdit = (holiday: Holiday) => {
    if (!holiday.id) return;
    
    setFormData({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type,
      description: holiday.description || '',
      isRecurring: holiday.isRecurring || false,
    });
    setEditingId(holiday.id);
    setUseRange(false); // Deshabilitar rango al editar
    setEndDate('');
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({
      date: '',
      name: '',
      type: 'feriado',
      description: '',
      isRecurring: false,
    });
    setEndDate('');
    setUseRange(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feriado': return 'Feriado';
      case 'vacaciones': return 'Vacaciones';
      case 'suspension': return 'Suspensión';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'feriado': return 'bg-red-100 text-red-800 border-red-200';
      case 'vacaciones': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspension': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Ordenar por fecha
  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-red-600" />
            <CardTitle>Días sin Actividad</CardTitle>
          </div>
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Día
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario de agregar/editar */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                {editingId ? 'Editar Día' : 'Nuevo Día sin Actividad'}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'feriado' | 'vacaciones' | 'suspension') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feriado">🇨🇱 Feriado</SelectItem>
                    <SelectItem value="vacaciones">🏖️ Vacaciones</SelectItem>
                    <SelectItem value="suspension">⚠️ Suspensión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Año Nuevo, Vacaciones de Invierno"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción adicional (opcional)"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">
                Se repite cada año
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useRange"
                checked={useRange}
                onChange={(e) => setUseRange(e.target.checked)}
                disabled={!!editingId}
                className="rounded border-gray-300"
              />
              <Label htmlFor="useRange" className="cursor-pointer">
                Usar rango de fechas {editingId && '(no disponible al editar)'}
              </Label>
            </div>

            {useRange && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="endDate">Fecha de Fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                  {formData.date && endDate && endDate >= formData.date && (
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      📅 Se crearán {generateDateRange(formData.date, endDate).length} días feriados
                    </p>
                  )}
                  {endDate && endDate < formData.date && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ La fecha de fin debe ser posterior a la fecha de inicio
                    </p>
                  )}
                </div>
                
                {/* Atajos rápidos */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (formData.date) {
                        const start = new Date(formData.date + 'T00:00:00');
                        start.setDate(start.getDate() + 1);
                        setEndDate(start.toISOString().split('T')[0]);
                      }
                    }}
                    className="text-xs"
                  >
                    +2 días
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (formData.date) {
                        const start = new Date(formData.date + 'T00:00:00');
                        start.setDate(start.getDate() + 2);
                        setEndDate(start.toISOString().split('T')[0]);
                      }
                    }}
                    className="text-xs"
                  >
                    +3 días
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (formData.date) {
                        const start = new Date(formData.date + 'T00:00:00');
                        start.setDate(start.getDate() + 6);
                        setEndDate(start.toISOString().split('T')[0]);
                      }
                    }}
                    className="text-xs"
                  >
                    +1 semana
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Lista de días feriados */}
        <div className="space-y-2">
          {sortedHolidays.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay días sin actividad registrados
            </p>
          ) : (
            sortedHolidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{holiday.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeBadgeColor(holiday.type)}`}>
                      {getTypeLabel(holiday.type)}
                    </span>
                    {holiday.isRecurring && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        🔄 Anual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>📅 {new Date(holiday.date + 'T00:00:00').toLocaleDateString('es-CL', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                    {holiday.description && (
                      <span className="text-gray-500">• {holiday.description}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(holiday)}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (holiday.id && confirm('¿Eliminar este día?')) {
                        onDeleteHoliday(holiday.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen */}
        {sortedHolidays.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {sortedHolidays.filter(h => h.type === 'feriado').length}
                </p>
                <p className="text-xs text-gray-600">Feriados</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {sortedHolidays.filter(h => h.type === 'vacaciones').length}
                </p>
                <p className="text-xs text-gray-600">Vacaciones</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {sortedHolidays.filter(h => h.type === 'suspension').length}
                </p>
                <p className="text-xs text-gray-600">Suspensiones</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}