/**
 * Calcula la edad a partir de la fecha de nacimiento
 * @param dateOfBirth - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns Edad en años
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Calcular edad basándose solo en el año de nacimiento
  const age = today.getFullYear() - birthDate.getFullYear();
  
  return age;
}

/**
 * Calcula la categoría Master según la edad
 * Las categorías Master son cada 4 años: 18-24, 25-29, 30-34, 35-39, etc.
 * @param age - Edad del nadador
 * @returns Categoría Master (ej: "Master 25-29")
 */
export function calculateMasterCategory(age: number): string {
  if (age < 18) {
    return "Juvenil";
  }
  
  if (age <= 24) {
    return "Master 18-24";
  }
  
  // Para edad >= 25, categorías cada 5 años
  const rangeStart = Math.floor((age - 25) / 5) * 5 + 25;
  const rangeEnd = rangeStart + 4;
  
  return `Master ${rangeStart}-${rangeEnd}`;
}

/**
 * Formatea la fecha de nacimiento para mostrar
 * @param dateOfBirth - Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada
 */
export function formatDateOfBirth(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('es-CL', options);
}