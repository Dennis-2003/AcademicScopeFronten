import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CalendarDays, BookOpen, CheckCircle2, Clock, XCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function MiAsistencia() {
  const { user } = useAuth();
  const [cursosData, setCursosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => { cargarDatos(); }, [user.id]);

  async function cargarDatos() {
    setLoading(true);
    try {
      const matRes = await api.get(`/matriculas/estudiante/${user.id}`);
      const matriculasValidas = matRes.data.filter(m => m.estado !== 'RETIRADA');

      let cursosDelEstudiante = [];
      if (matriculasValidas.length > 0) {
        const gradoId = matriculasValidas[0].grado.id;
        const cursosRes = await api.get(`/cursos/grado/${gradoId}`);
        cursosDelEstudiante = cursosRes.data;
      }

      const dataCompleta = await Promise.all(cursosDelEstudiante.map(async (curso) => {
        const asisRes = await api.get(`/asistencias/estudiante/${user.id}/curso/${curso.id}`);
        const asistencias = asisRes.data;

        const resumen = { PRESENTE: 0, FALTA: 0, TARDANZA: 0, JUSTIFICADO: 0, total: asistencias.length };
        asistencias.forEach(a => { if (resumen[a.tipo] !== undefined) resumen[a.tipo]++; });

        const asistidos = resumen.PRESENTE + resumen.TARDANZA + resumen.JUSTIFICADO;
        const porcentaje = resumen.total > 0 ? Math.round((asistidos / resumen.total) * 100) : 100;

        return {
          curso,
          asistencias: asistencias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
          resumen,
          porcentaje
        };
      }));

      setCursosData(dataCompleta);
    } catch (err) {
      console.error('Error cargando asistencia:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleExpandido = (cursoId) => {
    setExpandidos(prev => ({ ...prev, [cursoId]: !prev[cursoId] }));
  };

  const cursosFiltrados = cursoSeleccionado === 'todos'
    ? cursosData
    : cursosData.filter(d => String(d.curso.id) === cursoSeleccionado);

  const StatusIcon = ({ tipo }) => {
    switch (tipo) {
      case 'PRESENTE': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'FALTA': return <XCircle className="text-rose-500" size={18} />;
      case 'TARDANZA': return <Clock className="text-amber-500" size={18} />;
      case 'JUSTIFICADO': return <FileText className="text-blue-500" size={18} />;
      default: return null;
    }
  };

  const BadgeText = ({ tipo }) => {
    switch (tipo) {
      case 'PRESENTE': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">Presente</span>;
      case 'FALTA': return <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold">Falta</span>;
      case 'TARDANZA': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">Tardanza</span>;
      case 'JUSTIFICADO': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Justificado</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
          <CalendarDays size={14} strokeWidth={2.5} />
          Estudiante / Asistencia
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Mi Asistencia
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Revisa el registro de tus asistencias, faltas y tardanzas en cada curso.
            </p>
          </div>

          {/* FILTRO POR CURSO */}
          {!loading && cursosData.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} color="#6366f1" />
              <select
                value={cursoSeleccionado}
                onChange={e => setCursoSeleccionado(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#334155',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}
              >
                <option value="todos">Todos los cursos</option>
                {cursosData.map(d => (
                  <option key={d.curso.id} value={String(d.curso.id)}>
                    {d.curso.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {loading ? (
        <div className="glass-card rounded-xl p-xl flex items-center justify-center gap-md">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Cargando...</span>
        </div>
      ) : cursosData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col items-center text-center shadow-sm w-full max-w-2xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Sin cursos registrados</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm">
            Actualmente no tienes cursos matriculados para visualizar tu asistencia.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen global si se muestran todos */}
          {cursoSeleccionado === 'todos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
              {[
                { label: 'Cursos', valor: cursosData.length, color: '#6366f1', bg: '#eef2ff' },
                { label: 'Presentes', valor: cursosData.reduce((s, d) => s + d.resumen.PRESENTE, 0), color: '#10b981', bg: '#ecfdf5' },
                { label: 'Faltas', valor: cursosData.reduce((s, d) => s + d.resumen.FALTA, 0), color: '#ef4444', bg: '#fef2f2' },
                { label: 'Tardanzas', valor: cursosData.reduce((s, d) => s + d.resumen.TARDANZA, 0), color: '#f59e0b', bg: '#fffbeb' },
              ].map(item => (
                <div key={item.label} style={{ backgroundColor: item.bg, borderRadius: '1rem', padding: '1rem', textAlign: 'center', border: `1px solid ${item.color}22` }}>
                  <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: '900', color: item.color }}>{item.valor}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {cursosFiltrados.map((data) => {
            const estaExpandido = expandidos[data.curso.id];
            const registrosMostrados = estaExpandido ? data.asistencias : data.asistencias.slice(0, 3);

            return (
              <div key={data.curso.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6">

                {/* Resumen del curso */}
                <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                      <BookOpen size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">
                      {data.curso.codigo}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-800 mb-1">{data.curso.nombre}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase mb-6">{data.curso.grado?.nombre}</p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-500">Asistencia Total</span>
                      <span className={`text-sm font-extrabold ${data.porcentaje >= 80 ? 'text-emerald-500' : data.porcentaje >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {data.porcentaje}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${data.porcentaje >= 80 ? 'bg-emerald-500' : data.porcentaje >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${data.porcentaje}%`, transition: 'width 0.6s ease' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Contadores y registros */}
                <div className="lg:w-2/3 flex flex-col">
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clases</span>
                      <span className="text-xl font-extrabold text-slate-700">{data.resumen.total}</span>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Faltas</span>
                      <span className="text-xl font-extrabold text-rose-700">{data.resumen.FALTA}</span>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-amber-100">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Tardanzas</span>
                      <span className="text-xl font-extrabold text-amber-700">{data.resumen.TARDANZA}</span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Justif.</span>
                      <span className="text-xl font-extrabold text-blue-700">{data.resumen.JUSTIFICADO}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" /> Registros de asistencia
                    </h4>
                    {data.asistencias.length === 0 ? (
                      <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                        No hay asistencias registradas aún.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {registrosMostrados.map((asis) => (
                          <div key={asis.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <StatusIcon tipo={asis.tipo} />
                              <span className="text-sm font-medium text-slate-700">
                                {new Date(asis.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                            <BadgeText tipo={asis.tipo} />
                          </div>
                        ))}

                        {data.asistencias.length > 3 && (
                          <button
                            onClick={() => toggleExpandido(data.curso.id)}
                            style={{
                              width: '100%',
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              borderRadius: '0.75rem',
                              border: '1.5px dashed #c7d2fe',
                              backgroundColor: '#f5f3ff',
                              color: '#6366f1',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.375rem',
                              transition: 'background 0.2s'
                            }}
                          >
                            {estaExpandido
                              ? <><ChevronUp size={14} /> Mostrar menos</>
                              : <><ChevronDown size={14} /> Ver {data.asistencias.length - 3} registros más</>
                            }
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}