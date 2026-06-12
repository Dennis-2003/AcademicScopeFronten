import React, { useState, useEffect } from 'react';
import { CalendarDays, BookOpen, Users, UserCheck, ChevronLeft, CheckCircle2, Clock, XCircle, FileText, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Asistencia() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistenciasMap, setAsistenciasMap] = useState({});
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get(`/cursos/docente/${user.id}`).then(r => setCursos(r.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (cursoSeleccionado && fecha) {
      cargarDatosAsistencia();
    }
  }, [cursoSeleccionado, fecha]);

  const cargarDatosAsistencia = async () => {
    setCargando(true);
    try {
      const matRes = await api.get(`/matriculas/curso/${cursoSeleccionado.id}`);
      const alumnosValidos = matRes.data
        .filter(m => m.estado !== 'RETIRADA')
        .map(m => m.estudiante)
        .sort((a, b) => a.apellido.localeCompare(b.apellido));
      
      setEstudiantes(alumnosValidos);

      const asisRes = await api.get(`/asistencias/curso/${cursoSeleccionado.id}/fecha/${fecha}`);
      
      const stateMap = {};
      alumnosValidos.forEach(est => {
        const registrada = asisRes.data.find(a => a.estudiante.id === est.id);
        if (registrada) {
          stateMap[est.id] = { id: registrada.id, tipo: registrada.tipo };
        } else {
          stateMap[est.id] = { id: null, tipo: 'PRESENTE' };
        }
      });
      setAsistenciasMap(stateMap);
      
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleEstadoChange = (estudianteId, nuevoTipo) => {
    setAsistenciasMap(prev => ({
      ...prev,
      [estudianteId]: { ...prev[estudianteId], tipo: nuevoTipo }
    }));
  };

  const handleSave = async () => {
    setGuardando(true);
    try {
      const promises = estudiantes.map(est => {
        const payload = {
          estudiante: { id: est.id },
          curso: { id: cursoSeleccionado.id },
          fecha: fecha,
          tipo: asistenciasMap[est.id].tipo,
          observacion: ''
        };
        if (asistenciasMap[est.id].id) {
          payload.id = asistenciasMap[est.id].id;
          return api.put(`/asistencias/${payload.id}`, payload);
        }
        return api.post('/asistencias', payload);
      });

      await Promise.all(promises);
      await cargarDatosAsistencia();
      alert("Asistencia guardada correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar asistencia");
    } finally {
      setGuardando(false);
    }
  };

  const OptionButton = ({ estId, tipo, currentTipo, colorClass, icon: Icon, label }) => {
    const isSelected = currentTipo === tipo;
    return (
      <button
        onClick={() => handleEstadoChange(estId, tipo)}
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all shadow-sm ${
          isSelected 
            ? `${colorClass} scale-110` 
            : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300'
        }`}
        title={label}
      >
        <Icon size={14} strokeWidth={isSelected ? 3 : 2} />
      </button>
    );
  };

  if (!cursoSeleccionado) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Registro de Asistencia</h1>
          <p className="text-slate-500 text-sm mt-1">Selecciona un curso para tomar asistencia.</p>
        </div>

        {cursos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarDays size={32} className="text-slate-300" />
            </div>
            No tienes cursos asignados actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map(curso => (
              <div 
                key={curso.id} 
                onClick={() => setCursoSeleccionado(curso)}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck size={28} />
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {curso.codigo || 'CURSO'}
                  </span>
                </div>
                
                <h3 className="text-xl font-extrabold text-slate-800 mb-1">{curso.nombre}</h3>
                <p className="text-sm font-bold text-indigo-600 mb-6">{curso.grado?.nombre || 'General'}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-bold text-sm">
                  <span>Tomar Asistencia</span>
                  <ChevronLeft size={18} className="rotate-180 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => setCursoSeleccionado(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-wider mb-2"
          >
            <ChevronLeft size={14} /> Volver a Cursos
          </button>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{cursoSeleccionado.nombre}</h1>
          <p className="text-slate-500 text-sm mt-1">Registra la asistencia para la fecha seleccionada.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700 shadow-sm"
          />
          <button 
            onClick={handleSave}
            disabled={guardando || cargando}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {guardando ? "Guardando..." : "Guardar Registro"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 min-h-[400px]">
        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay alumnos matriculados en este curso.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-12">Nº</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Estudiante</th>
                  <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Estado ( P - T - F - J )</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est, index) => {
                  const currentTipo = asistenciasMap[est.id]?.tipo || 'PRESENTE';
                  return (
                    <tr key={est.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-slate-400">{index + 1}</td>
                      <td className="py-4">
                        <div className="font-bold text-slate-800 text-sm">{est.apellido}, {est.nombre}</div>
                        <div className="text-xs text-slate-400">DNI: {est.dni}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <OptionButton estId={est.id} tipo="PRESENTE" currentTipo={currentTipo} colorClass="bg-emerald-500 border-emerald-600 text-white" icon={CheckCircle2} label="Presente" />
                          <OptionButton estId={est.id} tipo="TARDANZA" currentTipo={currentTipo} colorClass="bg-amber-400 border-amber-500 text-white" icon={Clock} label="Tardanza" />
                          <OptionButton estId={est.id} tipo="FALTA" currentTipo={currentTipo} colorClass="bg-red-500 border-red-600 text-white" icon={XCircle} label="Falta" />
                          <OptionButton estId={est.id} tipo="JUSTIFICADO" currentTipo={currentTipo} colorClass="bg-blue-500 border-blue-600 text-white" icon={FileText} label="Justificado" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
