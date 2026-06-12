import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Notificaciones() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/notificaciones/usuario/${user.id}`)
      .then(res => {
        setNotificaciones(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  return (
    <div>
      <section className="mb-xl">
        <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-widest">Tutor / Avisos</span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mt-sm">Avisos y Notificaciones</h1>
        <p className="text-on-surface-variant mt-md font-body-md">Comunicados importantes de la escuela.</p>
      </section>

      {loading ? (
        <div className="glass-card rounded-xl p-xl flex items-center justify-center gap-md">
          <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-on-surface-variant font-label-mono text-label-mono">CARGANDO...</span>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="glass-card rounded-xl p-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[64px] text-outline/40 mb-lg" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_off</span>
          <p className="text-on-surface-variant">No tienes notificaciones nuevas.</p>
        </div>
      ) : (
        <div className="space-y-gutter">
          {notificaciones.map(n => (
            <div key={n.id} className={`glass-card rounded-xl p-lg border-l-4 transition-all ${
              n.leido ? 'border-l-outline-variant' : 'border-l-[#fbbf24] neo-shadow-cyan'
            }`}>
              <div className="flex items-start justify-between gap-lg">
                <div className="flex-1">
                  <h3 className="font-headline-md text-[18px] text-on-surface">{n.titulo}</h3>
                  <p className="text-on-surface-variant mt-sm font-body-md">{n.mensaje}</p>
                  <span className="font-label-mono text-label-mono text-outline block mt-lg">
                    {new Date(n.fechaEnvio).toLocaleDateString()}
                  </span>
                </div>
                {!n.leido && (
                  <span className="w-3 h-3 rounded-full bg-[#fbbf24] flex-shrink-0 pulse-animation" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
