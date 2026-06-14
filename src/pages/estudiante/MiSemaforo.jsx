import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GraduationCap, Award, TrendingUp, AlertCircle, MessageCircle, BarChart3 } from 'lucide-react';

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
      
      {/* Clean, Functional Header */}
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

        {/* Tarjeta de Promedio General */}
        {!loading && notas.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', border: `1px solid ${estiloPromedio.border.replace('border-', 'var(--')})`, backgroundColor: estiloPromedio.lightBg.replace('bg-', 'var(--').replace('50', 'light)'), minWidth: '220px', flexShrink: 0 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '1rem', border: '1px solid var(--border-color)', gap: '1rem' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {notas.map(nota => {
            const estilo = getEstiloNota(nota.nota);
            const Icono = estilo.icon;
            return (
              <div key={nota.id} className="group" style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}>
                <div className={estilo.bg} style={{ height: '0.5rem', width: '100%' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'var(--bg-body)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {nota.evaluacion?.curso?.nombre || 'Curso'}
                      </span>
                      <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.125rem', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {nota.evaluacion?.nombre || 'Evaluación'}
                      </h3>
                    </div>
                    <div className={`${estilo.lightBg} ${estilo.border}`} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid', flexShrink: 0 }}>
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
      )}
    </div>
  );
}
