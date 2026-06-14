import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Loader2, Plus, 
  Trash2, Search, AlertTriangle, User, Users, Coffee, X 
} from 'lucide-react';
import api from '../../services/api';
import { crearHorario, eliminarHorario } from '../../services/horarioService';
import HorarioColumna from '../../components/admin/horarios/HorarioColumna';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

const timeToMins = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const checkOverlap = (start1, end1, start2, end2) => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

export default function GestionHorarios({ isEmbedded = false }) {
  const [cursos, setCursos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [todosHorarios, setTodosHorarios] = useState([]);
  const [cargandoBase, setCargandoBase] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');

  // Modal de Programación
  const [mostrandoModal, setMostrandoModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [horarioEditandoId, setHorarioEditandoId] = useState(null);
  const [errorCruce, setErrorCruce] = useState('');
  
  const [nuevoCursoId, setNuevoCursoId] = useState('');
  const [nuevoDia, setNuevoDia] = useState('LUNES');
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState('08:00');
  const [nuevaHoraFin, setNuevaHoraFin] = useState('10:00');
  const [nuevaAula, setNuevaAula] = useState('');

  // Drag & Drop State
  const [draggedItem, setDraggedItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    cargarDatosBase();
  }, []);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    if (e.dataTransfer) e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDropItem = async (e, nuevoDia) => {
    if (!draggedItem) return;
    
    // Si lo soltó en el mismo día
    if (draggedItem.diaSemana === nuevoDia) {
      setDraggedItem(null);
      return;
    }

    const nuevoInicio = timeToMins(draggedItem.horaInicio);
    const nuevoFin = timeToMins(draggedItem.horaFin);
    const aulaSolicitada = draggedItem.aula.trim().toLowerCase();
    const docenteSolicitadoId = draggedItem.curso?.docente?.id;
    const cursoSolicitadoId = draggedItem.curso?.id;

    // Verificar superposición
    for (const h of todosHorarios) {
      if (h.id === draggedItem.id) continue;
      if (h.diaSemana !== nuevoDia) continue;
      
      const hInicio = timeToMins(h.horaInicio);
      const hFin = timeToMins(h.horaFin);
      
      if (checkOverlap(nuevoInicio, nuevoFin, hInicio, hFin)) {
        if (h.curso?.id === cursoSolicitadoId) {
          mostrarToast(`Cruce: El curso ya tiene clase de ${h.horaInicio} a ${h.horaFin} el ${nuevoDia}.`);
          setDraggedItem(null);
          return;
        }
        if (h.aula.trim().toLowerCase() === aulaSolicitada) {
          mostrarToast(`Cruce: El aula "${h.aula}" está ocupada el ${nuevoDia} a esa hora.`);
          setDraggedItem(null);
          return;
        }
        if (docenteSolicitadoId && h.curso?.docente?.id === docenteSolicitadoId) {
          mostrarToast(`Cruce: El profesor ya dicta clase el ${nuevoDia} a esa hora.`);
          setDraggedItem(null);
          return;
        }
      }
    }

    // Update optimista
    const oldHorarios = [...todosHorarios];
    setTodosHorarios(todosHorarios.map(h => 
      h.id === draggedItem.id ? { ...h, diaSemana: nuevoDia } : h
    ));
    setDraggedItem(null);

    try {
      // Intentamos actualizar via PUT
      await api.put(`/horarios/${draggedItem.id}`, { diaSemana: nuevoDia });
      mostrarToast(`Movido al ${nuevoDia} correctamente.`);
    } catch (error) {
      console.error(error);
      mostrarToast("Error al mover clase. Cambios revertidos.");
      setTodosHorarios(oldHorarios);
    }
  };

  async function cargarDatosBase() {
    setCargandoBase(true);
    try {
      const [resCursos, resHorarios, resGrados] = await Promise.all([
        api.get('/cursos').catch(() => ({ data: [] })),
        api.get('/horarios').catch(() => ({ data: [] })),
        api.get('/grados').catch(() => ({ data: [] }))
      ]);
      setCursos(resCursos.data || []);
      setGrados(resGrados.data || []);
      setTodosHorarios(resHorarios.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoBase(false);
    }
  };

  const handleAbrirModal = () => {
    setErrorCruce('');
    setModoEdicion(false);
    setHorarioEditandoId(null);
    setNuevoCursoId('');
    setNuevaHoraInicio('08:00');
    setNuevaHoraFin('10:00');
    setNuevaAula('');
    setMostrandoModal(true);
  };

  const handleEditarItem = (item) => {
    if (item.esRecreo) return;
    setErrorCruce('');
    setModoEdicion(true);
    setHorarioEditandoId(item.id);
    setNuevoCursoId(item.curso?.id?.toString() || '');
    setNuevoDia(item.diaSemana);
    setNuevaHoraInicio(item.horaInicio);
    setNuevaHoraFin(item.horaFin);
    setNuevaAula(item.aula);
    setMostrandoModal(true);
  };

  const handleCrear = async () => {
    setErrorCruce('');
    if (!nuevoCursoId || !nuevaHoraInicio || !nuevaHoraFin || !nuevaAula) {
      setErrorCruce("Por favor, completa todos los campos.");
      return;
    }
    const nuevoInicio = timeToMins(nuevaHoraInicio);
    const nuevoFin = timeToMins(nuevaHoraFin);
    if (nuevoInicio >= nuevoFin) {
      setErrorCruce("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
    if (nuevoInicio < 420 || nuevoFin > 1320) {
      setErrorCruce("El horario debe estar entre las 07:00 y las 22:00.");
      return;
    }

    // --- VALIDACIONES DE CRUCE ---
    const aulaSolicitada = nuevaAula.trim().toLowerCase();
    const cursoSeleccionado = cursos.find(c => c.id === parseInt(nuevoCursoId));
    const docenteSolicitadoId = cursoSeleccionado?.docente?.id;
    const cursoSolicitadoId = cursoSeleccionado?.id;

    for (const h of todosHorarios) {
      if (h.diaSemana !== nuevoDia) continue;
      if (modoEdicion && h.id === horarioEditandoId) continue;
      
      const hInicio = timeToMins(h.horaInicio);
      const hFin = timeToMins(h.horaFin);
      
      if (checkOverlap(nuevoInicio, nuevoFin, hInicio, hFin)) {
        if (h.curso?.id === cursoSolicitadoId) {
          setErrorCruce(`CRUCE DE CURSO: Ya programaste una clase para este curso de ${h.horaInicio} a ${h.horaFin}.`);
          return;
        }
        if (h.aula.trim().toLowerCase() === aulaSolicitada) {
          setErrorCruce(`CRUCE DE AULA: El aula "${h.aula}" ya está reservada para el curso "${h.curso?.nombre || 'Desconocido'}" (${h.horaInicio} - ${h.horaFin}).`);
          return;
        }
        if (docenteSolicitadoId && h.curso?.docente?.id === docenteSolicitadoId) {
          setErrorCruce(`CRUCE DE DOCENTE: El profesor ya debe dictar "${h.curso?.nombre || 'Otro curso'}" de ${h.horaInicio} a ${h.horaFin}.`);
          return;
        }
      }
    }

    try {
      const payload = {
        curso: { id: cursoSolicitadoId },
        diaSemana: nuevoDia,
        horaInicio: nuevaHoraInicio,
        horaFin: nuevaHoraFin,
        aula: nuevaAula
      };
      
      if (modoEdicion) {
        await api.put(`/horarios/${horarioEditandoId}`, payload);
        const horarioActualizado = { ...payload, id: horarioEditandoId, curso: cursoSeleccionado };
        setTodosHorarios(todosHorarios.map(h => h.id === horarioEditandoId ? horarioActualizado : h));
        mostrarToast('Bloque actualizado correctamente.');
      } else {
        const res = await crearHorario(payload);
        const nuevoHorario = { ...res.data, curso: cursoSeleccionado };
        setTodosHorarios([...todosHorarios, nuevoHorario]);
        mostrarToast('Bloque programado correctamente.');
      }
      setMostrandoModal(false);
    } catch (error) {
      setErrorCruce("Error de conexión al intentar guardar el horario.");
    }
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de eliminar este bloque de horario?')) {
      await eliminarHorario(id);
      setTodosHorarios(todosHorarios.filter(h => h.id !== id));
      if (mostrandoModal) setMostrandoModal(false);
      mostrarToast('Bloque eliminado correctamente.');
    }
  };

  // Buscador de horarios
  const horariosFiltrados = todosHorarios.filter(h => {
    // Filtro por Grado
    if (filtroGrado && filtroGrado !== '') {
      // Si el filtro es 'TALLER', filtramos cursos sin grado o tipo TALLER
      if (filtroGrado === 'TALLER') {
        if (h.curso?.grado && h.curso?.tipo !== 'TALLER') return false;
      } else {
        // Filtro por ID de grado normal
        if (h.curso?.grado?.id !== parseInt(filtroGrado)) return false;
      }
    }

    const cursoNombre = h.curso?.nombre?.toLowerCase() || '';
    const docenteNombre = h.curso?.docente ? `${h.curso.docente.nombre} ${h.curso.docente.apellido}`.toLowerCase() : '';
    const term = busqueda.toLowerCase();
    return cursoNombre.includes(term) || docenteNombre.includes(term);
  });

  return (
    <div className={isEmbedded ? "w-full animate-fade-in pb-12 font-sans" : "w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans"}>
      
      {!isEmbedded && (
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar size={14} strokeWidth={2.5} />
              Academia / Horarios
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Gestión de Horarios
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Configura los horarios de clase y asigna cursos para cada grado.
            </p>
          </div>
          
          <button 
            onClick={handleAbrirModal}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Plus size={20} strokeWidth={2.5} />
            NUEVO HORARIO
          </button>
        </header>
      )}

      {/* MASTER CALENDAR */}
      <div className="animate-slide-up flex-1 flex flex-col">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
          
          {/* CONTROL BAR (FILTERS & ACTIONS) */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4 w-full md:w-auto flex-1">
              <div className="min-w-[180px] flex-1 md:flex-none">
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-widest">Filtrar por Grado</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer shadow-sm"
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  <option value="">Todos los Niveles</option>
                  {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  <option value="TALLER">Talleres Extracurriculares</option>
                </select>
              </div>

              <div className="min-w-[220px] flex-1 md:flex-none">
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-widest">Buscar en el horario</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Nombre del curso o docente..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[13px] font-medium text-slate-700 outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

          </div>
          {cargandoBase ? (
            <div className="flex-1 flex justify-center items-center py-32">
              <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {DIAS.map(dia => {
                const recreo = {
                  id: `recreo-${dia}`,
                  esRecreo: true,
                  horaInicio: '10:30',
                  horaFin: '11:00',
                  diaSemana: dia
                };

                const itemsDelDia = [...horariosFiltrados.filter(h => h.diaSemana === dia), recreo]
                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

                return (
                  <HorarioColumna 
                    key={dia} 
                    dia={dia} 
                    items={itemsDelDia} 
                    onEliminar={handleEliminar} 
                    onDragStart={handleDragStart} 
                    onDropItem={handleDropItem}
                    onEdit={handleEditarItem}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-[9999]">
          <AlertTriangle size={18} className="text-amber-400" />
          <span className="font-bold text-sm">{toastMsg}</span>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) */}
      {!isEmbedded && (
        <button 
          onClick={handleAbrirModal}
          className="fixed bottom-5 right-5 z-50 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all group"
          title="Programar Bloque"
        >
          <Plus size={22} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* DRAWER PROGRAMADOR */}
      {mostrandoModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-end p-4 md:pr-12">
          <div className="absolute inset-0 bg-slate-900/20 animate-fade-in" onClick={() => setMostrandoModal(false)} />
          
          <div className="relative w-[90vw] md:w-[400px] bg-white rounded-3xl shadow-2xl flex flex-col animate-fade-in overflow-hidden max-h-[90vh] shrink-0">
            {/* MODAL HEADER */}
            <div className="px-5 py-5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col relative shrink-0">
              <button 
                onClick={() => setMostrandoModal(false)}
                className="absolute top-4 right-4 text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                <CalendarIcon size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">{modoEdicion ? 'Editar Bloque' : 'Programar Bloque'}</h2>
              <p className="text-indigo-200 mt-0.5 font-medium text-xs">{modoEdicion ? 'Modifica los datos del horario asignado' : 'Asigna horario a un curso'}</p>
            </div>
            
            {/* MODAL BODY */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar">
              {errorCruce && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
                  <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 text-red-500" strokeWidth={2.5} />
                  <p className="text-sm font-bold leading-tight">{errorCruce}</p>
                </div>
              )}

              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Curso a Programar</label>
                  <select 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    value={nuevoCursoId}
                    onChange={e => setNuevoCursoId(e.target.value)}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                  >
                    <option value="">-- Selecciona un curso --</option>
                    {cursos.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.grado?.nombre || 'Taller'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Día de la Semana</label>
                  <select 
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    value={nuevoDia}
                    onChange={e => setNuevoDia(e.target.value)}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                  >
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Hora Inicio</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={nuevaHoraInicio}
                      onChange={e => setNuevaHoraInicio(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Hora Fin</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={nuevaHoraFin}
                      onChange={e => setNuevaHoraFin(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">Aula / Ubicación</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={nuevaAula}
                      onChange={e => setNuevaAula(e.target.value)}
                      placeholder="Ej. Aula 101, Lab..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
              {modoEdicion && (
                <button 
                  onClick={() => handleEliminar(horarioEditandoId)}
                  className="px-3 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-[13px] hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center"
                  title="Eliminar este bloque"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setMostrandoModal(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[13px] hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCrear}
                className="flex-[1.5] py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[14px] hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2"
              >
                <CalendarIcon size={16} />
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
