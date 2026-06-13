# 👨‍👩‍👦 Plan de Trabajo: Módulo Apoderado (TUTOR)

## 📌 Objetivo del Rol
Proveer a los padres o tutores legales una herramienta para supervisar el rendimiento académico y la asistencia de todos sus hijos inscritos en la institución.

## ⚖️ Reglas de Negocio (Business Rules)
1. **Rol de Solo Lectura:** El tutor no puede editar notas, ni justificar inasistencias directamente en el sistema. Todo es de carácter informativo.
2. **Dependencia Múltiple:** Un tutor puede tener a su cargo uno o múltiples estudiantes (hermanos). 
3. **Privacidad de la Información:** El tutor tiene estrictamente prohibido visualizar datos (notas, asistencia, nombres) de otros estudiantes que no sean sus dependientes legales.
4. **Replicación de Vistas:** El tutor debe ver exactamente las mismas métricas que ve su hijo (el mismo Semáforo).

---

## 💻 Tareas para el Desarrollador FRONTEND
- [ ] **Selector de Dependientes:** Crear un selector global (dropdown o pestañas superiores) para que el tutor escoja cuál de sus hijos quiere monitorear (Ej. "Ver a Sofia", "Ver a Juan").
- [ ] **Dashboard de Lectura:** Al elegir a un estudiante, renderizar componentes reciclados del `EstudianteDashboard.jsx` (Las tarjetas de Asistencia, Semáforo y Promedio), pasándole el ID del hijo elegido.
- [ ] **Módulo de Notificaciones:** Interfaz para leer mensajes automáticos enviados por el sistema (Ej. "Sofia tiene más de 3 faltas consecutivas").

## ⚙️ Tareas para el Desarrollador BACKEND
- [ ] **Endpoint de Relación:** Desarrollar `/usuarios/{tutorId}/estudiantes` que busque en la tabla Usuarios a todos los estudiantes donde la columna `tutor_id` sea igual a la del tutor.
- [ ] **Validación de Acceso a Recursos:** Si el tutor intenta hacer `GET /calificaciones/estudiante/8`, el backend debe validar que el estudiante `8` efectivamente pertenezca al tutor que hace la petición. Si no, debe lanzar error `403 Forbidden`.
- [ ] **Motor de Notificaciones (Opcional):** Un servicio asíncrono o scheduled job que evalúe si un alumno entra en semáforo rojo, y genere una Notificación en base de datos dirigida al Tutor.
