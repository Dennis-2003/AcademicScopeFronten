import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ChevronDown,
  Calendar,
  Download
} from 'lucide-react';
import api from '../../services/api';

export default function ReportesAsistencia({ isEmbedded = false }) {
  const [activeTab, setActiveTab] = useState('diario');
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [tipoCurso, setTipoCurso] = useState(''); // '' = Todos, 'REGULAR', 'TALLER'
  
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar lista de grados
  useEffect(() => {
    const fetchGrados = async () => {
      try {
        const res = await api.get('/grados');
        setGrados(res.data);
      } catch (err) {
        console.error("Error al cargar grados", err);
      }
    };
    fetchGrados();
  }, []);

  // Cargar reporte cada vez que cambien los filtros
  useEffect(() => {
    const fetchReporte = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (gradoSeleccionado) params.append('gradoId', gradoSeleccionado);
        if (tipoCurso) params.append('tipoCurso', tipoCurso);
        
        const res = await api.get(`/asistencias/reporte/general?${params.toString()}`);
        setReporte(res.data);
      } catch (err) {
        console.error("Error cargando reporte general", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReporte();
  }, [gradoSeleccionado, tipoCurso]);

  if (loading && !reporte) {
    return <div className="p-8 text-center text-slate-500 font-bold">Cargando reporte de asistencia...</div>;
  }

  // Fallback seguro
  const statsGlobales = reporte || {
    asistencia: 0, ausentes: 0, tardanzas: 0, justificados: 0,
    cursosRiesgo: [], estudiantesRiesgo: []
  };

  return (
    <div className={isEmbedded ? "w-full animate-fade-in pb-12 font-sans" : "w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans"}>
      
      {!isEmbedded && (
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              <BarChart3 size={14} strokeWidth={2.5} />
              Reportes
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Dashboard de Asistencia
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Monitorea el nivel de presentismo y detecta estudiantes en riesgo de abandono.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filtro Grado */}
            <div className="relative">
              <select 
                value={gradoSeleccionado}
                onChange={(e) => setGradoSeleccionado(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold py-3 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer text-sm"
              >
                <option value="">Todos los Grados</option>
                {grados.map(g => (
                  <option key={g.id} value={g.id}>{g.nombre} - {g.nivel}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Filtro Tipo Curso */}
            <div className="relative">
              <select 
                value={tipoCurso}
                onChange={(e) => setTipoCurso(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold py-3 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer text-sm"
              >
                <option value="">Todos (Regular y Taller)</option>
                <option value="REGULAR">Cursos Regulares</option>
                <option value="TALLER">Talleres Extracurriculares</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </header>
      )}

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Tasa de Asistencia</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-800">{statsGlobales.asistencia}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Ausencias Totales</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-800">{statsGlobales.ausentes}</h3>
            <span className="flex items-center text-sm font-bold text-rose-500 mb-1">Faltas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative overflow-hidden">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Tardanzas</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-800">{statsGlobales.tardanzas}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative overflow-hidden">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Justificados</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-800">{statsGlobales.justificados}</h3>
          </div>
        </div>
      </div>

      {loading && <div className="text-center text-indigo-600 font-bold mb-4 animate-pulse">Actualizando datos...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Salones Críticos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-700 flex items-center gap-2">
              <Users size={18} className="text-indigo-500" />
              Cursos con Mayor Inasistencia
            </h2>
          </div>
          <div className="p-5 flex-1">
            <div className="space-y-4">
              {statsGlobales.cursosRiesgo?.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No hay datos de inasistencia.</p>
              ) : (
                statsGlobales.cursosRiesgo?.map((curso, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800">{curso.curso} <span className="text-xs text-slate-400 font-normal">({curso.grado})</span></h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Docente: {curso.docente}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-rose-600">{curso.ausencias}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Faltas Totales</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Estudiantes en Riesgo */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
          <div className="p-5 border-b border-slate-100 bg-rose-50/30 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" />
              Alertas: Ausentismo Crítico
            </h2>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Top Estudiantes</span>
          </div>
          <div className="p-0 flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Estudiante</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-center">Faltas Acumuladas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statsGlobales.estudiantesRiesgo?.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-5 py-4 text-center text-slate-500 text-sm italic">
                      No hay estudiantes en riesgo.
                    </td>
                  </tr>
                ) : (
                  statsGlobales.estudiantesRiesgo?.map((est, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{est.nombre}</p>
                        <p className="text-xs font-medium text-slate-500">{est.grado}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black">
                          {est.faltas}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
