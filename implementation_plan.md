# Desarrollo de Pantallas del Frontend

Vamos a construir todas las pantallas principales que definimos para AcademicScope, organizándolas por rol de usuario para mantener el código limpio y mantenible.

## User Review Required

> [!IMPORTANT]
> Este es un plan ambicioso que abarca la creación de múltiples pantallas complejas. Por favor, revisa si estás de acuerdo con el alcance antes de que comience a programar.
> Como son varias pantallas, empezaré programando paso a paso para no abrumar el sistema.

## Open Questions

> [!WARNING]
> ¿Tienes preferencias sobre los colores o el estilo más allá del semáforo (🟢🟡🔴) para las tablas y botones? Estoy usando las clases utilitarias que ya existen en tu CSS (`btn-primary`, `card`, etc.).
> ¿Quieres que los formularios de administrador (crear usuarios) tengan validaciones estrictas (ej. DNI de exactamente 8 dígitos)?

## Proposed Changes

Vamos a crear y modificar los siguientes archivos.

---

### Rutas Principales (`App.jsx`)

Modificaremos el enrutador para importar y registrar todas las nuevas pantallas que vamos a crear, vinculándolas a las rutas que ya existen en tu `DashboardLayout.jsx`.

#### [MODIFY] [App.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/App.jsx)

---

### Pantallas de Administrador

El administrador necesita mantener los datos básicos del sistema.

#### [NEW] [GestionUsuarios.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/pages/admin/GestionUsuarios.jsx)
Una pantalla con una tabla para listar alumnos, docentes y tutores, además de un botón flotante para agregar nuevos usuarios mediante un formulario (Modal).

#### [NEW] [GestionCursos.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/pages/admin/GestionCursos.jsx)
Una interfaz para administrar los grados, secciones y asignar docentes a las materias correspondientes.

#### [NEW] [GestionMatriculas.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/pages/admin/GestionMatriculas.jsx)
Vista para matricular a los estudiantes en un periodo académico.

---

### Pantallas de Docente

El docente ya tiene `MisCursos.jsx` y `Asistencia.jsx`. Necesitamos la vista para ingresar calificaciones cuando el docente hace clic en un curso específico.

#### [NEW] [IngresoCalificaciones.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/pages/docente/IngresoCalificaciones.jsx)
Pantalla dinámica donde el docente ve su lista de alumnos de una clase y puede ingresar una nota numérica (0-20). El sistema mostrará inmediatamente a su lado la pastilla de color (Semáforo) que le corresponde.

---

### Pantallas de Estudiante y Tutor

Estas pantallas son de solo lectura y muy visuales.

#### [NEW] [MiSemaforo.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/pages/estudiante/MiSemaforo.jsx)
El tablero del estudiante donde ve grandes "tarjetas" o círculos por materia con su rendimiento actual coloreado.

#### [NEW] [SemaforoHijos.jsx](file:///c:/Users/segun/Documents/EVOL.%20Y%20CONF.%20DE%20SOFTWARE/frontendScope/src/pages/tutor/SemaforoHijos.jsx)
Pantalla similar a la del estudiante, pero si el tutor tiene varios hijos registrados, habrá un selector (pestañas) para cambiar rápidamente entre el boletín de un hijo y el del otro.

## Verification Plan

### Manual Verification
1. Ingresaremos con un usuario "ADMIN" y verificaremos que podamos ver la lista de usuarios y crear uno nuevo (ej. crear un nuevo estudiante).
2. Ingresaremos como "DOCENTE" para comprobar que podemos entrar a un curso y asignar una calificación, validando que el color del semáforo cambie automáticamente según la nota.
3. Finalmente, ingresaremos como "TUTOR" o "ESTUDIANTE" para confirmar que la boleta se muestra hermosa y fácil de entender.
