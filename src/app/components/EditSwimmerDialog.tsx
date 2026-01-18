import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Pencil } from "lucide-react";
import type { Swimmer } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "../utils/swimmerUtils";
import { ProfileImagePicker } from "./ProfileImagePicker";

interface EditSwimmerDialogProps {
  swimmer: Swimmer;
  onEdit: (id: string, updatedSwimmer: Omit<Swimmer, "id">) => void;
}

export function EditSwimmerDialog({ swimmer, onEdit }: EditSwimmerDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: swimmer.name,
    email: swimmer.email,
    rut: swimmer.rut || "",
    gender: swimmer.gender || "Masculino" as "Masculino" | "Femenino" | "Otro",
    schedule: swimmer.schedule,
    dateOfBirth: swimmer.dateOfBirth,
    joinDate: swimmer.joinDate,
    profileImage: swimmer.profileImage,
  });

  // Calcular edad y categoría en tiempo real
  const calculatedAge = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
  const calculatedCategory = calculatedAge ? calculateMasterCategory(calculatedAge) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onEdit(swimmer.id, {
      name: formData.name,
      email: formData.email,
      rut: formData.rut,
      gender: formData.gender,
      schedule: formData.schedule as "7am" | "8am" | "9pm",
      dateOfBirth: formData.dateOfBirth,
      joinDate: formData.joinDate,
      profileImage: formData.profileImage,
      personalBests: swimmer.personalBests, // Preservar las marcas personales existentes
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Pencil className="w-4 h-4" />
          Editar Ficha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Nadador</DialogTitle>
          <DialogDescription>
            Modifica la información del nadador
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Carlos Muñoz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej: carlos@ejemplo.cl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rut">RUT</Label>
              <Input
                id="edit-rut"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                placeholder="Ej: 12345678-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gender">Género</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "Masculino" | "Femenino" | "Otro") => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="edit-gender">
                  <SelectValue placeholder="Selecciona un género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBirth">Fecha de Nacimiento</Label>
                <Input
                  type="text"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  placeholder="Ej: 1 de marzo, 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <Input
                  id="edit-category"
                  value={calculatedCategory}
                  readOnly
                  placeholder="Ej: Master A"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-schedule">Horario de Entrenamiento</Label>
              <Select
                value={formData.schedule}
                onValueChange={(value) =>
                  setFormData({ ...formData, schedule: value as "7am" | "8am" | "9pm" })
                }
              >
                <SelectTrigger id="edit-schedule">
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7am">7:00 AM</SelectItem>
                  <SelectItem value="8am">8:00 AM</SelectItem>
                  <SelectItem value="9pm">9:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-joinDate">Fecha de Ingreso</Label>
              <Input
                id="edit-joinDate"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                placeholder="Ej: 1 de marzo, 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-profileImage">Imagen de Perfil</Label>
              <ProfileImagePicker
                currentImage={formData.profileImage}
                onImageChange={(image) => setFormData({ ...formData, profileImage: image })}
                size="medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}