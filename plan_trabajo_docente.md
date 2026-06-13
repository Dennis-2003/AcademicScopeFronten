# 👩‍🏫 Plan de Trabajo: Módulo Docente (PROFESOR)

## 📌 Objetivo del Rol
Facilitar al profesor sus tareas diarias: toma de asistencia rápida, registro de calificaciones y seguimiento del rendimiento de las aulas que tiene asignadas.

## ⚖️ Reglas de Negocio (Business Rules)
1. **Aislamiento de Cursos:** Un docente solo tiene permiso para ver y editar calificaciones/asistencias de los cursos donde figura como docente titular.
2. **Escala de Calificaciones:** Las notas van del 0 al 20. Cualquier registro fuera de este rango debe ser rechazado.
3. **Cierre de Periodo:** El docente no puede editar ni eliminar notas si el "Periodo Académico" (Ej. Trimestre 1) ha sido marcado como "Cerrado" por el Administrador.
4. **Validación de Asistencia:** No se puede tomar asistencia en días futuros, solo en la fecha actual o pasada.

---

## 💻 Tareas para el Desarrollador FRONTEND
- [ ] **Dashboard de Clases de Hoy:** Mostrar tarjetas que extraigan del horario las clases que el docente debe dictar el día de hoy, ordenadas por hora.
- [ ] **Pantalla de Toma de Asistencia:** Vista tipo lista con el nombre de los alumnos y botones rápidos (Presente, Tardanza, Falta) con un botón final de "Guardar Asistencia del Día".
- [ ] **Registro de Notas (Tipo Excel):** Una tabla interactiva donde el profesor seleccione la Evaluación (Ej. Examen Parcial) e ingrese las notas en cascada para todos los alumnos.
- [ ] **Visor de Semáforo de Aula:** Panel para ver a sus estudiantes ordenados de menor a mayor nota, para identificar rápidamente quién requiere ayuda.

## ⚙️ Tareas para el Desarrollador BACKEND
- [ ] **Filtro por Docente:** Crear el endpoint `/cursos/docente/{docenteId}` para que devuelva únicamente las aulas del profesor. Validar mediante JWT que `docenteId` coincida con el usuario logueado.
- [ ] **Guardado Masivo (Batch Processing):** Implementar endpoints POST que reciban un `List<AsistenciaDTO>` o `List<CalificacionDTO>` para guardar los datos de 30 alumnos en un solo request.
- [ ] **Validación de Integridad:** Antes de guardar una nota, verificar en BD que la `Evaluación` pertenezca al `Curso`, y que el `Curso` pertenezca al `Docente`.
