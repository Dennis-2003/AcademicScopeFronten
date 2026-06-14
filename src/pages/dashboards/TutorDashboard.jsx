import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Bell, 
  ChevronRight,
  User,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  Wallet
} from 'lucide-react';

function StatCard({ label, value, Icon, color }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        backgroundColor: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div>
        <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1.2', margin: 0 }}>{value}</h3>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '4px 0 0 0' }}>{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ label, desc, Icon, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.backgroundColor = `${color}05`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.backgroundColor = '#ffffff';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ color: color, backgroundColor: `${color}15`, padding: '10px', borderRadius: '10px' }}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
      </div>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', margin: 0 }}>{label}</h4>
        <p style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', margin: '4px 0 0 0' }}>{desc}</p>
      </div>
    </button>
  );
}

export default function TutorDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ hijos: 0, notificaciones: 0 });
  const [hijos, setHijos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const hoy = new Date();
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = hoy.toLocaleDateString('es-ES', opcionesFecha);

  useEffect(() => {
    if (user?.id) cargarDatos();
  }, [user]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const res = await api.get(`/dashboard/tutor/${user.id}`);
      const data = res.data;
      
      setStats({ hijos: data.hijos, notificaciones: data.notificaciones });
      setHijos(data.resumenHijos || []);
      setAlertas(data.alertas || []);
    } catch (error) {
      console.error("Error cargando dashboard de tutor", error);
    } finally {
      setCargando(false);
    }
  }

  const getSemaforoStyles = (color) => {
    switch (color) {
      case 'VERDE': return { color: '#10b981', bg: '#d1fae5' };
      case 'AMBAR': return { color: '#f59e0b', bg: '#fef3c7' };
      case 'ROJO': return { color: '#ef4444', bg: '#fee2e2' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Cargando resumen del apoderado...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: '48px', animation: 'fadeIn 0.5s ease-out' }}>
      {/* HEADER SECTION - Clean and modern without gradients */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          backgroundColor: '#f1f5f9', 
          color: '#475569', 
          padding: '6px 16px', 
          borderRadius: '99px', 
          fontSize: '12px', 
          fontWeight: '700', 
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          width: 'fit-content'
        }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
          Panel de Apoderado
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Bienvenido(a), {user.nombre}
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', margin: 0, fontWeight: '500' }}>
          {fechaStr} — Revisa el rendimiento y progreso de tus hijos de forma rápida y sencilla.
        </p>
      </div>

      {/* STATS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard label="Hijos Matriculados" value={stats.hijos} Icon={GraduationCap} color="#3b82f6" />
        <StatCard label="Notificaciones Nuevas" value={stats.notificaciones} Icon={Bell} color="#ef4444" />
      </div>

      {/* MAIN LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '32px',
        alignItems: 'start'
      }}>
        
        {/* LEFT COLUMN: Mis Hijos & Accesos Directos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Resumen de tus Hijos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {hijos.length === 0 ? (
                 <div style={{ backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                    <User size={32} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', margin: 0 }}>Aún no tienes hijos asignados a tu cuenta.</p>
                 </div>
              ) : (
                hijos.map((hijo) => {
                  const semStyles = getSemaforoStyles(hijo.semaforo);
                  return (
                    <div 
                      key={hijo.id} 
                      onClick={() => navigate('/dashboard/tutor/hijos')}
                      style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '16px', 
                        padding: '24px', 
                        border: '1px solid #e2e8f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800' }}>
                          {hijo.nombre.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>{hijo.nombre}</h4>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: 0 }}>{hijo.grado}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Asistencia</div>
                          <div style={{ fontSize: '20px', fontWeight: '900', color: '#334155' }}>{hijo.asistencia}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Semáforo</div>
                          <div style={{ 
                            fontSize: '13px', 
                            fontWeight: '800', 
                            color: semStyles.color, 
                            backgroundColor: semStyles.bg,
                            padding: '4px 12px',
                            borderRadius: '99px'
                          }}>
                            {hijo.semaforo}
                          </div>
                        </div>
                        <ChevronRight size={24} color="#cbd5e1" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Accesos Directos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <QuickAction label="Semáforo Detallado" desc="Ver notas de cursos" Icon={HeartHandshake} color="#3b82f6" onClick={() => navigate('/dashboard/tutor/hijos')} />
              <QuickAction label="Mensajes" desc="Avisos y notificaciones" Icon={Bell} color="#8b5cf6" onClick={() => navigate('/dashboard/tutor/notificaciones')} />
              <QuickAction label="Horarios" desc="Clases de la semana" Icon={CalendarDays} color="#10b981" onClick={() => navigate('/dashboard/tutor/horario')} />
              <QuickAction label="Pagos" desc="Gestión de pensiones" Icon={Wallet} color="#f59e0b" onClick={() => navigate('/dashboard/tutor/pagos')} />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Alertas Recientes */}
        <div>
          <section style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            minHeight: '100%'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#f43f5e" />
              Alertas Recientes
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {alertas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <HeartHandshake size={24} color="#94a3b8" />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: 0 }}>Todo en orden.<br/>No hay alertas nuevas de tus hijos.</p>
                </div>
              ) : (
                alertas.map(alerta => {
                  const isRojo = alerta.tipo === 'ROJO';
                  const mainColor = isRojo ? '#ef4444' : '#f59e0b';
                  const bgColor = isRojo ? '#fef2f2' : '#fffbeb';
                  const borderColor = isRojo ? '#fecaca' : '#fde68a';

                  return (
                    <div key={alerta.id} style={{
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ 
                        backgroundColor: '#ffffff', 
                        padding: '8px', 
                        borderRadius: '12px', 
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        marginTop: '2px'
                      }}>
                        <AlertTriangle size={20} color={mainColor} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', lineHeight: '1.3' }}>{alerta.titulo}</h4>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#475569', margin: 0, lineHeight: '1.5' }}>{alerta.mensaje}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
