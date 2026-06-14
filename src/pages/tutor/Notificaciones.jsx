import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Bell, BellOff, Check, CheckCircle2, Clock } from 'lucide-react';

export default function Notificaciones() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, [user.id]);

  const cargarNotificaciones = () => {
    setCargando(true);
    api.get(`/notificaciones/usuario/${user.id}`)
      .then(res => {
        // Ordenamos para que las no leídas aparezcan primero, y luego por fecha descendente
        const sorted = (res.data || []).sort((a, b) => {
          if (a.leido === b.leido) {
            return new Date(b.fechaEnvio) - new Date(a.fechaEnvio);
          }
          return a.leido ? 1 : -1;
        });
        setNotificaciones(sorted);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      // Actualización optimista
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leido: true } : n)
      );
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leido).length;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ width: '100%', paddingBottom: '48px', animation: 'fadeIn 0.5s ease-out' }}>
      {/* HEADER */}
      <div style={{
        backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px',
        padding: '40px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          backgroundColor: '#f1f5f9', color: '#475569', padding: '6px 16px', 
          borderRadius: '99px', fontSize: '12px', fontWeight: '700', 
          letterSpacing: '0.05em', textTransform: 'uppercase', width: 'fit-content'
        }}>
          Tutor / Avisos
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Avisos y Notificaciones
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', margin: 0, fontWeight: '500' }}>
              Comunicados importantes, alertas de pagos y mensajes de la escuela.
            </p>
          </div>
          
          {noLeidas > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#eff6ff', padding: '12px 20px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
              <div style={{ position: 'relative' }}>
                <Bell size={24} color="#3b82f6" />
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #eff6ff' }}></span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e3a8a' }}>{noLeidas} Avisos Nuevos</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {cargando ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Cargando tus notificaciones...</p>
        </div>
      ) : notificaciones.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '64px 32px', textAlign: 'center' }}>
          <BellOff size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>No tienes notificaciones</h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>Todo está al día. Aquí aparecerán los avisos importantes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notificaciones.map(n => (
            <div 
              key={n.id} 
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid',
                borderColor: n.leido ? '#e2e8f0' : '#bfdbfe',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                gap: '20px',
                boxShadow: n.leido ? '0 1px 2px rgba(0,0,0,0.05)' : '0 10px 15px -3px rgba(59, 130, 246, 0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!n.leido && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: '#3b82f6' }}></div>
              )}
              
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: n.leido ? '#f8fafc' : '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: n.leido ? '#94a3b8' : '#3b82f6',
                border: `1px solid ${n.leido ? '#e2e8f0' : '#bfdbfe'}`
              }}>
                {n.leido ? <CheckCircle2 size={24} /> : <Bell size={24} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: n.leido ? '#475569' : '#0f172a', margin: 0 }}>
                    {n.titulo}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
                    <Clock size={14} />
                    {formatDate(n.fechaEnvio)}
                  </div>
                </div>
                
                <p style={{ fontSize: '15px', color: n.leido ? '#64748b' : '#334155', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {n.mensaje}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>
                    Remitente: {n.remitente ? `${n.remitente.nombre} ${n.remitente.apellido}` : 'Sistema AcademicScope'}
                  </span>
                  
                  {!n.leido && (
                    <button
                      onClick={() => marcarComoLeida(n.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569',
                        border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                    >
                      <Check size={16} />
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
