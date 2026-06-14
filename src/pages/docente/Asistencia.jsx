import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, UserCheck, ChevronLeft, CheckCircle2, Clock, 
  XCircle, FileText, Save, Loader2, Search, CheckCheck, Users 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Avatars helpers
const getInitials = (nombre, apellido) => {
  return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 'bg-emerald-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Asistencia() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistenciasMap, setAsistenciasMap] = useState({});
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Novedades: Buscador y estados no guardados
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  async function cargarDatosAsistencia() {
    setCargando(true);
    setHasUnsavedChanges(false);
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
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = () => {
    setAsistenciasMap(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key].tipo = 'PRESENTE';
      });
      return newState;
    });
    setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar asistencia");
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado
  const filteredEstudiantes = estudiantes.filter(est => {
    const fullName = `${est.nombre} ${est.apellido}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || est.dni.includes(searchQuery);
  });

  // Estadísticas
  const stats = estudiantes.reduce((acc, est) => {
    const tipo = asistenciasMap[est.id]?.tipo || 'PRESENTE';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, { PRESENTE: 0, TARDANZA: 0, FALTA: 0, JUSTIFICADO: 0 });

  const OptionButton = ({ estId, tipo, currentTipo, colorClass, borderClass, icon: Icon, label }) => {
    const isSelected = currentTipo === tipo;
    return (
      <button
        onClick={() => handleEstadoChange(estId, tipo)}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 shadow-sm ${
          isSelected 
            ? `${colorClass} scale-110 text-white ring-2 ring-offset-1 ${borderClass.replace('border-', 'ring-')}` 
            : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
        }`}
        title={label}
      >
        <Icon size={16} strokeWidth={isSelected ? 3 : 2} />
      </button>
    );
  };

  if (!cursoSeleccionado) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Cursos Asignados</h1>
          <p className="text-slate-500 mt-2 text-lg">Selecciona un curso para gestionar su asistencia hoy.</p>
        </div>

        {cursos.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <CalendarDays size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Sin cursos</h3>
            <p>No tienes cursos asignados actualmente en el sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.map(curso => (
              <div 
                key={curso.id} 
                onClick={() => setCursoSeleccionado(curso)}
                className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
                    <UserCheck size={32} />
                  </div>
                  <span className="bg-white border border-slate-100 text-slate-500 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {curso.codigo || 'CURSO'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-900 transition-colors">{curso.nombre}</h3>
                <p className="text-sm font-bold text-indigo-500/80 mb-8 uppercase tracking-wide">{curso.grado?.nombre || 'General'}</p>
                
                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-bold text-sm group-hover:text-indigo-700">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16}/> Tomar Asistencia</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <ChevronLeft size={18} className="rotate-180 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header and Controls */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/50 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="z-10">
          <button 
            onClick={() => setCursoSeleccionado(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-3 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full w-fit"
          >
            <ChevronLeft size={14} /> Volver
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{cursoSeleccionado.nombre}</h1>
          
          {/* Status Badges */}
          {!cargando && estudiantes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Presentes: {stats.PRESENTE}
              </span>
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Tardanzas: {stats.TARDANZA}
              </span>
              <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Faltas: {stats.FALTA}
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Justificados: {stats.JUSTIFICADO}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto z-10">
          <div className="relative">
            <input 
              type="date" 
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full sm:w-auto px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm font-bold text-slate-700 shadow-inner transition-all"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={guardando || cargando}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all font-bold text-sm shadow-sm ${
              hasUnsavedChanges 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200/50 hover:shadow-lg hover:-translate-y-0.5' 
                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {guardando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {guardando ? "Guardando..." : (hasUnsavedChanges ? "Guardar Cambios" : "Guardado")}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar estudiante..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm text-slate-700 shadow-sm transition-all"
            />
          </div>
          
          <button 
            onClick={handleMarkAllPresent}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all text-sm font-bold shadow-sm"
          >
            <CheckCheck size={18} />
            Marcar todos Presentes
          </button>
        </div>

        {cargando ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-400 font-medium animate-pulse">Cargando lista de estudiantes...</p>
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="text-center py-24 text-slate-500 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-600">Sin alumnos</p>
            <p className="text-sm">No hay alumnos matriculados en este curso.</p>
          </div>
        ) : filteredEstudiantes.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-lg font-bold text-slate-600">No se encontraron resultados</p>
            <p className="text-sm">Intenta con otro término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 pl-6 pr-3 text-xs font-black text-slate-400 uppercase tracking-widest w-16">Nº</th>
                  <th className="py-4 px-3 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Estudiante</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Estado de Asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEstudiantes.map((est, index) => {
                  const currentTipo = asistenciasMap[est.id]?.tipo || 'PRESENTE';
                  const initials = getInitials(est.nombre, est.apellido);
                  const avatarColor = getAvatarColor(`${est.nombre} ${est.apellido}`);
                  
                  // Row border color indicator
                  let indicatorColor = 'border-transparent';
                  if (currentTipo === 'PRESENTE') indicatorColor = 'border-emerald-500';
                  if (currentTipo === 'TARDANZA') indicatorColor = 'border-amber-400';
                  if (currentTipo === 'FALTA') indicatorColor = 'border-red-500';
                  if (currentTipo === 'JUSTIFICADO') indicatorColor = 'border-blue-500';

                  return (
                    <tr key={est.id} className="group hover:bg-slate-50/50 transition-colors relative">
                      <td className="py-4 pl-6 pr-3 text-sm font-bold text-slate-400">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorColor} transition-colors`}></div>
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner ${avatarColor}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{est.apellido}, {est.nombre}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">DNI: {est.dni}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <OptionButton estId={est.id} tipo="PRESENTE" currentTipo={currentTipo} colorClass="bg-emerald-500" borderClass="border-emerald-500" icon={CheckCircle2} label="Presente" />
                          <OptionButton estId={est.id} tipo="TARDANZA" currentTipo={currentTipo} colorClass="bg-amber-400" borderClass="border-amber-400" icon={Clock} label="Tardanza" />
                          <OptionButton estId={est.id} tipo="FALTA" currentTipo={currentTipo} colorClass="bg-red-500" borderClass="border-red-500" icon={XCircle} label="Falta" />
                          <OptionButton estId={est.id} tipo="JUSTIFICADO" currentTipo={currentTipo} colorClass="bg-blue-500" borderClass="border-blue-500" icon={FileText} label="Justificado" />
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

