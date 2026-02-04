import type { Competition } from "../data/swimmers";

// Calendario Master 2026 - 2027
export const competitions2026: Omit<Competition, "id">[] = [
  // ===== PRIMER SEMESTRE =====
  {
    name: "XXII COPPA ITALIA MASTER",
    week: 1,
    startDate: "2026-03-28",
    endDate: "2026-03-28",
    schedule: "09:00 - 18:00",
    cost: "Por confirmar",
    location: "Por confirmar",
    poolType: "50m",
    type: "Internacional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre", "1500m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "Competencia internacional, XXII edición Copa Italia Master"
  },
  {
    name: "III COPA ÑUÑOA MASTER",
    week: 5,
    startDate: "2026-04-25",
    endDate: "2026-04-25",
    schedule: "09:00 - 18:00",
    cost: "$15.000",
    location: "Piscina Municipal de Ñuñoa",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "⭐ PRIORITARIO - Tercera edición Copa Ñuñoa Master"
  },
  {
    name: "XIII PEÑALOLÉN MASTER",
    week: 8,
    startDate: "2026-05-16",
    endDate: "2026-05-16",
    schedule: "09:00 - 18:00",
    cost: "$12.000",
    location: "Centro Acuático Peñalolén",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado"
    ],
    description: "Decimotercera edición Peñalolén Master"
  },
  {
    name: "VII COPA SMART SWIM",
    week: 10,
    startDate: "2026-05-30",
    endDate: "2026-05-30",
    schedule: "09:00 - 18:00",
    cost: "$18.000",
    location: "Por confirmar",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "Séptima edición Copa Smart Swim"
  },
  {
    name: "VI COPA SANTIAGO DEPORTE",
    week: 12,
    startDate: "2026-06-13",
    endDate: "2026-06-13",
    schedule: "09:00 - 18:00",
    cost: "$15.000",
    location: "Centro Acuático Estadio Nacional",
    poolType: "50m",
    type: "Regional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre", "1500m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "⭐ PRIORITARIO - Sexta edición Copa Santiago Deporte"
  },
  {
    name: "X COPA MASTER SAN BERNARDO",
    week: 15,
    startDate: "2026-07-04",
    endDate: "2026-07-04",
    schedule: "09:00 - 18:00",
    cost: "$12.000",
    location: "Piscina Municipal San Bernardo",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado"
    ],
    description: "Décima edición Copa Master San Bernardo"
  },
  {
    name: "NACIONAL MASTER INVIERNO FECHIDA",
    week: 18,
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    schedule: "08:00 - 19:00",
    cost: "$45.000",
    location: "Centro Acuático Estadio Nacional",
    poolType: "50m",
    type: "Nacional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre", "1500m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado",
      "4x50m Libre", "4x50m Combinado"
    ],
    description: "⭐ PRIORITARIO - Campeonato Nacional Master Invierno FECHIDA (3 días)"
  },

  // ===== SEGUNDO SEMESTRE =====
  {
    name: "IV COPA DEL MAULE",
    week: 20,
    startDate: "2026-08-08",
    endDate: "2026-08-08",
    schedule: "09:00 - 18:00",
    cost: "$10.000",
    location: "Talca",
    poolType: "25m",
    type: "Regional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado"
    ],
    description: "Cuarta edición Copa del Maule - Talca"
  },
  {
    name: "VI COPA MASTER LQBLO",
    week: 22,
    startDate: "2026-08-22",
    endDate: "2026-08-22",
    schedule: "09:00 - 18:00",
    cost: "$15.000",
    location: "Lo Barnechea",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "⭐ PRIORITARIO - Sexta edición Copa Master Lo Barnechea"
  },
  {
    name: "VII COPA ARAUCANÍA DE NATACIÓN MASTER",
    week: 24,
    startDate: "2026-09-05",
    endDate: "2026-09-05",
    schedule: "09:00 - 18:00",
    cost: "$12.000",
    location: "Temuco",
    poolType: "25m",
    type: "Regional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado"
    ],
    description: "Séptima edición Copa Araucanía Master - Temuco"
  },
  {
    name: "XVI COPA ESPAÑA MASTER",
    week: 28,
    startDate: "2026-10-03",
    endDate: "2026-10-04",
    schedule: "09:00 - 18:00",
    cost: "$25.000",
    location: "Por confirmar",
    poolType: "25m",
    type: "Regional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "Decimosexta edición Copa España Master (2 días)"
  },
  {
    name: "IX VERSIÓN AGUAS ABIERTAS MASTER",
    week: 30,
    startDate: "2026-10-17",
    endDate: "2026-10-17",
    schedule: "08:00 - 14:00",
    cost: "$20.000",
    location: "Laguna o Mar (Por confirmar)",
    poolType: "50m", // Aguas abiertas
    type: "Nacional",
    events: [
      "1km Aguas Abiertas",
      "2km Aguas Abiertas",
      "3km Aguas Abiertas",
      "5km Aguas Abiertas"
    ],
    description: "⭐ PRIORITARIO - Novena edición Aguas Abiertas Master"
  },
  {
    name: "CAMPEONATO PANAMERICANO MASTER BUENOS AIRES",
    week: 31,
    startDate: "2026-10-21",
    endDate: "2026-10-27",
    schedule: "08:00 - 20:00",
    cost: "USD $150",
    location: "Buenos Aires, Argentina",
    poolType: "50m",
    type: "Internacional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre", "1500m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado",
      "4x50m Libre", "4x100m Libre", "4x50m Combinado", "4x100m Combinado"
    ],
    description: "Campeonato Panamericano Master - Buenos Aires, Argentina (7 días)"
  },
  {
    name: "XIV COPA 4 ESTILOS MASTER PROVIDENCIA",
    week: 31,
    startDate: "2026-10-24",
    endDate: "2026-10-24",
    schedule: "09:00 - 18:00",
    cost: "$15.000",
    location: "Piscina Municipal Providencia",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "Decimocuarta edición Copa 4 Estilos Master Providencia"
  },
  {
    name: "V COPA UC MASTER",
    week: 33,
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    schedule: "09:00 - 18:00",
    cost: "$18.000",
    location: "Piscina UC San Carlos de Apoquindo",
    poolType: "50m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "Quinta edición Copa UC Master"
  },
  {
    name: "NATACIÓN SIN FRONTERA ARICA",
    week: 36,
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    schedule: "08:00 - 19:00",
    cost: "$35.000",
    location: "Arica",
    poolType: "50m",
    type: "Regional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre", "1500m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "⭐ PRIORITARIO REGIONAL - Natación Sin Frontera Arica (3 días)"
  },
  {
    name: "XII COPA NATACIÓN RECOLETA",
    week: 37,
    startDate: "2026-12-12",
    endDate: "2026-12-12",
    schedule: "09:00 - 18:00",
    cost: "$15.000",
    location: "Piscina Municipal Recoleta",
    poolType: "25m",
    type: "Local",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado"
    ],
    description: "⭐ PRIORITARIO - Decimosegunda edición Copa Natación Recoleta"
  },
  {
    name: "XXI NACIONAL MÁSTER FCHMN",
    week: 41,
    startDate: "2027-01-06",
    endDate: "2027-01-09",
    schedule: "08:00 - 20:00",
    cost: "$50.000",
    location: "Centro Acuático Estadio Nacional",
    poolType: "50m",
    type: "Nacional",
    events: [
      "50m Libre", "100m Libre", "200m Libre", "400m Libre", "800m Libre", "1500m Libre",
      "50m Espalda", "100m Espalda", "200m Espalda",
      "50m Pecho", "100m Pecho", "200m Pecho",
      "50m Mariposa", "100m Mariposa", "200m Mariposa",
      "200m Combinado", "400m Combinado",
      "4x50m Libre", "4x100m Libre", "4x50m Combinado", "4x100m Combinado"
    ],
    description: "⭐ PRIORITARIO - Campeonato Nacional Máster XXI FCHMN (4 días)"
  }
];
