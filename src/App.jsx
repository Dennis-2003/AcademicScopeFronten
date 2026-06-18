import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Landing from './pages/landing/Landing';
import Login from './pages/auth/Login';
import CambiarPasswordInicial from './pages/auth/CambiarPasswordInicial';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardIndex from './pages/dashboard/DashboardIndex';
import ComingSoon from './pages/errors/ComingSoon';
import NotFound from './pages/errors/NotFound';
import Perfil from './pages/perfil/Perfil';

// Vistas del Docente
import MisCursos from './pages/docente/MisCursos';
import Asistencia from './pages/docente/Asistencia';
import Calificaciones from './pages/docente/Calificaciones';
import Asignaciones from './pages/docente/Asignaciones';
import Recursos from './pages/docente/Recursos';
import HorarioDocente from './pages/docente/Horario';
import ComunicadosDocente from './pages/docente/Comunicados';
import SemaforoDocente from './pages/docente/Semaforo';

// Vistas del Administrador
import GestionUsuarios from './pages/admin/GestionUsuarios';
import GestionCursos from './pages/admin/GestionCursos';
import GestionMatriculas from './pages/admin/GestionMatriculas';
import GestionHorarios from './pages/admin/GestionHorarios';
import GestionEvaluaciones from './pages/admin/GestionEvaluaciones';
import ReportesAsistencia from './pages/admin/ReportesAsistencia';
import ConfiguracionInstitucion from './pages/admin/ConfiguracionInstitucion';
import GestionFinanzas from './pages/admin/GestionFinanzas';
import GestionComunicados from './pages/admin/GestionComunicados';
import GestionComportamiento from './pages/admin/GestionComportamiento';

// Vistas del Estudiante y Tutor
import MiSemaforo from './pages/estudiante/MiSemaforo';
import MiAsistencia from './pages/estudiante/MiAsistencia';
import MiHorario from './pages/estudiante/MiHorario';
import MisTareas from './pages/estudiante/MisTareas';
import MisComunicados from './pages/estudiante/MisComunicados';
import MisRecursos from './pages/estudiante/MisRecursos';
import MiConducta from './pages/estudiante/MiConducta';
import SemaforoHijos from './pages/tutor/SemaforoHijos';
import Notificaciones from './pages/tutor/Notificaciones';
import FinanzasHijos from './pages/tutor/FinanzasHijos';
import HorarioHijos from './pages/tutor/HorarioHijos';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Privadas — requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />
              <Route path="cambiar-password-inicial" element={<CambiarPasswordInicial />} />
              <Route path="perfil" element={<Perfil />} />
              
              {/* Rutas solo DOCENTE y ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={['DOCENTE', 'ADMIN']} />}>
                <Route path="docente/cursos" element={<MisCursos />} />
                <Route path="docente/asistencia" element={<Asistencia />} />
                <Route path="docente/calificaciones" element={<Calificaciones />} />
                <Route path="docente/asignaciones" element={<Asignaciones />} />
                <Route path="docente/recursos" element={<Recursos />} />
                <Route path="docente/horario" element={<HorarioDocente />} />
                <Route path="docente/comunicados" element={<ComunicadosDocente />} />
                <Route path="docente/semaforo" element={<SemaforoDocente />} />
              </Route>

              {/* Rutas solo ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="admin/usuarios" element={<GestionUsuarios />} />
                <Route path="admin/cursos" element={<GestionCursos />} />
                <Route path="admin/matriculas" element={<GestionMatriculas />} />
                <Route path="admin/horarios" element={<GestionHorarios />} />
                <Route path="admin/evaluaciones" element={<GestionEvaluaciones />} />
                <Route path="admin/asistencia" element={<ReportesAsistencia />} />
                <Route path="admin/pagos" element={<GestionFinanzas />} />
                <Route path="admin/comunicados" element={<GestionComunicados />} />
                <Route path="admin/configuracion" element={<ConfiguracionInstitucion />} />
                <Route path="admin/conducta" element={<GestionComportamiento />} />
              </Route>

              {/* Rutas solo ESTUDIANTE */}
              <Route element={<ProtectedRoute allowedRoles={['ESTUDIANTE']} />}>
                <Route path="estudiante/notas" element={<MiSemaforo />} />
                <Route path="estudiante/asistencia" element={<MiAsistencia />} />
                <Route path="estudiante/horario" element={<MiHorario />} />
                <Route path="estudiante/tareas" element={<MisTareas />} />
                <Route path="estudiante/comunicados" element={<MisComunicados />} />
                <Route path="estudiante/recursos" element={<MisRecursos />} />
                <Route path="estudiante/conducta" element={<MiConducta />} />
              </Route>

              {/* Rutas solo TUTOR */}
              <Route element={<ProtectedRoute allowedRoles={['TUTOR']} />}>
                <Route path="tutor/hijos" element={<SemaforoHijos />} />
                <Route path="tutor/horario" element={<HorarioHijos />} />
                <Route path="tutor/pagos" element={<FinanzasHijos />} />
                <Route path="tutor/notificaciones" element={<Notificaciones />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
