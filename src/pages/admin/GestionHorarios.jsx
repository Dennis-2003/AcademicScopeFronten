import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Loader2, Plus, 
  Trash2, BookOpen, Search, AlertTriangle, GraduationCap, 
  ArrowLeft, Users, User, BookMarked, Rocket 
} from 'lucide-react';
import api from '../../services/api';
import { obtenerHorariosPorCurso, crearHorario, eliminarHorario } from '../../services/horarioService';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

const timeToMins = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const checkOverlap = (start1, end1, start2, end2) => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

export default function GestionHorarios() {
  // Datos Globales
  const [grados, setGrados] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [todosHorarios, setTodosHorarios] = useState([]);
  const [cargandoBase, setCargandoBase] = useState(false);
  const [filtro, setFiltro] = useState('');

  // Navegación (Pasos: 1 = Grados, 2 = Cursos, 3 = Calendario)
  const [paso, setPaso] = useState(1);
  const [gradoActivo, setGradoActivo] = useState(null);
  const [cursoActivo, setCursoActivo] = useState(null);
  
  // Datos específicos del curso
  const [horariosCurso, setHorariosCurso] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  
  // Modal de Programación
  const [mostrandoModal, setMostrandoModal] = useState(false);
  const [errorCruce, setErrorCruce] = useState('');
  const [nuevoDia, setNuevoDia] = useState('LUNES');
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState('08:00');
  const [nuevaHoraFin, setNuevaHoraFin] = useState('10:00');
  const [nuevaAula, setNuevaAula] = useState('');

  useEffect(() => {
    cargarDatosBase();
  }, []);

  const cargarDatosBase = async () => {
    setCargandoBase(true);
    try {
      const [resGrados, resCursos, resHorarios] = await Promise.all([
        api.get('/grados').catch(() => ({ data: [] })),
        api.get('/cursos').catch(() => ({ data: [] })),
        api.get('/horarios').catch(() => ({ data: [] }))
      ]);
      setGrados(resGrados.data || []);
      setCursos(resCursos.data || []);
      setTodosHorarios(resHorarios.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoBase(false);
    }
  };

  const seleccionarGrado = (grado) => {
    setGradoActivo(grado);
    setFiltro('');
    setPaso(2);
  };

  const seleccionarCurso = async (curso) => {
    setCursoActivo(curso);
    setPaso(3);
    setCargandoHorarios(true);
    try {
      const data = await obtenerHorariosPorCurso(curso.id);
      setHorariosCurso(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const volverAGrados = () => {
    setGradoActivo(null);
    setFiltro('');
    setPaso(1);
  };

  const volverACursos = () => {
    setCursoActivo(null);
    setPaso(2);
  };

  const handleAbrirModal = () => {
    setErrorCruce('');
    setNuevaHoraInicio('08:00');
    setNuevaHoraFin('10:00');
    setNuevaAula('');
    setMostrandoModal(true);
  };

  const handleCrear = async () => {
    setErrorCruce('');
    if (!nuevaHoraInicio || !nuevaHoraFin || !nuevaAula) {
      setErrorCruce("Por favor, completa todos los campos.");
      return;
    }
    const nuevoInicio = timeToMins(nuevaHoraInicio);
    const nuevoFin = timeToMins(nuevaHoraFin);
    if (nuevoInicio >= nuevoFin) {
      setErrorCruce("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    // --- VALIDACIONES DE CRUCE ---
    const aulaSolicitada = nuevaAula.trim().toLowerCase();
    const docenteSolicitadoId = cursoActivo.docente?.id;

    for (const h of todosHorarios) {
      if (h.diaSemana !== nuevoDia) continue;
      const hInicio = timeToMins(h.horaInicio);
      const hFin = timeToMins(h.horaFin);
      if (checkOverlap(nuevoInicio, nuevoFin, hInicio, hFin)) {
        if (h.aula.trim().toLowerCase() === aulaSolicitada) {
          setErrorCruce(`CRUCE DE AULA: El aula "${h.aula}" ya está reservada para el curso "${h.curso?.nombre || 'Desconocido'}" (${h.horaInicio} - ${h.horaFin}).`);
          return;
        }
        if (docenteSolicitadoId && h.curso?.docente?.id === docenteSolicitadoId) {
          setErrorCruce(`CRUCE DE DOCENTE: El profesor ya debe dictar "${h.curso?.nombre || 'Otro curso'}" en el horario de ${h.horaInicio} a ${h.horaFin}.`);
          return;
        }
      }
    }

    try {
      const payload = {
        curso: { id: cursoActivo.id },
        diaSemana: nuevoDia,
        horaInicio: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        aula: nuevaAula
      };
      const res = await crearHorario(payload);
      setHorariosCurso([...horariosCurso, res.data]);
      setTodosHorarios([...todosHorarios, res.data]);
      setMostrandoModal(false);
    } catch (error) {
      setErrorCruce("Error de conexión al intentar guardar el horario.");
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de eliminar este bloque de horario?')) {
      await eliminarHorario(id);
      setHorariosCurso(horariosCurso.filter(h => h.id !== id));
      setTodosHorarios(todosHorarios.filter(h => h.id !== id));
    }
  };

  // Lógica para agrupar en Vista 1
  const talleres = cursos.filter(c => !c.grado || c.tipo === 'TALLER');
  
  // Lógica para filtrar en Vista 2
  const cursosDelGradoActivo = gradoActivo?.isTaller 
    ? talleres 
    : cursos.filter(c => c.grado && c.grado.id === gradoActivo?.id);
    
  const cursosFiltrados = cursosDelGradoActivo.filter(c => 
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    (c.codigo && c.codigo.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans relative">
      
      {/* HEADER DINÁMICO */}
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <CalendarIcon size={14} strokeWidth={2.5} />
            Administración / Horarios
          </div>
          
          {paso === 1 && (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Selecciona un Nivel</h1>
              <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Elige el grado para administrar los horarios de sus cursos.</p>
            </>
          )}
          
          {paso === 2 && (
            <div className="flex items-center gap-4 animate-fade-in">
              <button 
                onClick={volverAGrados}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex-shrink-0"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{gradoActivo.nombre}</h1>
                <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Selecciona un curso de este nivel para programar sus clases.</p>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="flex items-center gap-4 animate-fade-in">
              <button 
                onClick={volverACursos}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm flex-shrink-0"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{cursoActivo.nombre}</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-white border border-slate-200 text-slate-500 mt-1">
                    {cursoActivo.codigo || 'S/C'}
                  </span>
                </div>
                <p className="text-indigo-600 font-bold mt-1 text-sm md:text-base flex items-center gap-1.5">
                  <User size={16} /> 
                  Prof. {cursoActivo.docente ? `${cursoActivo.docente.nombre} ${cursoActivo.docente.apellido}` : 'No Asignado'}
                </p>
              </div>
            </div>
          )}
        </div>

        {paso === 3 && (
          <button 
            onClick={handleAbrirModal}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0.5 shrink-0 animate-slide-up"
          >
            <Plus size={20} strokeWidth={2.5} />
            AGREGAR BLOQUE
          </button>
        )}
      </header>

      {/* VISTA 1: GRID DE GRADOS */}
      {paso === 1 && (
        <div className="animate-fade-in">
          {cargandoBase ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {grados.map(grado => (
                <button 
                  key={grado.id}
                  onClick={() => seleccionarGrado({...grado, isTaller: false})}
                  className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 text-left group"
                >
                  <div className="flex items-start justify-between w-full mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner transition-transform group-hover:scale-105 bg-indigo-50 text-indigo-500">
                      {grado.nombre.match(/^\d+/)?.[0] || 'G'}
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <BookMarked size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight mb-1">{grado.nombre}</h3>
                    <p className="text-sm font-medium text-slate-500">Nivel {grado.nivel}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver cursos y programar &rarr;
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              
              {talleres.length > 0 && (
                <button 
                  onClick={() => seleccionarGrado({ id: 'talleres', nombre: 'Talleres Libres', isTaller: true })}
                  className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 text-left group"
                >
                  <div className="flex items-start justify-between w-full mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner transition-transform group-hover:scale-105 bg-amber-50 text-amber-500">
                      TE
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                      <Rocket size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight mb-1">Talleres Extracurriculares</h3>
                    <p className="text-sm font-medium text-slate-500">Cursos sin grado</p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-amber-600 group-hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver talleres y programar &rarr;
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: GRID DE CURSOS */}
      {paso === 2 && (
        <div className="animate-slide-up">
          <div className="mb-6 bg-white p-2.5 rounded-2xl border border-slate-200/70 shadow-sm inline-block">
            <div className="relative w-full sm:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar curso por nombre o código..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-700 outline-none"
              />
            </div>
          </div>

          {cursosFiltrados.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
              <BookOpen size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No hay cursos</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">No se encontraron cursos en esta categoría que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosFiltrados.map(curso => (
                <button 
                  key={curso.id} 
                  onClick={() => seleccionarCurso(curso)}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 group relative text-left"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{curso.nombre}</h4>
                      <p className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">{curso.codigo || 'S/C'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 mt-auto flex items-center gap-3 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    {curso.docente ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {curso.docente.nombre?.charAt(0)}{curso.docente.apellido?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Docente</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{curso.docente.nombre} {curso.docente.apellido}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-dashed border-slate-300 text-slate-400 flex items-center justify-center flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Docente</p>
                          <p className="text-sm font-medium text-slate-400 italic">Sin asignar</p>
                        </div>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 3: CALENDARIO FULL-WIDTH */}
      {paso === 3 && (
        <div className="animate-slide-up">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            {cargandoHorarios ? (
              <div className="flex-1 flex justify-center items-center py-32">
                <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col lg:flex-row">
                {DIAS.map(dia => {
                  const clasesDelDia = horariosCurso.filter(h => h.diaSemana === dia).sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
                  return (
                    <div key={dia} className="flex-1 min-w-[200px] border-b lg:border-b-0 lg:border-r border-slate-100 last:border-r-0">
                      <div className="p-5 border-b border-slate-100 bg-slate-50/50 text-center sticky top-0 backdrop-blur-sm">
                        <h3 className="font-extrabold text-slate-800 text-[15px] uppercase tracking-wider">{dia}</h3>
                      </div>
                      <div className="p-5 space-y-4">
                        {clasesDelDia.length === 0 ? (
                          <div className="text-center py-12 flex flex-col items-center opacity-30">
                            <Clock size={32} className="mb-3 text-slate-400" />
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Libre</span>
                          </div>
                        ) : (
                          clasesDelDia.map(clase => (
                            <div key={clase.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group relative hover:shadow-lg hover:-translate-y-1 hover:border-indigo-300 transition-all overflow-hidden">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                              <button 
                                onClick={() => handleEliminar(clase.id)}
                                className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 p-1.5 rounded-lg"
                                title="Eliminar Bloque"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                              
                              <div className="flex items-center gap-2 text-indigo-600 font-black text-[15px] mb-4">
                                <Clock size={16} />
                                <span>{clase.horaInicio} - {clase.horaFin}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-flex">
                                <MapPin size={14} className="text-slate-400" />
                                Aula: {clase.aula}
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
      )}

      {/* MODAL PROGRAMADOR */}
      {mostrandoModal && createPortal(
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" 
          style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onMouseDown={() => setMostrandoModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden text-left"
            style={{ width: '100%', minWidth: '320px', maxWidth: '450px', margin: 'auto', position: 'relative' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 bg-indigo-600 text-white flex items-center gap-3">
              <CalendarIcon size={24} strokeWidth={2.5} />
              <div>
                <h2 className="text-xl font-bold">Programar Bloque</h2>
                <p className="text-indigo-200 text-xs font-medium">{cursoActivo.nombre}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {errorCruce && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 text-red-500" strokeWidth={2.5} />
                  <p className="text-sm font-bold leading-tight">{errorCruce}</p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Día de la Semana</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                  value={nuevoDia}
                  onChange={e => setNuevoDia(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Hora Inicio</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={nuevaHoraInicio}
                    onChange={e => setNuevaHoraInicio(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Hora Fin</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={nuevaHoraFin}
                    onChange={e => setNuevaHoraFin(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Aula / Ubicación</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={nuevaAula}
                  onChange={e => setNuevaAula(e.target.value)}
                  placeholder="Ej. Aula 101, Laboratorio B..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setMostrandoModal(false)}
                className="flex-1 py-3.5 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-[14px] hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCrear}
                className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-[14px] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Guardar y Validar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
