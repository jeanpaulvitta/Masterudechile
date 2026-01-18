import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Camera, User, X } from "lucide-react";

interface ProfileImagePickerProps {
  currentImage?: string;
  onImageChange: (image: string | undefined) => void;
  size?: "small" | "medium" | "large";
}

export function ProfileImagePicker({ 
  currentImage, 
  onImageChange, 
  size = "medium" 
}: ProfileImagePickerProps) {
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: "w-20 h-20",
    medium: "w-32 h-32",
    large: "w-40 h-40"
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Por favor selecciona una imagen menor a 5MB');
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(undefined);
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Preview de la imagen */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-gray-200 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative group`}>
        {previewImage ? (
          <>
            <img 
              src={previewImage} 
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
            {/* Overlay para eliminar */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          className="gap-2"
        >
          <Camera className="w-4 h-4" />
          {previewImage ? "Cambiar foto" : "Agregar foto"}
        </Button>
        
        {previewImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center">
        Formatos: JPG, PNG, GIF (máx. 5MB)
      </p>
    </div>
  );
}
