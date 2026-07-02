import { useState, useEffect } from 'react';
import { BookOpen, Users, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerMatriculasPorCurso } from '../../services/matriculaService';
import { Link } from 'react-router-dom';

export default function MisCursos() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (user?.id) cargarDatos();
  }, [user]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const cursosData = await obtenerCursosPorDocente(user.id);
      
      const cursosConDetalles = await Promise.all(cursosData.map(async (curso) => {
        try {
          const matriculas = await obtenerMatriculasPorCurso(curso.id);
          return { ...curso, totalAlumnos: matriculas.length };
        } catch {
          return { ...curso, totalAlumnos: 0 };
        }
      }));
      
      setCursos(cursosConDetalles);
    } catch (error) {
      console.error("Error cargando cursos:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mis Cursos</h1>
          <p className="text-slate-500 text-sm mt-1">Vista general de todos los cursos que tienes asignados.</p>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : cursos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-slate-300" />
          </div>
          No tienes cursos asignados actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <div key={curso.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 group flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen size={28} />
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Activo
                </span>
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-800 mb-1">{curso.nombre}</h3>
              <p className="text-sm font-bold text-indigo-600 mb-6">{curso.grado?.nombre || 'General'}</p>
              
              <div className="flex items-center gap-6 mb-8 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Alumnos</p>
                    <p className="text-sm font-bold text-slate-700">{curso.totalAlumnos}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/docente/asistencia" className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center">
                  Tomar Asistencia
                </Link>
                <Link to="/dashboard/docente/calificaciones" className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 text-xs font-bold rounded-xl transition-colors text-center">
                  Calificaciones
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
