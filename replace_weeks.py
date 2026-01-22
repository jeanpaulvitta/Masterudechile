#!/usr/bin/env python3
import re

# Leer el archivo
with open('/src/app/data/workouts.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Definir los reemplazos
replacements = [
    # Mantenimiento (1-4 -> M1-M4)
    (r'(\s+)week: 1,(\s+date: "3 de febrero")', r'\1week: "M1",\2'),
    (r'(\s+)week: 1,(\s+date: "5 de febrero")', r'\1week: "M1",\2'),
    (r'(\s+)week: 1,(\s+date: "7 de febrero")', r'\1week: "M1",\2'),
    
    (r'(\s+)week: 2,(\s+date: "10 de febrero")', r'\1week: "M2",\2'),
    (r'(\s+)week: 2,(\s+date: "12 de febrero")', r'\1week: "M2",\2'),
    (r'(\s+)week: 2,(\s+date: "14 de febrero")', r'\1week: "M2",\2'),
    
    (r'(\s+)week: 3,(\s+date: "17 de febrero")', r'\1week: "M3",\2'),
    (r'(\s+)week: 3,(\s+date: "19 de febrero")', r'\1week: "M3",\2'),
    (r'(\s+)week: 3,(\s+date: "21 de febrero")', r'\1week: "M3",\2'),
    
    (r'(\s+)week: 4,(\s+date: "24 de febrero")', r'\1week: "M4",\2'),
    (r'(\s+)week: 4,(\s+date: "26 de febrero")', r'\1week: "M4",\2'),
    (r'(\s+)week: 4,(\s+date: "28 de febrero")', r'\1week: "M4",\2'),
    
    # Base (5-9 -> B1-B5)
    (r'(\s+)week: 5,', r'\1week: "B1",'),
    (r'(\s+)week: 6,', r'\1week: "B2",'),
    (r'(\s+)week: 7,', r'\1week: "B3",'),
    (r'(\s+)week: 8,', r'\1week: "B4",'),
    (r'(\s+)week: 9,', r'\1week: "B5",'),
    
    # Desarrollo (10-14 -> D1-D5)
    (r'(\s+)week: 10,', r'\1week: "D1",'),
    (r'(\s+)week: 11,', r'\1week: "D2",'),
    (r'(\s+)week: 12,', r'\1week: "D3",'),
    (r'(\s+)week: 13,', r'\1week: "D4",'),
    (r'(\s+)week: 14,', r'\1week: "D5",'),
    
    # Pre-competitivo (15-19 -> P1-P5)
    (r'(\s+)week: 15,', r'\1week: "P1",'),
    (r'(\s+)week: 16,', r'\1week: "P2",'),
    (r'(\s+)week: 17,', r'\1week: "P3",'),
    (r'(\s+)week: 18,', r'\1week: "P4",'),
    (r'(\s+)week: 19,', r'\1week: "P5",'),
    
    # Competitivo (20-24 -> C1-C5)
    (r'(\s+)week: 20,', r'\1week: "C1",'),
    (r'(\s+)week: 21,', r'\1week: "C2",'),
    (r'(\s+)week: 22,', r'\1week: "C3",'),
    (r'(\s+)week: 23,', r'\1week: "C4",'),
    (r'(\s+)week: 24,', r'\1week: "C5",'),
]

# Reemplazar comentarios de semanas
content = re.sub(r'// Semana 1 de Febrero', '// Semana M1 de Febrero', content)
content = re.sub(r'// Semana 2 de Febrero', '// Semana M2 de Febrero', content)
content = re.sub(r'// Semana 3 de Febrero', '// Semana M3 de Febrero', content)
content = re.sub(r'// Semana 4 de Febrero', '// Semana M4 de Febrero', content)

content = re.sub(r'// Semana 5$', '// Semana B1', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 6$', '// Semana B2', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 7$', '// Semana B3', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 8$', '// Semana B4', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 9$', '// Semana B5', content, flags=re.MULTILINE)

content = re.sub(r'// Semana 10$', '// Semana D1', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 11$', '// Semana D2', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 12$', '// Semana D3', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 13$', '// Semana D4', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 14$', '// Semana D5', content, flags=re.MULTILINE)

content = re.sub(r'// Semana 15$', '// Semana P1', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 16$', '// Semana P2', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 17$', '// Semana P3', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 18$', '// Semana P4', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 19$', '// Semana P5', content, flags=re.MULTILINE)

content = re.sub(r'// Semana 20$', '// Semana C1', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 21$', '// Semana C2', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 22$', '// Semana C3', content, flags=re.MULTILINE)
content = re.sub(r'// Semana 23', '// Semana C4', content)
content = re.sub(r'// Semana 24', '// Semana C5', content)

# Aplicar todos los reemplazos
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# Escribir el archivo
with open('/src/app/data/workouts.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Reemplazos completados exitosamente!")
