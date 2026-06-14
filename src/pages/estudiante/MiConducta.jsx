import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, ShieldAlert, BadgeInfo } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MiConducta() {
  const { user } = useAuth();
  const [comportamientos, setComportamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      api.get(`/comportamientos/estudiante/${user.id}`)
        .then(res => setComportamientos(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getTipoInfo = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'MERITO': 
      case 'POSITIVO':
        return { icon: <CheckCircle size={24} className="text-emerald-500" />, color: 'emerald', label: 'Mérito' };
      case 'DEMERITO': 
      case 'NEGATIVO':
        return { icon: <AlertTriangle size={24} className="text-rose-500" />, color: 'rose', label: 'Demérito' };
      case 'GRAVE':
        return { icon: <ShieldAlert size={24} className="text-red-600" />, color: 'red', label: 'Falta Grave' };
      default: 
        return { icon: <BadgeInfo size={24} className="text-blue-500" />, color: 'blue', label: 'Observación' };
    }
  };

  const calcularPuntajeTotal = () => {
    // Si asumiéramos que empieza en 100 o 20 (base)
    // Para simplificar mostraremos la sumatoria de puntajes (+ y -)
    return comportamientos.reduce((acc, curr) => acc + (curr.puntaje || 0), 0);
  };

  const scoreTotal = calcularPuntajeTotal();
  const balancePositivo = scoreTotal >= 0;

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem', fontFamily: 'var(--font-main)' }}>
      
      {/* Clean, Functional Header */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ flex: '1 1 0%', minWidth: '300px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <AlertCircle size={14} strokeWidth={2.5} />
            Estudiante / Conducta
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            Mi Conducta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
            Revisa tu historial disciplinario, incluyendo méritos, observaciones y faltas registradas por los docentes.
          </p>
        </div>

        {/* Tarjeta de Score */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', border: `1px solid ${balancePositivo ? 'rgba(5, 205, 153, 0.2)' : 'rgba(238, 93, 80, 0.2)'}`, backgroundColor: balancePositivo ? 'rgba(5, 205, 153, 0.05)' : 'rgba(238, 93, 80, 0.05)', minWidth: '220px', flexShrink: 0 }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backgroundColor: balancePositivo ? 'var(--semaforo-verde)' : 'var(--semaforo-rojo)', boxShadow: 'var(--shadow-sm)' }}>
              <AlertCircle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Puntaje Neto
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: balancePositivo ? 'var(--semaforo-verde)' : 'var(--semaforo-rojo)' }}>
                  {scoreTotal > 0 ? `+${scoreTotal}` : scoreTotal}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)' }}>pts</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '1rem', border: '1px solid var(--border-color)', gap: '1rem' }}>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cargando registros...</span>
        </div>
      ) : comportamientos.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', margin: '0 auto', maxWidth: '600px' }}>
          <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', backgroundColor: 'rgba(5, 205, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle size={40} color="var(--semaforo-verde)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>¡Historial Impecable!</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '400px' }}>
            No tienes ninguna observación disciplinaria registrada hasta el momento. ¡Sigue así!
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Historial de Registros</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comportamientos.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(registro => {
                const info = getTipoInfo(registro.tipo);
                // Convertir colores de tailwind a var CSS o rgba
                const bgColor = info.color === 'emerald' ? 'rgba(5, 205, 153, 0.1)' : info.color === 'rose' || info.color === 'red' ? 'rgba(238, 93, 80, 0.1)' : 'rgba(0, 181, 216, 0.1)';
                const borderColor = info.color === 'emerald' ? 'rgba(5, 205, 153, 0.2)' : info.color === 'rose' || info.color === 'red' ? 'rgba(238, 93, 80, 0.2)' : 'rgba(0, 181, 216, 0.2)';
                const textColor = info.color === 'emerald' ? 'var(--semaforo-verde)' : info.color === 'rose' || info.color === 'red' ? 'var(--semaforo-rojo)' : 'var(--semaforo-azul)';

                return (
                  <div key={registro.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                      {info.icon}
                    </div>
                    <div style={{ flex: '1 1 0%', minWidth: '250px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ display: 'inline-block', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', backgroundColor: bgColor, color: textColor }}>
                            {info.label}
                          </span>
                          <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem', margin: 0 }}>
                            {registro.descripcion}
                          </h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                          {registro.puntaje !== 0 && (
                            <span style={{ fontSize: '0.875rem', fontWeight: '900', color: registro.puntaje > 0 ? 'var(--semaforo-verde)' : 'var(--semaforo-rojo)' }}>
                              {registro.puntaje > 0 ? `+${registro.puntaje}` : registro.puntaje} pts
                            </span>
                          )}
                          <span style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)', backgroundColor: 'white', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                            {new Date(registro.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        <span>Reportado por:</span>
                        <span style={{ color: 'var(--primary)' }}>
                          {registro.docente ? `${registro.docente.nombre} ${registro.docente.apellido}` : 'Desconocido'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
