import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GraduationCap, Award, TrendingUp, AlertCircle, MessageCircle, BarChart3 } from 'lucide-react';

// Componente del gráfico de barras SVG
function GraficoNotas({ notas }) {
  const MAX_NOTA = 20;
  const HEIGHT = 180;
  const BAR_WIDTH = 40;
  const GAP = 16;
  const PADDING_LEFT = 40;
  const PADDING_BOTTOM = 60;

  const getColor = (nota) => {
    if (nota >= 18) return '#10b981';
    if (nota >= 14) return '#3b82f6';
    if (nota >= 11) return '#f59e0b';
    return '#ef4444';
  };

  const svgWidth = PADDING_LEFT + notas.length * (BAR_WIDTH + GAP) + GAP;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <BarChart3 size={18} color="var(--primary)" />
        <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Gráfico de Calificaciones</h2>
      </div>

      <svg width={svgWidth} height={HEIGHT + PADDING_BOTTOM} style={{ display: 'block', minWidth: '100%' }}>
        {/* Líneas de referencia */}
        {[0, 5, 10, 15, 20].map(val => {
          const y = HEIGHT - (val / MAX_NOTA) * HEIGHT;
          return (
            <g key={val}>
              <line x1={PADDING_LEFT} y1={y} x2={svgWidth} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PADDING_LEFT - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="600">{val}</text>
            </g>
          );
        })}

        {/* Barras */}
        {notas.map((nota, i) => {
          const barHeight = (nota.nota / MAX_NOTA) * HEIGHT;
          const x = PADDING_LEFT + GAP + i * (BAR_WIDTH + GAP);
          const y = HEIGHT - barHeight;
          const color = getColor(nota.nota);
          const nombreCurso = nota.evaluacion?.curso?.nombre || 'Curso';
          const nombreEval = nota.evaluacion?.nombre || 'Evaluación';

          // Truncar etiquetas largas
          const truncate = (str, max) => str.length > max ? str.slice(0, max) + '…' : str;

          return (
            <g key={nota.id}>
              {/* Barra con esquinas redondeadas arriba */}
              <rect x={x} y={y} width={BAR_WIDTH} height={barHeight} fill={color} rx="6" ry="6" opacity="0.9" />
              {/* Valor encima de la barra */}
              <text x={x + BAR_WIDTH / 2} y={y - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{nota.nota}</text>
              {/* Nombre del curso */}
              <text x={x + BAR_WIDTH / 2} y={HEIGHT + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">{truncate(nombreCurso, 8)}</text>
              {/* Nombre de evaluación */}
              <text x={x + BAR_WIDTH / 2} y={HEIGHT + 36} textAnchor="middle" fontSize="9" fill="#94a3b8">{truncate(nombreEval, 10)}</text>
            </g>
          );
        })}
      </svg>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        {[
          { color: '#10b981', label: 'Sobresaliente (18-20)' },
          { color: '#3b82f6', label: 'Buen trabajo (14-17)' },
          { color: '#f59e0b', label: 'En proceso (11-13)' },
          { color: '#ef4444', label: 'Requiere apoyo (0-10)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MiSemaforo() {
  const { user } = useAuth();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/calificaciones/estudiante/${user.id}`)
      .then(res => {
        setNotas(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  const getEstiloNota = (nota) => {
    if (nota >= 18) return { bg: 'bg-emerald-500', text: 'text-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-200', msg: '¡Sobresaliente!', icon: Award };
    if (nota >= 14) return { bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200', msg: '¡Buen trabajo!', icon: TrendingUp };
    if (nota >= 11) return { bg: 'bg-amber-500', text: 'text-amber-500', lightBg: 'bg-amber-50', border: 'border-amber-200', msg: 'En proceso de mejora', icon: AlertCircle };
    return { bg: 'bg-rose-500', text: 'text-rose-500', lightBg: 'bg-rose-50', border: 'border-rose-200', msg: 'Requiere apoyo', icon: AlertCircle };
  };

  const promedio = notas.length > 0
    ? (notas.reduce((acc, curr) => acc + curr.nota, 0) / notas.length).toFixed(1)
    : 0;

  const estiloPromedio = getEstiloNota(promedio);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem', fontFamily: 'var(--font-main)' }}>

      {/* Header */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ flex: '1 1 0%', minWidth: '300px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <GraduationCap size={14} strokeWidth={2.5} />
            Estudiante / Rendimiento
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            Mis Notas
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
            Revisa el detalle de tus calificaciones y los comentarios de tus profesores en cada curso evaluado.
          </p>
        </div>

        {!loading && notas.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', minWidth: '220px', flexShrink: 0 }}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${estiloPromedio.bg}`}>
              <BarChart3 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Promedio General
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span className={`text-2xl font-black ${estiloPromedio.text}`}>{promedio}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>/ 20</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '1rem', border: '1px solid var(--border-color)', gap: '1rem' }}>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calculando Promedios...</span>
        </div>
      ) : notas.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', margin: '0 auto', maxWidth: '600px' }}>
          <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <GraduationCap size={40} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Sin calificaciones registradas</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '400px' }}>
            Tus profesores aún no han registrado notas para este periodo académico.
          </p>
        </div>
      ) : (
        <>
          {/* GRÁFICO DE BARRAS */}
          <GraficoNotas notas={notas} />

          {/* TARJETAS DE NOTAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {notas.map(nota => {
              const estilo = getEstiloNota(nota.nota);
              const Icono = estilo.icon;
              return (
                <div key={nota.id} className="group" style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                  <div className={estilo.bg} style={{ height: '0.5rem', width: '100%' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'var(--bg-body)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          {nota.evaluacion?.curso?.nombre || 'Curso'}
                        </span>
                        <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.125rem', lineHeight: '1.2' }}>
                          {nota.evaluacion?.nombre || 'Evaluación'}
                        </h3>
                      </div>
                      <div className={`${estilo.lightBg} ${estilo.border}`} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid', flexShrink: 0 }}>
                        <span className={estilo.text} style={{ fontSize: '1.25rem', fontWeight: '900' }}>{nota.nota}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Icono size={16} className={estilo.text} />
                      <span className={estilo.text} style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{estilo.msg}</span>
                    </div>

                    {nota.comentarioDocente && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', backgroundColor: 'var(--bg-body)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                          <MessageCircle size={14} color="var(--text-muted)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                          <div>
                            <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>Feedback del Docente</span>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500', fontStyle: 'italic', lineHeight: '1.6' }}>
                              "{nota.comentarioDocente}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}