import { useState, useRef } from "react";
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
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import type { Swimmer } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "../utils/swimmerUtils";
import { ProfileImagePicker } from "./ProfileImagePicker";

interface AddSwimmerDialogProps {
  onAddSwimmer: (swimmer: Omit<Swimmer, "id">) => void;
}

export function AddSwimmerDialog({ onAddSwimmer }: AddSwimmerDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rut: "",
    gender: "Masculino" as "Masculino" | "Femenino" | "Otro",
    schedule: "7am" as "7am" | "8am" | "9pm",
    dateOfBirth: "",
    joinDate: new Date().toISOString().split("T")[0],
    profileImage: undefined as string | undefined,
  });

  // Calcular edad y categoría en tiempo real
  const calculatedAge = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
  const calculatedCategory = calculatedAge ? calculateMasterCategory(calculatedAge) : "";

  const scrollToTop = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToBottom = () => {
    if (formRef.current) {
      const lastElement = formRef.current.querySelector('.form-bottom');
      if (lastElement) {
        lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.dateOfBirth) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    onAddSwimmer({
      name: formData.name,
      email: formData.email,
      rut: formData.rut,
      gender: formData.gender,
      schedule: formData.schedule,
      dateOfBirth: formData.dateOfBirth,
      joinDate: formData.joinDate,
      profileImage: formData.profileImage,
      personalBests: [], // Inicializar con array vacío
    });

    // Resetear formulario
    setFormData({
      name: "",
      email: "",
      rut: "",
      gender: "Masculino",
      schedule: "7am",
      dateOfBirth: "",
      joinDate: new Date().toISOString().split("T")[0],
      profileImage: undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar Nadador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Nadador</DialogTitle>
          <DialogDescription>
            Completa la información del nadador. La edad y categoría se calculan automáticamente.
          </DialogDescription>
        </DialogHeader>

        {/* Botones de navegación flotantes */}
        <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-2 sm:hidden">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={scrollToTop}
            className="h-10 w-10 rounded-full bg-white shadow-lg hover:bg-gray-100 border-2 border-blue-500"
          >
            <ChevronUp className="h-5 w-5 text-blue-600" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={scrollToBottom}
            className="h-10 w-10 rounded-full bg-white shadow-lg hover:bg-gray-100 border-2 border-blue-500"
          >
            <ChevronDown className="h-5 w-5 text-blue-600" />
          </Button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ej: juan.perez@uchile.cl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rut">
              Rut <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rut"
              value={formData.rut}
              onChange={(e) =>
                setFormData({ ...formData, rut: e.target.value })
              }
              placeholder="Ej: 12345678-9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Género <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value: "Masculino" | "Femenino" | "Otro") =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue />
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
              <Label htmlFor="dateOfBirth">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">
                Horario <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.schedule}
                onValueChange={(value: "7am" | "8am" | "9pm") =>
                  setFormData({ ...formData, schedule: value })
                }
              >
                <SelectTrigger id="schedule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7am">7:00 AM</SelectItem>
                  <SelectItem value="8am">8:00 AM</SelectItem>
                  <SelectItem value="9pm">9:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mostrar edad y categoría calculadas */}
          {calculatedAge && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Edad calculada:</p>
                  <p className="font-semibold text-blue-900">{calculatedAge} años</p>
                </div>
                <div>
                  <p className="text-gray-600">Categoría Master:</p>
                  <p className="font-semibold text-blue-900">{calculatedCategory}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="joinDate">Fecha de Ingreso</Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) =>
                setFormData({ ...formData, joinDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Imagen de Perfil</Label>
            <ProfileImagePicker
              currentImage={formData.profileImage}
              onImageChange={(image) => setFormData({ ...formData, profileImage: image })}
              size="medium"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 form-bottom">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Nadador</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}