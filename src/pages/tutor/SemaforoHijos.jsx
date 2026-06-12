import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SemaforoHijos() {
  const { user } = useAuth();
  const [hijos, setHijos] = useState([]);
  const [hijoActivo, setHijoActivo] = useState(null);
  const [notas, setNotas] = useState([]);

  const seleccionarHijo = useCallback((hijo) => {
    setHijoActivo(hijo);
    api.get(`/calificaciones/estudiante/${hijo.id}`).then(res => {
      setNotas(res.data);
    }).catch(() => setNotas([]));
  }, []);

  useEffect(() => {
    api.get('/usuarios/rol/ESTUDIANTE').then(res => {
      const misHijos = res.data.filter(est => est.tutor && est.tutor.id === user.id);
      setHijos(misHijos);
      if (misHijos.length > 0) {
        seleccionarHijo(misHijos[0]);
      }
    });
  }, [user.id, seleccionarHijo]);

  const obtenerColorSemaforo = (nota) => {
    if (nota >= 18) return 'bg-[#60a5fa]';
    if (nota >= 14) return 'bg-[#34d399]';
    if (nota >= 11) return 'bg-[#fbbf24]';
    return 'bg-[#f87171]';
  };

  return (
    <div>
      <section className="mb-xl">
        <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-widest">Tutor / Hijos</span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mt-sm">Semáforo de mis Hijos</h1>
        <p className="text-on-surface-variant mt-md font-body-md">Revisa cómo le está yendo a tus hijos en la escuela de forma sencilla.</p>
      </section>

      {hijos.length === 0 ? (
        <div className="glass-card rounded-xl p-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[64px] text-outline/40 mb-lg" style={{ fontVariationSettings: "'FILL' 1" }}>family_history</span>
          <p className="text-on-surface-variant">No tienes hijos registrados a tu nombre.</p>
        </div>
      ) : (
        <>
          {hijos.length > 1 && (
            <div className="flex gap-md mb-xl overflow-x-auto pb-sm hide-scrollbar">
              {hijos.map(hijo => (
                <button key={hijo.id} onClick={() => seleccionarHijo(hijo)}
                  className={`flex items-center gap-md px-lg py-md rounded-full font-label-caps text-label-caps transition-all whitespace-nowrap ${
                    hijoActivo?.id === hijo.id
                      ? 'bg-secondary text-white neo-shadow-purple'
                      : 'border border-outline-variant text-on-surface hover:bg-surface-variant/30'
                  }`}>
                  <span className="material-symbols-outlined text-[18px]">school</span>
                  {hijo.nombre}
                </button>
              ))}
            </div>
          )}

          {hijoActivo && (
            <div>
              <div className="flex items-center gap-lg mb-xl">
                <div className="w-14 h-14 rounded-full bg-secondary-container/30 border border-secondary flex items-center justify-center font-bold text-secondary text-xl">
                  {hijoActivo.nombre?.charAt(0)}{hijoActivo.apellido?.charAt(0)}
                </div>
                <div>
                  <h2 className="font-headline-md text-[24px] text-on-surface">Rendimiento de {hijoActivo.nombre}</h2>
                  <span className="font-label-mono text-label-mono text-outline">{hijoActivo.dni}</span>
                </div>
              </div>

              {notas.length === 0 ? (
                <div className="glass-card rounded-xl p-xl flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-[64px] text-outline/40 mb-lg" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  <p className="text-on-surface-variant">{hijoActivo.nombre} no tiene calificaciones en este periodo.</p>
                </div>
              ) : (
                <div className="space-y-gutter">
                  {notas.map(nota => (
                    <div key={nota.id} className="glass-card rounded-xl p-lg flex items-center gap-xl">
                      <div className={`w-14 h-14 rounded-full ${obtenerColorSemaforo(nota.nota)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-lg">{nota.nota}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-headline-md text-[18px] text-on-surface">{nota.evaluacion?.nombre || 'Curso'}</h3>
                        {nota.comentarioDocente ? (
                          <p className="text-on-surface-variant text-sm mt-xs italic">"{nota.comentarioDocente}"</p>
                        ) : (
                          <p className="text-outline text-sm mt-xs">Sin comentarios.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
