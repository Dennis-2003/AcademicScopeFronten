import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, FileText, Send, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MisTareas() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (user?.id) cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Obtener todas las asignaciones del estudiante
      const resAsig = await api.get(`/asignaciones/estudiante/${user.id}`);
      // 2. Obtener las entregas que ya hizo
      const resEntregas = await api.get(`/entregas/estudiante/${user.id}`);
      
      setAsignaciones(resAsig.data);
      setEntregas(resEntregas.data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setCargando(false);
    }
  };

  const getEntrega = (asignacionId) => {
    return entregas.find(e => e.asignacion?.id === asignacionId);
  };

  const isVencida = (fechaISO) => {
    return new Date() > new Date(fechaISO);
  };

  const handleAbrirTarea = (asig) => {
    setTareaSeleccionada(asig);
    const entrega = getEntrega(asig.id);
    setArchivoUrl(entrega ? entrega.archivoUrl : '');
  };

  const handleEnviarTarea = async () => {
    if (!archivoUrl.trim()) return alert("Por favor ingresa tu respuesta o enlace.");
    
    setEnviando(true);
    try {
      const payload = {
        asignacion: { id: tareaSeleccionada.id },
        estudiante: { id: user.id },
        archivoUrl: archivoUrl,
        cumplio: null,
        retroalimentacion: ''
      };
      await api.post('/entregas', payload);
      alert("¡Tarea entregada con éxito!");
      setTareaSeleccionada(null);
      cargarDatos();
    } catch (e) {
      alert("Error al enviar la tarea.");
    } finally {
      setEnviando(false);
    }
  };

  const formatFecha = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (cargando) {
    return <div className="flex justify-center py-20 text-indigo-500 font-bold">Cargando tus tareas...</div>;
  }

  // Filtrar pendientes vs completadas
  const tareasPendientes = asignaciones.filter(a => !getEntrega(a.id) && !isVencida(a.fechaVencimiento));
  const tareasAtrasadas = asignaciones.filter(a => !getEntrega(a.id) && isVencida(a.fechaVencimiento));
  const tareasCompletadas = asignaciones.filter(a => getEntrega(a.id));

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mis Tareas</h1>
        <p className="text-slate-500 mt-1">Revisa tus trabajos pendientes y sube tus respuestas.</p>
      </header>

      {/* TAREAS PENDIENTES */}
      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-amber-500" /> Tareas Pendientes ({tareasPendientes.length})
        </h2>
        {tareasPendientes.length === 0 ? (
          <p className="text-slate-400 text-sm italic">¡Genial! No tienes tareas pendientes por ahora.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tareasPendientes.map(asig => (
              <div onClick={() => handleAbrirTarea(asig)} key={asig.id} className="bg-white rounded-2xl border border-amber-200/50 p-5 shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-amber-400">
                <h3 className="font-bold text-slate-800 truncate mb-1">{asig.titulo}</h3>
                <p className="text-xs text-slate-500 mb-3">{asig.curso.nombre}</p>
                <div className="flex items-center gap-1.5 text-amber-600 text-[11px] font-bold bg-amber-50 px-2 py-1 rounded w-max">
                  <Clock size={12} /> Vence: {formatFecha(asig.fechaVencimiento)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TAREAS ATRASADAS */}
      {tareasAtrasadas.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-rose-700 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-rose-500" /> Tareas Atrasadas ({tareasAtrasadas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tareasAtrasadas.map(asig => (
              <div onClick={() => handleAbrirTarea(asig)} key={asig.id} className="bg-white rounded-2xl border border-rose-200/50 p-5 shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-rose-400 opacity-80">
                <h3 className="font-bold text-slate-800 truncate mb-1">{asig.titulo}</h3>
                <p className="text-xs text-slate-500 mb-3">{asig.curso.nombre}</p>
                <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold bg-rose-50 px-2 py-1 rounded w-max">
                  <AlertCircle size={12} /> Venció: {formatFecha(asig.fechaVencimiento)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAREAS COMPLETADAS */}
      <section>
        <h2 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2 pt-4 border-t border-slate-200">
          <CheckCircle2 size={20} className="text-emerald-500" /> Historial de Entregas ({tareasCompletadas.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tareasCompletadas.map(asig => {
            const entrega = getEntrega(asig.id);
            return (
              <div onClick={() => handleAbrirTarea(asig)} key={asig.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md cursor-pointer transition-all">
                <h3 className="font-bold text-slate-800 truncate mb-1">{asig.titulo}</h3>
                <p className="text-xs text-slate-500 mb-3">{asig.curso.nombre}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 size={12} /> Entregado
                  </span>
                  {entrega.cumplio !== null && (
                    <span className={`text-[11px] font-bold px-2 py-1 rounded ${entrega.cumplio ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                      {entrega.cumplio ? 'Cumplió' : 'No Cumplió'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DETALLE DE TAREA */}
      {tareaSeleccionada && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start shrink-0">
              <div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{tareaSeleccionada.curso.nombre}</span>
                <h2 className="text-xl font-extrabold text-slate-800 mt-1">{tareaSeleccionada.titulo}</h2>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-6 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <Calendar size={16} /> Vencimiento: <span className={isVencida(tareaSeleccionada.fechaVencimiento) ? 'text-rose-500' : 'text-slate-800'}>{formatFecha(tareaSeleccionada.fechaVencimiento)}</span>
              </div>

              {getEntrega(tareaSeleccionada.id) ? (
                // VISTA DE TAREA ENTREGADA
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800">
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><CheckCircle2 size={16}/> Tu entrega:</h4>
                    <p className="text-sm whitespace-pre-wrap">{getEntrega(tareaSeleccionada.id).archivoUrl}</p>
                  </div>
                  
                  {getEntrega(tareaSeleccionada.id).retroalimentacion && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-900">
                      <h4 className="font-bold text-sm mb-1 text-indigo-600">Comentario del Docente:</h4>
                      <p className="text-sm italic">"{getEntrega(tareaSeleccionada.id).retroalimentacion}"</p>
                    </div>
                  )}
                </div>
              ) : (
                // VISTA PARA ENTREGAR
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Envía tu trabajo:</label>
                    <textarea 
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all"
                      placeholder="Escribe tu respuesta aquí o pega el enlace a tu documento (Drive, OneDrive, etc.)..."
                      value={archivoUrl}
                      onChange={e => setArchivoUrl(e.target.value)}
                    ></textarea>
                    <p className="text-xs text-slate-400 mt-2">Asegúrate de dar permisos de lectura si envías un enlace.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
              <button 
                onClick={() => setTareaSeleccionada(null)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
              {!getEntrega(tareaSeleccionada.id) && (
                <button 
                  onClick={handleEnviarTarea}
                  disabled={enviando}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} /> {enviando ? 'Enviando...' : 'Enviar Tarea'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
