import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

export default function MiHorario() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user?.id) {
      cargarHorarioReal();
    }
  }, [user]);

  const cargarHorarioReal = async () => {
    setCargando(true);
    try {
      // 1. Obtener todas las matrículas del estudiante
      const resMatriculas = await api.get(`/matriculas/estudiante/${user.id}`);
      const matriculas = resMatriculas.data || [];
      
      let todosLosHorarios = [];

      // 2. Por cada curso matriculado, traer sus horarios
      for (const matricula of matriculas) {
        if (matricula.curso && matricula.curso.id) {
          try {
            const resHorario = await api.get(`/horarios/curso/${matricula.curso.id}`);
            const horariosDelCurso = resHorario.data || [];
            
            // Inyectar la información del curso al horario para poder mostrarla
            const horariosConInfo = horariosDelCurso.map(h => ({
              ...h,
              nombreCurso: matricula.curso.nombre,
              codigoCurso: matricula.curso.codigo,
              tipoCurso: matricula.curso.tipo
            }));
            
            todosLosHorarios = [...todosLosHorarios, ...horariosConInfo];
          } catch (e) {
            console.error(`Error cargando horario para curso ${matricula.curso.id}:`, e);
          }
        }
      }
      
      setHorarios(todosLosHorarios);
    } catch (error) {
      console.error("Error al cargar el horario del estudiante:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <CalendarIcon size={14} strokeWidth={2.5} />
            Estudiante / Horario
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Mi Horario Semanal
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Visualiza tus clases programadas según tus matrículas actuales.
          </p>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {cargando ? (
          <div className="flex-1 flex flex-col justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-slate-500 font-medium">Sincronizando con el servidor...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-x-auto">
            {DIAS.map(dia => {
              // Ordenar las clases del día por hora de inicio
              const clasesDelDia = horarios
                .filter(h => h.diaSemana === dia)
                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
                
              return (
                <div key={dia} className="flex-1 min-w-[240px] border-b lg:border-b-0 lg:border-r border-slate-100 last:border-r-0">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-center sticky top-0 z-10 backdrop-blur-sm">
                    <h3 className="font-extrabold text-slate-700 text-[15px]">{dia}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {clasesDelDia.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center justify-center opacity-50">
                        <CalendarIcon size={32} className="text-slate-300 mb-2" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-slate-400">Día libre</span>
                      </div>
                    ) : (
                      clasesDelDia.map(clase => (
                        <div key={clase.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                          {clase.tipoCurso === 'TALLER' && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                          )}
                          {clase.tipoCurso !== 'TALLER' && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                          )}
                          
                          <div className="flex items-center gap-2 text-indigo-600 font-black text-sm mb-2">
                            <Clock size={16} />
                            <span>{clase.horaInicio} - {clase.horaFin}</span>
                          </div>
                          
                          <h4 className="font-extrabold text-slate-800 text-[16px] leading-tight mb-1 line-clamp-2">
                            {clase.nombreCurso}
                          </h4>
                          
                          <p className="text-[11px] font-bold text-slate-400 font-mono tracking-widest uppercase mb-4">
                            {clase.codigoCurso}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl w-fit border border-slate-100">
                            <MapPin size={14} className="text-slate-400" />
                            <span>Aula: {clase.aula}</span>
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
