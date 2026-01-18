import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Swimmer, PersonalBest, AttendanceRecord } from '../data/swimmers';
import type { Workout } from '../data/workouts';
import type { Challenge } from '../data/challenges';
import type { TestControl, TestResult } from '../data/testControl';

// Función helper para calcular edad
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Función para formatear fecha
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Generar PDF de un solo nadador
export function generateSwimmerPDF(
  swimmer: Swimmer,
  attendanceRecords: AttendanceRecord[] = [],
  teamRecordsCount: number = 0
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Ficha de Nadador', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Información personal
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Información Personal', 14, yPos);
  yPos += 10;

  const personalInfo = [
    ['Nombre', swimmer.name],
    ['Email', swimmer.email],
    ['RUT', swimmer.rut || 'No especificado'],
    ['Género', swimmer.gender || 'No especificado'],
    ['Fecha de Nacimiento', formatDate(swimmer.dateOfBirth)],
    ['Edad', `${calculateAge(swimmer.dateOfBirth)} años`],
    ['Fecha de Ingreso', formatDate(swimmer.joinDate)],
    ['Horario de Entrenamiento', swimmer.schedule],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: personalInfo,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Mejores Marcas Personales
  if (swimmer.personalBests && swimmer.personalBests.length > 0) {
    // Nueva página si no hay suficiente espacio
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Mejores Marcas Personales', 14, yPos);
    yPos += 5;

    // Ordenar por distancia y estilo
    const sortedBests = [...swimmer.personalBests].sort((a, b) => {
      if (a.style !== b.style) return a.style.localeCompare(b.style);
      return a.distance - b.distance;
    });

    const bestsData = sortedBests.map(pb => [
      pb.style,
      `${pb.distance}m`,
      pb.time,
      formatDate(pb.date),
      pb.location || '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Estilo', 'Distancia', 'Tiempo', 'Fecha', 'Lugar']],
      body: bestsData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    // Récords del equipo
    if (teamRecordsCount > 0) {
      doc.setFontSize(10);
      doc.setTextColor(204, 153, 0);
      doc.text(`★ ${teamRecordsCount} Récord(s) del Equipo`, 14, yPos);
      yPos += 10;
    }
  } else {
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text('No hay marcas personales registradas', 14, yPos);
    yPos += 15;
  }

  // Estadísticas de Asistencia
  if (attendanceRecords.length > 0) {
    // Nueva página si no hay suficiente espacio
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Estadísticas de Asistencia', 14, yPos);
    yPos += 10;

    const totalAttendances = attendanceRecords.filter(r => r.attended).length;
    const totalSessions = attendanceRecords.length;
    const attendanceRate = totalSessions > 0 ? ((totalAttendances / totalSessions) * 100).toFixed(1) : '0';
    const totalVolume = attendanceRecords.reduce((sum, r) => sum + r.volumeCompleted, 0);
    const avgVolume = totalSessions > 0 ? (totalVolume / totalSessions).toFixed(0) : '0';

    const attendanceStats = [
      ['Total de Sesiones', totalSessions.toString()],
      ['Asistencias', totalAttendances.toString()],
      ['Porcentaje de Asistencia', `${attendanceRate}%`],
      ['Volumen Total Completado', `${totalVolume.toLocaleString('es-CL')} m`],
      ['Volumen Promedio por Sesión', `${avgVolume} m`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: attendanceStats,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 80 },
        1: { cellWidth: 100 }
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Últimas 10 sesiones
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Últimas 10 Sesiones', 14, yPos);
    yPos += 5;

    const recentRecords = attendanceRecords.slice(-10).reverse();
    const recentData = recentRecords.map(record => [
      formatDate(record.date),
      record.attended ? 'Sí' : 'No',
      `${record.volumeCompleted} m`,
      record.notes || '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Asistió', 'Volumen', 'Notas']],
      body: recentData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      columnStyles: {
        3: { cellWidth: 60 }
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Ficha_${swimmer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Generar PDF grupal de todos los nadadores
export function generateAllSwimmersPDF(
  swimmers: Swimmer[],
  attendanceRecordsBySwimmer: Map<string, AttendanceRecord[]>,
  teamRecordsBySwimmer: Map<string, number>
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Fichas de Nadadores', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Total de nadadores: ${swimmers.length}`, pageWidth / 2, 40, { align: 'center' });

  let yPos = 50;

  // Tabla resumen de todos los nadadores
  const summaryData = swimmers.map(swimmer => {
    const attendanceRecords = attendanceRecordsBySwimmer.get(swimmer.id) || [];
    const totalAttendances = attendanceRecords.filter(r => r.attended).length;
    const totalSessions = attendanceRecords.length;
    const attendanceRate = totalSessions > 0 ? ((totalAttendances / totalSessions) * 100).toFixed(1) : '0';
    const totalVolume = attendanceRecords.reduce((sum, r) => sum + r.volumeCompleted, 0);
    const recordsCount = teamRecordsBySwimmer.get(swimmer.id) || 0;

    return [
      swimmer.name,
      swimmer.schedule,
      calculateAge(swimmer.dateOfBirth).toString(),
      swimmer.gender || '-',
      `${attendanceRate}%`,
      totalVolume.toLocaleString('es-CL'),
      recordsCount > 0 ? `★ ${recordsCount}` : '-'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Nombre', 'Horario', 'Edad', 'Género', 'Asist.', 'Vol. Total (m)', 'Récords']],
    body: summaryData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 20 },
      2: { cellWidth: 15 },
      3: { cellWidth: 22 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30 },
      6: { cellWidth: 20 }
    },
    margin: { left: 14, right: 14 },
  });

  // Agregar fichas individuales detalladas
  swimmers.forEach((swimmer, index) => {
    doc.addPage();
    yPos = 20;

    // Título del nadador
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204);
    doc.text(swimmer.name, 14, yPos);
    yPos += 10;

    // Información personal compacta
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const personalInfo = [
      ['Email', swimmer.email],
      ['RUT', swimmer.rut || '-'],
      ['Género', swimmer.gender || '-'],
      ['Edad', `${calculateAge(swimmer.dateOfBirth)} años`],
      ['Horario', swimmer.schedule],
      ['Ingreso', formatDate(swimmer.joinDate)],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: personalInfo,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 140 }
      },
      margin: { left: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Mejores Marcas
    if (swimmer.personalBests && swimmer.personalBests.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Mejores Marcas', 14, yPos);
      yPos += 5;

      const bestsData = swimmer.personalBests
        .sort((a, b) => a.distance - b.distance)
        .map(pb => [
          pb.style,
          `${pb.distance}m`,
          pb.time,
          formatDate(pb.date)
        ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Estilo', 'Dist.', 'Tiempo', 'Fecha']],
        body: bestsData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Estadísticas de asistencia
    const attendanceRecords = attendanceRecordsBySwimmer.get(swimmer.id) || [];
    if (attendanceRecords.length > 0) {
      const totalAttendances = attendanceRecords.filter(r => r.attended).length;
      const totalSessions = attendanceRecords.length;
      const attendanceRate = ((totalAttendances / totalSessions) * 100).toFixed(1);
      const totalVolume = attendanceRecords.reduce((sum, r) => sum + r.volumeCompleted, 0);

      doc.setFontSize(12);
      doc.text('Estadísticas', 14, yPos);
      yPos += 5;

      const stats = [
        ['Sesiones Totales', totalSessions.toString()],
        ['Asistencias', `${totalAttendances} (${attendanceRate}%)`],
        ['Volumen Total', `${totalVolume.toLocaleString('es-CL')} m`],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: stats,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 130 }
        },
        margin: { left: 14 },
      });
    }
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Fichas_Nadadores_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Generar PDF de un entrenamiento individual
export function generateWorkoutPDF(workout: Workout): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Plan de Entrenamiento', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Información del entrenamiento
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${workout.day} - ${workout.date}`, 14, yPos);
  yPos += 10;

  // Información general en tabla
  const workoutInfo = [
    ['Mesociclo', workout.mesociclo],
    ['Distancia Total', `${workout.distance} metros`],
    ['Duración Estimada', `${workout.duration} minutos`],
    ['Intensidad', workout.intensity],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: workoutInfo,
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Calentamiento
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Calentamiento', 14, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const warmupLines = doc.splitTextToSize(workout.warmup, pageWidth - 28);
  doc.text(warmupLines, 14, yPos);
  yPos += warmupLines.length * 6 + 10;

  // Serie Principal
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Serie Principal', 14, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  workout.mainSet.forEach((set, index) => {
    const setLines = doc.splitTextToSize(`${index + 1}. ${set}`, pageWidth - 28);
    
    // Verificar si necesitamos una nueva página
    if (yPos + (setLines.length * 6) > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(setLines, 14, yPos);
    yPos += setLines.length * 6 + 3;
  });

  yPos += 7;

  // Verificar espacio para enfriamiento
  if (yPos > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPos = 20;
  }

  // Enfriamiento
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Enfriamiento', 14, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const cooldownLines = doc.splitTextToSize(workout.cooldown, pageWidth - 28);
  doc.text(cooldownLines, 14, yPos);

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Entrenamiento_${workout.day.replace(/\s+/g, '_')}_${workout.date.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

// Generar PDF de un desafío de sábado
export function generateChallengePDF(challenge: Challenge): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal con diseño especial para desafíos
  doc.setFontSize(20);
  doc.setTextColor(255, 153, 0); // Color naranja/amarillo
  doc.text('🏆 DESAFÍO DE SÁBADO 🏆', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Nombre del desafío
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 204);
  doc.text(challenge.challengeName, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Descripción
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.setFont(undefined, 'italic');
  const descLines = doc.splitTextToSize(challenge.description, pageWidth - 40);
  doc.text(descLines, pageWidth / 2, yPos, { align: 'center' });
  doc.setFont(undefined, 'normal');
  yPos += descLines.length * 6 + 10;

  // Información del desafío - Fecha
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${challenge.day} ${challenge.date}`, 14, yPos);
  yPos += 10;

  // Información general en tabla
  const challengeInfo = [
    ['Mesociclo', challenge.mesociclo],
    ['Distancia Total', `${challenge.distance} metros`],
    ['Duración Estimada', `${challenge.duration} minutos`],
    ['Intensidad', challenge.intensity],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: challengeInfo,
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 250, 205], cellWidth: 50 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Reglas del desafío
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('📋 Reglas del Desafío', 14, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  challenge.rules.forEach((rule, index) => {
    const ruleLines = doc.splitTextToSize(`${index + 1}. ${rule}`, pageWidth - 28);
    
    // Verificar si necesitamos una nueva página
    if (yPos + (ruleLines.length * 6) > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(ruleLines, 14, yPos);
    yPos += ruleLines.length * 6 + 3;
  });

  yPos += 10;

  // Verificar espacio para premio
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }

  // Premio
  doc.setFontSize(14);
  doc.setTextColor(255, 153, 0);
  doc.text('🏅 Premio', 14, yPos);
  yPos += 7;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  const prizeLines = doc.splitTextToSize(challenge.prizes, pageWidth - 28);
  doc.text(prizeLines, 14, yPos);
  doc.setFont(undefined, 'normal');

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Desafio_${challenge.challengeName.replace(/\\s+/g, '_')}_${challenge.date.replace(/\\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

// Generar PDF de reportes de test controles
export function generateTestControlsPDF(
  testControls: TestControl[],
  testResults: TestResult[],
  swimmers: Swimmer[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Reporte de Test Controles', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Estadísticas generales
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Test Controles: ${testControls.length}`, 14, yPos);
  yPos += 6;
  doc.text(`Total de Resultados Registrados: ${testResults.length}`, 14, yPos);
  yPos += 6;
  doc.text(`Nadadores Evaluados: ${new Set(testResults.map(r => r.swimmerId)).size}`, 14, yPos);
  yPos += 15;

  // Recorrer cada test control
  testControls.forEach((testControl, index) => {
    // Nueva página si no hay suficiente espacio (excepto para el primero)
    if (index > 0 || yPos > 80) {
      doc.addPage();
      yPos = 20;
    }

    // Nombre del test
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text(testControl.name, 14, yPos);
    yPos += 8;

    // Información del test
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${formatDate(testControl.date)}`, 14, yPos);
    yPos += 6;
    doc.text(`Mesociclo: ${testControl.mesociclo}`, 14, yPos);
    yPos += 6;
    if (testControl.description) {
      doc.setFont(undefined, 'italic');
      const descLines = doc.splitTextToSize(testControl.description, pageWidth - 28);
      doc.text(descLines, 14, yPos);
      doc.setFont(undefined, 'normal');
      yPos += descLines.length * 6 + 5;
    }
    yPos += 5;

    // Pruebas del test
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Pruebas:', 14, yPos);
    yPos += 5;

    const testItemsData = testControl.testItems
      .sort((a, b) => a.order - b.order)
      .map((item, idx) => [
        `${idx + 1}`,
        item.style,
        `${item.distance}m`
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Estilo', 'Distancia']],
      body: testItemsData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40 }
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Resultados de nadadores para este test
    const resultsForTest = testResults.filter(r => r.testControlId === testControl.id);

    if (resultsForTest.length > 0) {
      doc.setFontSize(12);
      doc.text(`Resultados (${resultsForTest.length} nadadores):`, 14, yPos);
      yPos += 5;

      const resultsData = resultsForTest.map(result => {
        const swimmer = swimmers.find(s => s.id === result.swimmerId);
        const swimmerName = swimmer ? swimmer.name : 'Nadador desconocido';
        
        // Calcular tiempo promedio de las pruebas
        const times = Object.values(result.times).filter(t => t);
        const avgTime = times.length > 0 ? 
          `${(times.reduce((sum, t) => sum + parseFloat(t), 0) / times.length).toFixed(2)}` : 
          '-';

        return [
          swimmerName,
          formatDate(result.date),
          avgTime,
          result.notes || '-'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Nadador', 'Fecha', 'Tiempo Promedio', 'Notas']],
        body: resultsData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 60 }
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Sin resultados registrados para este test', 14, yPos);
      yPos += 15;
    }
  });

  // Si no hay test controles
  if (testControls.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text('No hay test controles registrados', pageWidth / 2, yPos, { align: 'center' });
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Reporte_Test_Controles_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Generar PDF individual de progresión de un nadador
export function generateSwimmerTestProgressPDF(
  swimmer: Swimmer,
  testControls: TestControl[],
  testResults: TestResult[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Progresión en Test Controles', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Información del nadador
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(swimmer.name, 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${swimmer.email} | ${swimmer.schedule}`, 14, yPos);
  yPos += 15;

  // Filtrar resultados del nadador
  const swimmerResults = testResults.filter(r => r.swimmerId === swimmer.id);

  if (swimmerResults.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text('No hay resultados registrados para este nadador', pageWidth / 2, yPos, { align: 'center' });
  } else {
    // Estadísticas generales
    const testsParticipated = new Set(swimmerResults.map(r => r.testId)).size;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Tests realizados: ${testsParticipated}`, 14, yPos);
    yPos += 6;
    doc.text(`Pruebas completadas: ${swimmerResults.length}`, 14, yPos);
    yPos += 15;

    // Agrupar resultados por distancia y estilo
    const groupedData: { [key: string]: any[] } = {};

    swimmerResults.forEach(result => {
      const test = testControls.find(t => t.id === result.testId);
      const testItem = test?.testItems.find(item => item.id === result.testItemId);
      
      if (test && testItem) {
        const key = `${testItem.distance}m ${testItem.style}`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }

        groupedData[key].push({
          date: test.date,
          testName: test.name,
          time: result.time,
          notes: result.notes || ''
        });
      }
    });

    // Ordenar cada grupo por fecha
    Object.keys(groupedData).forEach(key => {
      groupedData[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Generar sección para cada prueba
    Object.entries(groupedData).forEach(([key, data], index) => {
      // Nueva página si es necesario
      if (yPos > 200 && index > 0) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text(key, 14, yPos);
      yPos += 8;

      // Tabla de progresión
      const progressData = data.map((result, idx) => {
        const prevTime = idx > 0 ? data[idx - 1].time : null;
        const improvement = prevTime ? calculateTimeImprovement(prevTime, result.time) : '-';
        
        return [
          formatDate(result.date),
          result.testName,
          result.time,
          improvement,
          result.notes || '-'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Test', 'Tiempo', 'Mejora', 'Notas']],
        body: progressData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 50 }
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 12;

      // Mejor marca en esta prueba
      const bestTime = data.reduce((best, current) => {
        return compareTimeStrings(current.time, best.time) < 0 ? current : best;
      });

      doc.setFontSize(10);
      doc.setTextColor(0, 153, 0);
      doc.text(`🏆 Mejor marca: ${bestTime.time} (${formatDate(bestTime.date)})`, 14, yPos);
      yPos += 10;
    });
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Progresion_Tests_${swimmer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Generar PDF grupal de progresión de todos los nadadores
export function generateAllSwimmersTestProgressPDF(
  swimmers: Swimmer[],
  testControls: TestControl[],
  testResults: TestResult[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Progresión Grupal en Test Controles', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Estadísticas generales
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de nadadores: ${swimmers.length}`, 14, yPos);
  yPos += 6;
  doc.text(`Total de tests realizados: ${testControls.length}`, 14, yPos);
  yPos += 6;
  doc.text(`Total de resultados registrados: ${testResults.length}`, 14, yPos);
  yPos += 15;

  // Resumen por nadador
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Resumen de Participación', 14, yPos);
  yPos += 5;

  const summaryData = swimmers.map(swimmer => {
    const swimmerResults = testResults.filter(r => r.swimmerId === swimmer.id);
    const testsParticipated = new Set(swimmerResults.map(r => r.testId)).size;
    
    return [
      swimmer.name,
      swimmer.schedule,
      testsParticipated.toString(),
      swimmerResults.length.toString()
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Nadador', 'Horario', 'Tests', 'Pruebas']],
    body: summaryData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Detalles por test control
  testControls
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach((test, testIndex) => {
      // Nueva página si es necesario
      if (yPos > 220 || testIndex > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Nombre del test
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 204);
      doc.text(test.name, 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha: ${formatDate(test.date)}`, 14, yPos);
      yPos += 5;

      if (test.mesociclo) {
        doc.text(`Mesociclo: ${test.mesociclo}`, 14, yPos);
        yPos += 5;
      }

      yPos += 5;

      // Resultados por prueba del test
      test.testItems.forEach((item, itemIndex) => {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.distance}m ${item.style}`, 14, yPos);
        yPos += 5;

        // Obtener resultados para esta prueba
        const itemResults = testResults
          .filter(r => r.testId === test.id && r.testItemId === item.id)
          .map(result => {
            const swimmer = swimmers.find(s => s.id === result.swimmerId);
            return [
              swimmer?.name || 'Desconocido',
              result.time,
              result.notes || '-'
            ];
          })
          .sort((a, b) => compareTimeStrings(a[1], b[1]));

        if (itemResults.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Nadador', 'Tiempo', 'Notas']],
            body: itemResults,
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 30 },
              2: { cellWidth: 70 }
            },
            margin: { left: 14, right: 14 },
          });

          yPos = (doc as any).lastAutoTable.finalY + 8;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text('Sin resultados registrados', 20, yPos);
          yPos += 10;
        }
      });

      yPos += 5;
    });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Progresion_Grupal_Tests_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Funciones auxiliares para comparación de tiempos
function compareTimeStrings(time1: string, time2: string): number {
  const timeToSeconds = (time: string): number => {
    const parts = time.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return parseFloat(time);
  };

  return timeToSeconds(time1) - timeToSeconds(time2);
}

function calculateTimeImprovement(previousTime: string, currentTime: string): string {
  const prev = compareTimeStrings(previousTime, currentTime);
  
  if (prev > 0) {
    return `+${Math.abs(prev).toFixed(2)}s`; // Empeoró
  } else if (prev < 0) {
    return `-${Math.abs(prev).toFixed(2)}s`; // Mejoró
  }
  return '='; // Igual
}

// Tipo para las sesiones de entrenamiento
type TrainingSession = {
  type: 'workout' | 'challenge';
  mesociclo: string;
  week: number;
  date: string;
  day: string;
  distance: number;
  warmup?: string;
  mainSet?: string[] | string;
  cooldown?: string;
  intensity?: string;
  focus?: string;
  description?: string;
};

// Generar PDF de Ritmo de Entrenamiento
export function generateTrainingPacePDF(sessions: TrainingSession[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Análisis de Ritmo de Entrenamiento', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Subtítulo con nombre del equipo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Natación Master - Universidad de Chile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Estadísticas Generales
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Estadísticas Generales', 14, yPos);
  yPos += 10;

  const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
  const totalWorkouts = sessions.filter(s => s.type === 'workout').length;
  const totalChallenges = sessions.filter(s => s.type === 'challenge').length;
  const avgDistance = sessions.length > 0 ? Math.round(totalDistance / sessions.length) : 0;

  const generalStats = [
    ['Total de Sesiones', sessions.length.toString()],
    ['Entrenamientos Regulares', totalWorkouts.toString()],
    ['Desafíos de Sábado', totalChallenges.toString()],
    ['Volumen Total', `${(totalDistance / 1000).toFixed(1)} km`],
    ['Distancia Promedio por Sesión', `${avgDistance.toLocaleString('es-CL')} m`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: generalStats,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 80 },
      1: { cellWidth: 100 }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Distribución por Mesociclo
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Distribución por Mesociclo', 14, yPos);
  yPos += 10;

  const mesociclos = ['Base', 'Desarrollo', 'Pre-competitivo', 'Competitivo'];
  const mesocicloData = mesociclos.map(mesociclo => {
    const mesoSessions = sessions.filter(s => s.mesociclo === mesociclo);
    const mesoDistance = mesoSessions.reduce((sum, s) => sum + s.distance, 0);
    const mesoAvg = mesoSessions.length > 0 ? Math.round(mesoDistance / mesoSessions.length) : 0;
    
    return [
      mesociclo,
      mesoSessions.length.toString(),
      `${(mesoDistance / 1000).toFixed(1)} km`,
      `${mesoAvg} m`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Mesociclo', 'Sesiones', 'Volumen Total', 'Promedio/Sesión']],
    body: mesocicloData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Distribución por Intensidad
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Distribución por Intensidad', 14, yPos);
  yPos += 10;

  const intensities = ['Baja', 'Media', 'Alta', 'Muy alta'];
  const intensityData = intensities.map(intensity => {
    const intSessions = sessions.filter(s => (s.intensity || 'Media') === intensity);
    const intDistance = intSessions.reduce((sum, s) => sum + s.distance, 0);
    const percentage = totalDistance > 0 ? ((intDistance / totalDistance) * 100).toFixed(1) : '0.0';
    
    return [
      intensity,
      intSessions.length.toString(),
      `${(intDistance / 1000).toFixed(1)} km`,
      `${percentage}%`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Intensidad', 'Sesiones', 'Volumen Total', '% del Total']],
    body: intensityData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Análisis por Semana
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Volumen por Semana', 14, yPos);
  yPos += 5;

  // Agrupar por semana
  const weeklyData: { [key: number]: { distance: number; sessions: number } } = {};
  sessions.forEach(session => {
    if (!weeklyData[session.week]) {
      weeklyData[session.week] = { distance: 0, sessions: 0 };
    }
    weeklyData[session.week].distance += session.distance;
    weeklyData[session.week].sessions += 1;
  });

  const weeks = Object.keys(weeklyData).map(Number).sort((a, b) => a - b);
  const weeklyTableData = weeks.map(week => {
    const data = weeklyData[week];
    const avg = Math.round(data.distance / data.sessions);
    
    return [
      `Semana ${week}`,
      data.sessions.toString(),
      `${(data.distance / 1000).toFixed(1)} km`,
      `${avg} m`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Semana', 'Sesiones', 'Volumen Total', 'Promedio/Sesión']],
    body: weeklyTableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 50 }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Análisis de Progresión de Carga
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Progresión de Carga por Mesociclo', 14, yPos);
  yPos += 10;

  const progressionData = mesociclos.map(mesociclo => {
    const mesoSessions = sessions.filter(s => s.mesociclo === mesociclo);
    
    // Calcular volumen por intensidad
    const intensityVolumes: { [key: string]: number } = {
      'Baja': 0,
      'Media': 0,
      'Alta': 0,
      'Muy alta': 0
    };

    mesoSessions.forEach(session => {
      const intensity = session.intensity || 'Media';
      if (intensityVolumes[intensity] !== undefined) {
        intensityVolumes[intensity] += session.distance;
      }
    });

    const totalMesoDistance = Object.values(intensityVolumes).reduce((sum, v) => sum + v, 0);
    
    return [
      mesociclo,
      `${(intensityVolumes['Baja'] / 1000).toFixed(1)} km`,
      `${(intensityVolumes['Media'] / 1000).toFixed(1)} km`,
      `${(intensityVolumes['Alta'] / 1000).toFixed(1)} km`,
      `${(intensityVolumes['Muy alta'] / 1000).toFixed(1)} km`,
      `${(totalMesoDistance / 1000).toFixed(1)} km`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Mesociclo', 'Baja', 'Media', 'Alta', 'Muy Alta', 'Total']],
    body: progressionData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Información adicional de análisis
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204);
  doc.text('Análisis de Técnica y Equipamiento', 14, yPos);
  yPos += 10;

  // Calcular volumen estimado en técnica
  let techniqueVolume = 0;
  let techniqueCount = 0;

  // Calcular volumen por equipamiento
  const equipmentVolumes: { [key: string]: number } = {
    'Pull Buoy': 0,
    'Aletas': 0,
    'Paletas': 0,
    'Patada': 0
  };

  sessions.forEach(session => {
    const warmup = session.warmup?.toLowerCase() || '';
    const mainSet = Array.isArray(session.mainSet) 
      ? session.mainSet.join(' ').toLowerCase() 
      : (session.mainSet?.toLowerCase() || '');
    const cooldown = session.cooldown?.toLowerCase() || '';
    const focus = session.focus?.toLowerCase() || '';
    const description = session.description?.toLowerCase() || '';
    
    const combinedText = `${warmup} ${mainSet} ${cooldown} ${focus} ${description}`;
    
    // Detectar técnica
    const techniqueKeywords = ['técnica', 'tecnica', 'drill', 'drills'];
    const hasTechnique = techniqueKeywords.some(keyword => combinedText.includes(keyword));
    
    if (hasTechnique) {
      techniqueVolume += Math.round(session.distance * 0.35);
      techniqueCount++;
    }

    // Detectar equipamiento
    const equipmentKeywords = {
      'Pull Buoy': ['pull', 'pullbuoy', 'pull buoy'],
      'Aletas': ['aletas', 'fins'],
      'Paletas': ['paletas', 'paddles', 'palas'],
      'Patada': ['patada', 'kick', 'piernas']
    };

    Object.entries(equipmentKeywords).forEach(([equipment, keywords]) => {
      const hasEquipment = keywords.some(keyword => combinedText.includes(keyword));
      if (hasEquipment) {
        equipmentVolumes[equipment] += Math.round(session.distance * 0.25);
      }
    });
  });

  const techniquePercentage = totalDistance > 0 
    ? ((techniqueVolume / totalDistance) * 100).toFixed(1) 
    : '0.0';

  const analysisData = [
    ['Volumen en Técnica', `${(techniqueVolume / 1000).toFixed(1)} km`, `${techniquePercentage}%`, `${techniqueCount} sesiones`],
    ['Pull Buoy', `${(equipmentVolumes['Pull Buoy'] / 1000).toFixed(1)} km`, '', ''],
    ['Aletas', `${(equipmentVolumes['Aletas'] / 1000).toFixed(1)} km`, '', ''],
    ['Paletas', `${(equipmentVolumes['Paletas'] / 1000).toFixed(1)} km`, '', ''],
    ['Patada', `${(equipmentVolumes['Patada'] / 1000).toFixed(1)} km`, '', '']
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Categoría', 'Volumen', '% Total', 'Info Adicional']],
    body: analysisData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Nota explicativa
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'italic');
  const note = '* Los volúmenes de técnica y equipamiento son estimaciones basadas en palabras clave detectadas en las descripciones de entrenamientos';
  const noteLines = doc.splitTextToSize(note, pageWidth - 28);
  doc.text(noteLines, 14, yPos);
  doc.setFont(undefined, 'normal');

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-CL')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar el PDF
  const fileName = `Analisis_Ritmo_Entrenamiento_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}