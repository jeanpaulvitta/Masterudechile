export interface TestControl {
  id: string;
  name: string;
  date: string;
  description?: string;
  testItems: TestItem[];
  mesociclo?: string;
  createdAt: string;
}

export interface TestItem {
  id: string;
  distance: number;
  style: string;
  order: number;
}

export interface TestResult {
  id: string;
  testId: string;
  swimmerId: string;
  testItemId: string;
  time: string; // Formato MM:SS.SS
  date: string;
  notes?: string;
  createdAt: string;
}

export const styles = [
  "Libre/Crol",
  "Espalda",
  "Pecho",
  "Mariposa",
  "Combinado"
];

export const commonDistances = [
  25, 50, 100, 200, 400, 800, 1500
];
