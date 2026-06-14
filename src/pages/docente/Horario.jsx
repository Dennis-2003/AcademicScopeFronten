import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerHorariosPorCurso } from '../../services/horarioService';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

export default function Horario() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (user?.id) cargarDatos();
  }, [user]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const cursosData = await obtenerCursosPorDocente(user.id);
      setCursos(cursosData);
      
      let todos = [];
      for (const curso of cursosData) {
        const hs = await obtenerHorariosPorCurso(curso.id);
        const conCurso = hs.map(h => ({ 
          ...h, 
          nombreCurso: curso.nombre, 
          gradoCurso: curso.grado?.nombre || 'Taller' 
        }));
        todos = [...todos, ...conCurso];
      }
      setHorarios(todos);
    } catch (error) {
      console.error("Error cargando horarios:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Mi Horario</h1>
          <p className="text-slate-500 text-sm mt-1">Organiza y visualiza tus clases de la semana.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Semana Actual
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {cargando ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : (
          <div className="flex-1 flex overflow-x-auto">
            {DIAS.map(dia => {
              const clasesDelDia = horarios.filter(h => h.diaSemana === dia).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
              return (
                <div key={dia} className="flex-1 min-w-[200px] border-r border-slate-100 last:border-r-0">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-center">
                    <h3 className="font-bold text-slate-700 text-sm">{dia}</h3>
                  </div>
                  <div className="p-3 space-y-3">
                    {clasesDelDia.length === 0 ? (
                      <div className="text-center py-8 text-xs font-medium text-slate-400">Sin clases</div>
                    ) : (
                      clasesDelDia.map(clase => (
                        <div key={clase.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative">
                          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
                            <Clock size={14} />
                            <span>{clase.horaInicio} - {clase.horaFin}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-[15px] leading-tight mb-1">
                            {clase.nombreCurso}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mb-3">{clase.gradoCurso}</p>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg w-fit">
                            <MapPin size={12} />
                            <span>{clase.aula}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
