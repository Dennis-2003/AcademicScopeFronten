# 🎒 Plan de Trabajo: Módulo Estudiante (ESTUDIANTE)

## 📌 Objetivo del Rol
Ofrecer al estudiante una vista gamificada y amigable de su día a día. Que conozca rápidamente su horario, sus calificaciones recientes y su progreso escolar mediante indicadores visuales.

## ⚖️ Reglas de Negocio (Business Rules)
1. **Privacidad Total:** Un estudiante solo puede solicitar y visualizar su propia información (`estudianteId`). Si intenta ver datos de otro ID, el sistema debe denegarlo (`403 Forbidden`).
2. **Cálculo del Semáforo:** La lógica del semáforo central debe basarse en el promedio general del estudiante. 
   - Promedio >= 14: VERDE
   - Promedio >= 11: ÁMBAR
   - Promedio < 11: ROJO
3. **Porcentaje de Asistencia:** Se calcula sumando `(PRESENTE + TARDANZA + JUSTIFICADO)` dividido entre el total de clases impartidas.
4. **Competitividad Oculta:** Un estudiante no tiene acceso al "Ranking" o a ver los promedios de otros compañeros para evitar conflictos de privacidad.

---

## 💻 Tareas para el Desarrollador FRONTEND
- [ ] **Refinamiento del Dashboard Base:** Mejorar el `EstudianteDashboard.jsx` existente. Hacer que las tarjetas de métricas sean 100% responsivas para celulares.
- [ ] **Vista Detalle - "Mis Notas":** Crear la ruta `/dashboard/estudiante/notas`. Mostrar un acordeón o pestañas separando los cursos. Al abrir un curso, mostrar el detalle de cada evaluación (Exámenes, Prácticas) y comentarios del docente.
- [ ] **Vista Detalle - "Mi Asistencia":** Crear la ruta `/dashboard/estudiante/asistencia`. Integrar una librería de calendario (ej. `react-calendar` o `fullcalendar`) para pintar de rojo los días que faltó y verde los que asistió.

## ⚙️ Tareas para el Desarrollador BACKEND
- [ ] **Lógica Centralizada de Promedios:** Desarrollar en `CalificacionService` la lógica para calcular el promedio del estudiante considerando las ponderaciones de cada evaluación (Ej. Parcial vale 50%, Continua 50%). El frontend no debe hacer la matemática.
- [ ] **Historial de Asistencia Estructurado:** Crear un endpoint `/asistencias/estudiante/{id}/resumen` que agrupe las asistencias por mes o por curso, para que el frontend pueda pintar los gráficos y el calendario fácilmente.
- [ ] **Aseguramiento de Peticiones:** En cada uno de los endpoints de lectura del estudiante, verificar usando el contexto de JWT (`SecurityContextHolder`) que el ID que solicita la información es el mismo ID que está en el token JWT.
