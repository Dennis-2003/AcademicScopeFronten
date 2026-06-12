import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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

  const obtenerColorSemaforo = (nota) => {
    if (nota >= 18) return 'bg-[#60a5fa]';
    if (nota >= 14) return 'bg-[#34d399]';
    if (nota >= 11) return 'bg-[#fbbf24]';
    return 'bg-[#f87171]';
  };

  const obtenerTextoColor = (nota) => {
    if (nota >= 18) return 'Excelente!';
    if (nota >= 14) return 'Vas muy bien!';
    if (nota >= 11) return 'Estas regular, puedes mejorar.';
    return 'Necesitas apoyo. Tu puedes!';
  };

  return (
    <div>
      <section className="mb-xl">
        <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-widest">Estudiante / Progreso</span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mt-sm">Mi Semáforo Escolar</h1>
        <p className="text-on-surface-variant mt-md font-body-md">Mira los colores para saber cómo vas en tus clases.</p>
      </section>

      {loading ? (
        <div className="glass-card rounded-xl p-xl flex items-center justify-center gap-md">
          <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant font-label-mono text-label-mono">CARGANDO...</span>
        </div>
      ) : notas.length === 0 ? (
        <div className="glass-card rounded-xl p-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[64px] text-outline/40 mb-lg" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          <p className="text-on-surface-variant">Todavía no hay notas registradas para ti en este periodo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {notas.map(nota => {
            const colorClass = obtenerColorSemaforo(nota.nota);
            return (
              <div key={nota.id} className="glass-card rounded-xl p-lg text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-2 ${colorClass}`} />
                <h3 className="font-headline-md text-[20px] text-on-surface mb-xl mt-md">
                  {nota.evaluacion?.nombre || 'Curso'}
                </h3>
                <div className={`w-28 h-28 rounded-full ${colorClass} flex items-center justify-center mx-auto shadow-lg`}>
                  <span className="text-white text-[32px] font-extrabold">{nota.nota}</span>
                </div>
                <p className="text-on-surface-variant mt-xl font-body-md">{obtenerTextoColor(nota.nota)}</p>
                {nota.comentarioDocente && (
                  <div className="mt-lg px-lg py-md rounded-xl bg-surface-container-low text-left text-sm text-on-surface-variant">
                    <strong className="block mb-xs text-on-surface font-label-mono text-label-mono">Mensaje del profesor:</strong>
                    {nota.comentarioDocente}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
