# 🛠️ Plan de Trabajo: Módulo Administrador (ADMIN)

## 📌 Objetivo del Rol
Desarrollar el panel de control central (Backoffice) desde donde el colegio gestiona toda la operatividad académica y administrativa. Es el usuario con los privilegios más altos.

## ⚖️ Reglas de Negocio (Business Rules)
1. **Control de Acceso Absoluto:** El administrador es el único rol autorizado para crear, modificar, activar o dar de baja a usuarios (Estudiantes, Docentes, Tutores, Admins).
2. **Restricción de Acciones Académicas:** El administrador *no* ingresa calificaciones ni toma asistencia; su función es de configuración y supervisión.
3. **Integridad de Datos:** Al registrar un Estudiante, este debe tener obligatoriamente un `Tutor` asignado.
4. **Validación de Identidad:** No pueden existir dos usuarios con el mismo `DNI` ni el mismo `Correo Electrónico` en toda la plataforma.

---

## 💻 Tareas para el Desarrollador FRONTEND
- [ ] **Dashboard General:** Implementar gráficas estadísticas (ej. Chart.js o Recharts) que muestren: total de matrículas, asistencia promedio del colegio y cantidad de estudiantes en "Semáforo Rojo".
- [ ] **CRUD de Usuarios:** Crear formularios completos para registrar Estudiantes, Docentes y Tutores, validando que los DNI tengan 8 dígitos.
- [ ] **Gestor de Matrículas y Cursos:** Interfaz para crear Cursos, asignarlos a Grados, asignar un Docente a un Curso, y finalmente matricular a los estudiantes masivamente.
- [ ] **Gestor de Horarios:** Vista con diseño de calendario semanal para acomodar los horarios de cada salón.

## ⚙️ Tareas para el Desarrollador BACKEND
- [ ] **Endpoints CRUD Completos:** Terminar los controladores (`UsuarioController`, `CursoController`, `MatriculaController`) con los métodos POST, PUT y DELETE.
- [ ] **Protección por Roles:** Configurar en Spring Security que todas estas rutas requieran que el token JWT tenga la autoridad `ROLE_ADMIN`.
- [ ] **Paginación:** Implementar `Pageable` de Spring Data en las consultas de usuarios para evitar colapsos al cargar miles de alumnos.
- [ ] **Validaciones:** Añadir anotaciones `@Valid`, `@Email` y `@NotBlank` en los DTOs de creación para rechazar peticiones malformadas.
