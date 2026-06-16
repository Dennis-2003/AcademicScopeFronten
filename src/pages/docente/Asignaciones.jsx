import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Clock, CheckCircle2, FileText, MoreVertical, Loader2, X, Search, Users, ExternalLink, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerAsignacionesPorCurso, crearAsignacion } from '../../services/asignacionService';
import api from '../../services/api';

export default function Asignaciones() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrandoModal, setMostrandoModal] = useState(false);

  // Modal de revisión de entregas
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  // Estados para nueva asignacion (Tarea)
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoCursoId, setNuevoCursoId] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    if (user?.id) {
      cargarDatos();
    }
  }, [user]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const cursosData = await obtenerCursosPorDocente(user.id);
      setCursos(cursosData);
      
      let todasLasAsignaciones = [];
      for (const curso of cursosData) {
        const asigs = await obtenerAsignacionesPorCurso(curso.id);
        const conCurso = asigs.map(a => ({ ...a, nombreCurso: curso.nombre, gradoCurso: curso.grado?.nombre }));
        todasLasAsignaciones = [...todasLasAsignaciones, ...conCurso];
      }
      
      todasLasAsignaciones.sort((a,b) => b.id - a.id);
      setAsignaciones(todasLasAsignaciones);
      
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async () => {
    if(!nuevoTitulo || !nuevoCursoId || !nuevaFecha) return alert('Completa todos los campos');
    
    try {
      const payload = {
        curso: { id: parseInt(nuevoCursoId) },
        titulo: nuevoTitulo,
        descripcion: '',
        fechaVencimiento: new Date(nuevaFecha).toISOString(),
        estado: 'ACTIVA'
      };
      await crearAsignacion(payload);
      setMostrandoModal(false);
      setNuevoTitulo('');
      setNuevaFecha('');
      cargarDatos(); 
    } catch (err) {
      console.error("Error al crear", err);
      alert("No se pudo crear la tarea");
    }
  };

  const formatFecha = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Tareas y Trabajos</h1>
          <p className="text-slate-500 text-sm mt-1">Crea tareas, actividades y revisa las entregas de tus alumnos.</p>
        </div>
        <button 
          onClick={() => setMostrandoModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200"
        >
          <Plus size={18} />
          Nueva Tarea
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : asignaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm">
          No tienes tareas asignadas a tus alumnos en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignaciones.map((asig) => (
            <div 
              key={asig.id} 
              onClick={() => setTareaSeleccionada(asig)}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow p-5 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${asig.estado === 'ACTIVA' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <FileText size={20} />
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={18} />
                </button>
              </div>
              <h3 className="font-bold text-slate-800 mb-1 truncate" title={asig.titulo}>{asig.titulo}</h3>
              <p className="text-xs font-medium text-slate-500 mb-4 truncate">{asig.nombreCurso} - {asig.gradoCurso}</p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {asig.estado === 'ACTIVA' ? (
                    <Clock size={14} className="text-amber-500" />
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  )}
                  <span className={`text-[11px] font-bold ${asig.estado === 'ACTIVA' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    Vence: {formatFecha(asig.fechaVencimiento)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR TAREA */}
      {mostrandoModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] p-4 flex justify-center items-center overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-[90vw] md:w-[480px] shrink-0 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Crear Nueva Tarea</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Curso</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    value={nuevoCursoId}
                    onChange={e => setNuevoCursoId(e.target.value)}
                  >
                    <option value="">Selecciona un curso...</option>
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Título de la Tarea</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    value={nuevoTitulo}
                    onChange={e => setNuevoTitulo(e.target.value)}
                    placeholder="Ej. Ejercicios de Álgebra"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Fecha de Vencimiento</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    value={nuevaFecha}
                    onChange={e => setNuevaFecha(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setMostrandoModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCrear}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Guardar Tarea
                  </button>
                </div>
              </div>
            </div>
        </div>,
        document.body
      )}

      {/* MODAL REVISIÓN DE ENTREGAS */}
      {tareaSeleccionada && createPortal(
        <RevisionEntregasModal 
          tarea={tareaSeleccionada} 
          onClose={() => setTareaSeleccionada(null)} 
        />,
        document.body
      )}
    </div>
  );
}

// Sub-componente para limpiar Asignaciones.jsx
function RevisionEntregasModal({ tarea, onClose }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para la calificación en curso
  const [revisandoEstudiante, setRevisandoEstudiante] = useState(null);
  const [cumplio, setCumplio] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [tarea]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [matRes, entRes] = await Promise.all([
        api.get(`/matriculas/curso/${tarea.curso.id}`),
        api.get(`/asignaciones/${tarea.id}/entregas`)
      ]);
      
      const activos = matRes.data.filter(m => m.estado !== 'RETIRADA').map(m => m.estudiante);
      setEstudiantes(activos);
      setEntregas(entRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarRevision = async () => {
    const entrega = getEntrega(revisandoEstudiante.id);
    if (!entrega) return;

    setGuardando(true);
    try {
      await api.put(`/entregas/${entrega.id}/revisar`, {
        cumplio,
        retroalimentacion: feedback
      });
      setRevisandoEstudiante(null);
      cargarDatos(); // Recargar para reflejar cambios
    } catch (e) {
      alert("Error al guardar revisión.");
    } finally {
      setGuardando(false);
    }
  };

  const getEntrega = (estId) => {
    return entregas.find(e => e.estudiante.id === estId);
  };

  const filtrados = estudiantes.filter(e => 
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderVistaPrevia = (contenido) => {
    if (!contenido) return <p className="text-sm text-slate-400 italic">No hay contenido adjunto.</p>;
    
    const url = String(contenido).trim();
    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
    const isPdf = url.match(/\.(pdf)$/i);
    const isUrl = url.startsWith('http://') || url.startsWith('https://');

    if (isImage && isUrl) {
      return (
        <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden max-w-full sm:max-w-md bg-slate-50">
          <img src={url} alt="Entrega" className="w-full h-auto object-contain max-h-64" />
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-2 text-xs font-bold bg-white hover:bg-slate-50 text-indigo-600 border-t border-slate-200 transition-colors">
            <ExternalLink size={14} /> Abrir imagen completa
          </a>
        </div>
      );
    }
    
    if (isPdf && isUrl) {
      return (
        <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden h-[400px] flex flex-col bg-slate-50">
          <iframe src={url} className="w-full flex-1" title="Visor de PDF" />
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-2 text-xs font-bold bg-white hover:bg-slate-50 text-indigo-600 border-t border-slate-200 transition-colors">
            <ExternalLink size={14} /> Abrir PDF en nueva pestaña
          </a>
        </div>
      );
    }

    if (isUrl) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium text-sm transition-colors">
          <ExternalLink size={16} /> Abrir enlace entregado
        </a>
      );
    }

    // Texto plano
    return <p className="text-sm text-slate-800 whitespace-pre-wrap mt-2 bg-slate-50 p-4 rounded-lg border border-slate-100">{url}</p>;
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Fondo totalmente transparente, sin desenfoque ni oscurecimiento */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white h-full shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-slide-in-right shrink-0">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h3 className="text-xl font-black text-slate-800">{tarea.titulo}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Revisión de Tareas</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          {cargando ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          ) : (
            <>
              {/* Buscador */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar estudiante..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>

              {/* Lista de Estudiantes */}
              <div className="space-y-3">
                {filtrados.map(est => {
                  const entrega = getEntrega(est.id);
                  const isRevisando = revisandoEstudiante?.id === est.id;

                  return (
                    <div key={est.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                            {est.nombre.charAt(0)}{est.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{est.nombre} {est.apellido}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              {entrega ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Entregado</span>
                              ) : (
                                <span className="text-amber-500 font-bold flex items-center gap-1"><Clock size={12}/> Pendiente</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {entrega && !isRevisando && (
                          <div className="flex items-center gap-3">
                            {entrega.cumplio !== null && (
                              <span className={`text-xs font-bold px-2 py-1 rounded ${entrega.cumplio ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                                {entrega.cumplio ? 'Cumplió' : 'No Cumplió'}
                              </span>
                            )}
                            <button 
                              onClick={() => {
                                setRevisandoEstudiante(est);
                                setCumplio(entrega.cumplio !== false);
                                setFeedback(entrega.retroalimentacion || '');
                              }}
                              className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                            >
                              Ver / Calificar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Panel de Revisión Desplegado */}
                      {isRevisando && entrega && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 animate-fade-in space-y-4">
                          <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Trabajo del Estudiante</h4>
                            {renderVistaPrevia(entrega.archivoUrl)}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-auto">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Calificación</label>
                              <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit">
                                <button 
                                  onClick={() => setCumplio(true)}
                                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${cumplio ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                  Cumplió
                                </button>
                                <button 
                                  onClick={() => setCumplio(false)}
                                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!cumplio ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                  No Cumplió
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 w-full">
                              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Comentario (Opcional)</label>
                              <textarea 
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-indigo-500 min-h-[80px] bg-white shadow-sm"
                                placeholder="Escribe un feedback al alumno..."
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setRevisandoEstudiante(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancelar</button>
                            <button onClick={handleGuardarRevision} disabled={guardando} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-sm">
                              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              Guardar Revisión
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
