import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  AlertCircle,
  Loader2,
  Calendar,
  User,
  MessageSquareText
} from 'lucide-react';
import api from '../../services/api';

export default function GestionComportamiento() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      setCargando(true);
      const res = await api.get('/comportamientos');
      setReportes(res.data);
    } catch (error) {
      console.error("Error al cargar reportes de conducta", error);
    } finally {
      setCargando(false);
    }
  };

  const deleteReporte = async (id) => {
    if (window.confirm('¿Eliminar este reporte de conducta de forma permanente?')) {
      try {
        await api.delete(`/comportamientos/${id}`);
        setReportes(reportes.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error al eliminar reporte", error);
      }
    }
  };

  const getSemaforoColor = (estado) => {
    switch (estado) {
      case 'VERDE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'AMARILLO': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'ROJO': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getSemaforoDot = (estado) => {
    switch (estado) {
      case 'VERDE': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'AMARILLO': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      case 'ROJO': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default: return 'bg-slate-300';
    }
  };

  const reportesFiltrados = reportes.filter(r => 
    r.estudiante?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    r.estudiante?.apellido?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldAlert size={14} strokeWidth={2.5} />
            Disciplina y Conducta
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Reportes de Comportamiento
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base max-w-2xl">
            Historial del semáforo académico. Revisa las anotaciones positivas y negativas registradas por los docentes.
          </p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filtros */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre de estudiante..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="p-0">
          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : reportesFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <ShieldAlert className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-medium text-slate-900">No se encontraron reportes</h3>
              <p className="mt-1 text-sm text-slate-500">Aún no hay anotaciones de conducta registradas.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reportesFiltrados.map((reporte) => (
                <div key={reporte.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-5 items-start">
                  
                  {/* Estado Semáforo */}
                  <div className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[100px] ${getSemaforoColor(reporte.tipo)}`}>
                    <div className={`w-6 h-6 rounded-full border-2 border-white mb-2 ${getSemaforoDot(reporte.tipo)}`}></div>
                    <span className="text-xs font-bold uppercase tracking-wider">{reporte.tipo}</span>
                  </div>

                  {/* Detalles */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <User size={18} className="text-slate-400" />
                        {reporte.estudiante?.nombre} {reporte.estudiante?.apellido}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Calendar size={14} />
                        {reporte.fecha}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600 bg-white border border-slate-100 rounded-xl p-3 shadow-sm mb-3">
                      <MessageSquareText size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium leading-relaxed">
                        {reporte.descripcion || <span className="italic text-slate-400">Sin observación detallada.</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                      <span>Reportado por: <span className="text-indigo-600">{reporte.docente?.nombre} {reporte.docente?.apellido}</span></span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 sm:pt-0">
                    <button 
                      onClick={() => deleteReporte(reporte.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      title="Eliminar Reporte"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
