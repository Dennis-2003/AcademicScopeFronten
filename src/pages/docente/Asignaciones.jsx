import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Clock, CheckCircle2, FileText, MoreVertical, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerAsignacionesPorCurso, crearAsignacion } from '../../services/asignacionService';

export default function Asignaciones() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrandoModal, setMostrandoModal] = useState(false);

  // Estados para nueva asignacion (Tarea)
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoCursoId, setNuevoCursoId] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    if (user?.id) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
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
            <div key={asig.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow p-5 group cursor-pointer">
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
          <div className="bg-white rounded-3xl p-6 w-[90%] max-w-[450px] shadow-xl animate-fade-in mx-auto">
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
    </div>
  );
}
