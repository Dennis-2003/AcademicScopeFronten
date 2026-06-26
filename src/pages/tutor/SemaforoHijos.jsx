import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  GraduationCap, 
  Award, 
  MessageCircle, 
  FileText, 
  Users, 
  Calculator, 
  X, 
  Plus, 
  Trash2,
  ChevronRight
} from 'lucide-react';

export default function SemaforoHijos() {
  const { user } = useAuth();
  const [hijos, setHijos] = useState([]);
  const [todosLosAlumnos, setTodosLosAlumnos] = useState([]);
  const [hijoActivo, setHijoActivo] = useState(null);
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados del Modal
  const [cursoModal, setCursoModal] = useState(null);
  const [tabActivo, setTabActivo] = useState('evaluaciones'); // evaluaciones | companeros | simulador
  const [notasSimuladas, setNotasSimuladas] = useState([]);
  const [nuevaNotaSimulada, setNuevaNotaSimulada] = useState('');

  const seleccionarHijo = useCallback((hijo) => {
    setHijoActivo(hijo);
    api.get(`/calificaciones/estudiante/${hijo.id}`).then(res => {
      setNotas(res.data || []);
    }).catch(() => setNotas([]));
  }, []);

  useEffect(() => {
    setCargando(true);
    api.get('/usuarios/rol/ESTUDIANTE').then(res => {
      const allStudents = res.data || [];
      setTodosLosAlumnos(allStudents);
      const misHijos = allStudents.filter(est => est.tutor && est.tutor.id === user.id);
      setHijos(misHijos);
      if (misHijos.length > 0) {
        seleccionarHijo(misHijos[0]);
      }
      setCargando(false);
    }).catch(() => setCargando(false));
  }, [user.id, seleccionarHijo]);

  const getSemaforoStyles = (nota) => {
    if (nota >= 18) return { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', letra: 'AD' };
    if (nota >= 14) return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', letra: 'A' };
    if (nota >= 11) return { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', letra: 'B' };
    return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', letra: 'C' };
  };

  const getSemaforoLabel = (nota) => {
    if (nota >= 18) return 'Logro Destacado';
    if (nota >= 14) return 'Logro Esperado';
    if (nota >= 11) return 'En Proceso';
    return 'En Inicio';
  };

  const agruparPorCurso = (notasArray) => {
    const cursosMap = {};
    notasArray.forEach(nota => {
      const cursoNombre = nota.evaluacion?.curso?.nombre || 'General';
      if (!cursosMap[cursoNombre]) {
        cursosMap[cursoNombre] = {
          nombre: cursoNombre,
          evaluaciones: []
        };
      }
      cursosMap[cursoNombre].evaluaciones.push(nota);
    });

    return Object.values(cursosMap).map(curso => {
      curso.evaluaciones.sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));
      const sum = curso.evaluaciones.reduce((acc, curr) => acc + curr.nota, 0);
      curso.promedio = Math.round(sum / curso.evaluaciones.length);
      return curso;
    });
  };

  const cursosAgrupados = agruparPorCurso(notas);

  // Lógica del Modal
  const abrirModalCurso = (curso) => {
    setCursoModal(curso);
    setTabActivo('evaluaciones');
    setNotasSimuladas(curso.evaluaciones.map(e => ({ ...e, simulada: false, idUnico: e.id })));
    setNuevaNotaSimulada('');
  };

  const cerrarModal = () => {
    setCursoModal(null);
  };

  const getCompaneros = () => {
    if (!hijoActivo) return [];
    // Filtramos los estudiantes que tengan el mismo grado, exceptuando al hijo activo
    return todosLosAlumnos.filter(al => al.grado === hijoActivo.grado && al.id !== hijoActivo.id);
  };

  const agregarNotaSimulada = () => {
    const valor = parseInt(nuevaNotaSimulada);
    if (!isNaN(valor) && valor >= 0 && valor <= 20) {
      setNotasSimuladas([...notasSimuladas, {
        idUnico: Date.now(),
        nota: valor,
        simulada: true,
        evaluacion: { nombre: `Simulación ${notasSimuladas.length + 1}` }
      }]);
      setNuevaNotaSimulada('');
    }
  };

  const eliminarNotaSimulada = (idUnico) => {
    setNotasSimuladas(notasSimuladas.filter(n => n.idUnico !== idUnico));
  };

  const calcularPromedioSimulado = () => {
    if (notasSimuladas.length === 0) return 0;
    const sum = notasSimuladas.reduce((acc, curr) => acc + curr.nota, 0);
    return Math.round(sum / notasSimuladas.length);
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Cargando calificaciones...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: '48px', animation: 'fadeIn 0.5s ease-out' }}>
      {/* HEADER */}
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
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          backgroundColor: '#f1f5f9', color: '#475569', padding: '6px 16px', 
          borderRadius: '99px', fontSize: '12px', fontWeight: '700', 
          letterSpacing: '0.05em', textTransform: 'uppercase', width: 'fit-content'
        }}>
          Tutor / Rendimiento
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Rendimiento por Curso
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', margin: 0, fontWeight: '500' }}>
          Selecciona un curso para ver evaluaciones, compañeros de clase y el simulador de notas.
        </p>
      </div>

      {hijos.length === 0 ? (
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

          {/* DETALLE DEL HIJO ACTIVO Y LISTA DE CURSOS */}
          {hijoActivo && (
            <div style={{
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                  {hijoActivo.nombre?.charAt(0)}{hijoActivo.apellido?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>Cursos de {hijoActivo.nombre}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    <span style={{ padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>{hijoActivo.grado || 'Grado no especificado'}</span>
                  </div>
                </div>
              </div>

              {cursosAgrupados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <FileText size={40} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#475569', margin: '0 0 8px 0' }}>Sin Cursos Registrados</h3>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Aún no se han registrado notas en este periodo.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {cursosAgrupados.map(curso => {
                    const avgStyles = getSemaforoStyles(curso.promedio);
                    return (
                      <div 
                        key={curso.nombre} 
                        onClick={() => abrirModalCurso(curso)}
                        style={{
                          borderRadius: '20px', backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0', overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                          display: 'flex', flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                          e.currentTarget.style.borderColor = avgStyles.border;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        {/* CABECERA RESUMEN */}
                        <div style={{
                          backgroundColor: avgStyles.bg, padding: '24px', flex: 1,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: avgStyles.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                              <Award size={14} />
                              {getSemaforoLabel(curso.promedio)}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                              {curso.nombre}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                              {curso.evaluaciones.length} evaluaciones
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <div style={{
                              width: '56px', height: '56px', borderRadius: '50%',
                              backgroundColor: '#ffffff', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', color: avgStyles.color,
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: `2px solid ${avgStyles.color}`
                            }}>
                              <span style={{ fontSize: '20px', fontWeight: '900', lineHeight: '1' }}>{avgStyles.letra}</span>
                            </div>
                            <div style={{ 
                              backgroundColor: avgStyles.color, color: '#ffffff', 
                              padding: '2px 8px', borderRadius: '99px', fontSize: '11px', 
                              fontWeight: '800', marginTop: '-10px', zIndex: 1
                            }}>
                              {curso.promedio} / 20
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                          Ver detalles del curso
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL DEL CURSO */}
      {cursoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '800px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            {/* Cabecera del Modal */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{cursoModal.nombre}</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>Detalles y proyecciones</p>
              </div>
              <button 
                onClick={cerrarModal}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
                  cursor: 'pointer', color: '#64748b', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs del Modal */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              {[
                { id: 'evaluaciones', label: 'Mis Notas', icon: Award },
                { id: 'companeros', label: 'Compañeros', icon: Users },
                { id: 'simulador', label: 'Simulador', icon: Calculator }
              ].map(tab => {
                const isActive = tabActivo === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTabActivo(tab.id)}
                    style={{
                      flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                      border: 'none', borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#3b82f6' : '#64748b', transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              
              {/* TAB 1: EVALUACIONES */}
              {tabActivo === 'evaluaciones' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {cursoModal.evaluaciones.map((nota, i) => {
                    const evalStyles = getSemaforoStyles(nota.nota);
                    return (
                      <div key={nota.id} style={{
                        padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9', display: 'flex', gap: '16px'
                      }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%', backgroundColor: evalStyles.bg,
                          color: evalStyles.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', fontWeight: '800', flexShrink: 0, border: `1px solid ${evalStyles.border}`
                        }}>
                          {evalStyles.letra}
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Evaluación {i + 1}</p>
                          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', margin: '0 0 4px 0' }}>{nota.evaluacion?.nombre || 'Examen'}</h4>
                          <p style={{ fontSize: '13px', fontWeight: '700', color: evalStyles.color, margin: 0 }}>Nota Exacta: {nota.nota}/20</p>
                          {nota.comentarioDocente && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <MessageCircle size={14} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontStyle: 'italic' }}>"{nota.comentarioDocente}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: COMPAÑEROS */}
              {tabActivo === 'companeros' && (
                <div>
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '16px', marginBottom: '24px', color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
                    A continuación se listan los compañeros de grado de <b>{hijoActivo.nombre}</b>. Por políticas de privacidad, no se muestran las calificaciones individuales de otros estudiantes.
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {getCompaneros().map(comp => (
                      <div key={comp.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff'
                      }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                          {comp.nombre?.charAt(0)}{comp.apellido?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#334155' }}>{comp.nombre} {comp.apellido}</p>
                        </div>
                      </div>
                    ))}
                    {getCompaneros().length === 0 && (
                      <p style={{ color: '#64748b', fontSize: '14px', gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>No se encontraron compañeros en el mismo grado.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SIMULADOR */}
              {tabActivo === 'simulador' && (() => {
                const prom = calcularPromedioSimulado();
                const promStyles = getSemaforoStyles(prom);
                
                return (
                  <div>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                      {/* Formulario e Historial Simulador */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Lista de Evaluaciones (Reales y Simuladas)</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                          {notasSimuladas.map((nota, idx) => (
                            <div key={nota.idUnico} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px',
                              backgroundColor: nota.simulada ? '#f0fdf4' : '#f8fafc',
                              borderColor: nota.simulada ? '#bbf7d0' : '#e2e8f0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                  {nota.nota}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#334155' }}>{nota.evaluacion?.nombre}</p>
                                  {nota.simulada && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Evaluación Simulada</span>}
                                </div>
                              </div>
                              {nota.simulada && (
                                <button onClick={() => eliminarNotaSimulada(nota.idUnico)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Agregar Nota */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input 
                            type="number" 
                            min="0" max="20" 
                            placeholder="Ej: 18"
                            value={nuevaNotaSimulada}
                            onChange={(e) => setNuevaNotaSimulada(e.target.value)}
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                          />
                          <button 
                            onClick={agregarNotaSimulada}
                            style={{
                              padding: '0 24px', backgroundColor: '#3b82f6', color: '#ffffff',
                              border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                          >
                            <Plus size={18} />
                            Añadir Nota Ficticia
                          </button>
                        </div>
                      </div>

                      {/* Resultado Simulado */}
                      <div style={{
                        width: '280px', padding: '32px 24px', borderRadius: '24px',
                        backgroundColor: promStyles.bg, border: `1px solid ${promStyles.border}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '12px', fontWeight: '800', color: promStyles.color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>Promedio Proyectado</p>
                        
                        <div style={{
                          width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: promStyles.color, fontSize: '40px', fontWeight: '900',
                          border: `4px solid ${promStyles.color}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}>
                          {promStyles.letra}
                        </div>
                        
                        <div style={{ backgroundColor: promStyles.color, color: '#ffffff', padding: '4px 16px', borderRadius: '99px', fontSize: '18px', fontWeight: '800', marginTop: '-16px', zIndex: 1 }}>
                          {prom} / 20
                        </div>
                        
                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '24px 0 8px 0' }}>{getSemaforoLabel(prom)}</h4>
                        <p style={{ fontSize: '13px', color: '#475569', margin: 0, fontWeight: '500' }}>
                          Basado en las notas reales y las simulaciones ingresadas.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
