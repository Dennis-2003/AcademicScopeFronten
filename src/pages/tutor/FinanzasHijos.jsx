import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GraduationCap, Wallet, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function FinanzasHijos() {
  const { user } = useAuth();
  const [hijos, setHijos] = useState([]);
  const [hijoActivo, setHijoActivo] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(null);

  const seleccionarHijo = useCallback((hijo) => {
    setHijoActivo(hijo);
    cargarPagos(hijo.id);
  }, []);

  const cargarPagos = async (estudianteId) => {
    setCargando(true);
    try {
      const res = await api.get(`/finanzas/pagos/estudiante/${estudianteId}`);
      setPagos(res.data || []);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setCargando(true);
    api.get('/usuarios/rol/ESTUDIANTE').then(res => {
      const allStudents = res.data || [];
      const misHijos = allStudents.filter(est => est.tutor && est.tutor.id === user.id);
      setHijos(misHijos);
      if (misHijos.length > 0) {
        seleccionarHijo(misHijos[0]);
      } else {
        setCargando(false);
      }
    }).catch(() => setCargando(false));
  }, [user.id, seleccionarHijo]);

  const simularPago = async (pago) => {
    if (pago.pagado) return;
    
    setProcesandoPago(pago.id);
    try {
      // Usamos el endpoint toggle para simular el pago
      await api.post(`/finanzas/pagos/toggle/${hijoActivo.id}/${pago.concepto.id}`);
      
      // Actualizamos el estado local para reflejar el pago sin necesidad de recargar todo
      setPagos(pagosAnteriores => 
        pagosAnteriores.map(p => 
          p.id === pago.id 
            ? { ...p, pagado: true, fechaPago: new Date().toISOString() } 
            : p
        )
      );
    } catch (error) {
      console.error("Error al procesar el pago:", error);
    } finally {
      setProcesandoPago(null);
    }
  };

  const pagosPendientes = pagos.filter(p => !p.pagado);
  const pagosRealizados = pagos.filter(p => p.pagado);

  const formatCurrency = (monto) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto);
  };

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
        padding: '40px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px'
      }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          backgroundColor: '#f1f5f9', color: '#475569', padding: '6px 16px', 
          borderRadius: '99px', fontSize: '12px', fontWeight: '700', 
          letterSpacing: '0.05em', textTransform: 'uppercase', width: 'fit-content'
        }}>
          Tutor / Finanzas
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Pagos y Finanzas
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', margin: 0, fontWeight: '500' }}>
          Administra los pagos de matrículas y pensiones de tus hijos.
        </p>
      </div>

      {hijos.length === 0 && !cargando ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '64px 32px', textAlign: 'center' }}>
          <GraduationCap size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>No tienes hijos registrados</h2>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>Comunícate con la institución para asignar a tus hijos a esta cuenta.</p>
        </div>
      ) : (
        <>
          {/* HIJOS SELECTOR */}
          {hijos.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
              {hijos.map(hijo => {
                const isSelected = hijoActivo?.id === hijo.id;
                return (
                  <button 
                    key={hijo.id} 
                    onClick={() => seleccionarHijo(hijo)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
                      borderRadius: '99px', border: isSelected ? 'none' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#3b82f6' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                  >
                    <GraduationCap size={20} color={isSelected ? '#ffffff' : '#94a3b8'} />
                    {hijo.nombre}
                  </button>
                );
              })}
            </div>
          )}

          {hijoActivo && (
            <div style={{
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px',
              padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                  {hijoActivo.nombre?.charAt(0)}{hijoActivo.apellido?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>Estado de Cuenta: {hijoActivo.nombre}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    <span style={{ padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>DNI: {hijoActivo.dni}</span>
                  </div>
                </div>
              </div>

              {cargando ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
                  <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Cargando información financiera...</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                  
                  {/* COLUMNA PAGOS PENDIENTES */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={20} color="#ef4444" />
                      Pagos Pendientes
                      <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '99px', fontSize: '12px' }}>
                        {pagosPendientes.length}
                      </span>
                    </h3>
                    
                    {pagosPendientes.length === 0 ? (
                      <div style={{ padding: '32px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                        <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
                        <p style={{ margin: 0, fontWeight: '600' }}>¡Excelente! No tienes deudas pendientes.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pagosPendientes.map(pago => (
                          <div key={pago.id} style={{
                            padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            display: 'flex', flexDirection: 'column', gap: '16px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>{pago.concepto?.nombre}</h4>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} />
                                  Vencimiento próximo
                                </p>
                              </div>
                              <span style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444' }}>
                                {formatCurrency(pago.concepto?.monto)}
                              </span>
                            </div>
                            
                            <button 
                              onClick={() => simularPago(pago)}
                              disabled={procesandoPago === pago.id}
                              style={{
                                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                                backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontSize: '14px',
                                cursor: procesandoPago === pago.id ? 'wait' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s', opacity: procesandoPago === pago.id ? 0.7 : 1
                              }}
                              onMouseEnter={(e) => { if (!procesandoPago) e.currentTarget.style.backgroundColor = '#1e293b' }}
                              onMouseLeave={(e) => { if (!procesandoPago) e.currentTarget.style.backgroundColor = '#0f172a' }}
                            >
                              {procesandoPago === pago.id ? (
                                <>
                                  <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <CreditCard size={18} />
                                  Pagar Ahora
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COLUMNA PAGOS REALIZADOS */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={20} color="#10b981" />
                      Historial de Pagos
                    </h3>
                    
                    {pagosRealizados.length === 0 ? (
                      <div style={{ padding: '32px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                        <Wallet size={32} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
                        <p style={{ margin: 0, fontWeight: '600' }}>Aún no has realizado ningún pago.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pagosRealizados.map(pago => (
                          <div key={pago.id} style={{
                            padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#166534', margin: '0 0 4px 0' }}>{pago.concepto?.nombre}</h4>
                              <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>Pagado el {formatDate(pago.fechaPago)}</p>
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#166534' }}>
                              {formatCurrency(pago.concepto?.monto)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
