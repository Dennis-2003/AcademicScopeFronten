import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { GraduationCap, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

export default function HorarioHijos() {
  const { user } = useAuth();
  const [hijos, setHijos] = useState([]);
  const [hijoActivo, setHijoActivo] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const seleccionarHijo = useCallback((hijo) => {
    setHijoActivo(hijo);
    cargarHorarioReal(hijo.id);
  }, []);

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

  async function cargarHorarioReal(estudianteId) {
    setCargando(true);
    try {
      // 1. Obtener matrícula
      const resMatriculas = await api.get(`/matriculas/estudiante/${estudianteId}`);
      const matriculas = resMatriculas.data || [];
      
      let todosLosHorarios = [];
      let cursosDelEstudiante = [];
      
      if (matriculas.length > 0) {
        const gradoId = matriculas[0].curso.grado.id;
        const cursosRes = await api.get(`/cursos/grado/${gradoId}`);
        cursosDelEstudiante = cursosRes.data;
      }

      // 2. Horarios por curso
      for (const curso of cursosDelEstudiante) {
        if (curso && curso.id) {
          try {
            const resHorario = await api.get(`/horarios/curso/${curso.id}`);
            const horariosDelCurso = resHorario.data || [];
            const horariosConInfo = horariosDelCurso.map(h => ({
              ...h,
              nombreCurso: curso.nombre,
              codigoCurso: curso.codigo,
              tipoCurso: curso.tipo
            }));
            todosLosHorarios = [...todosLosHorarios, ...horariosConInfo];
          } catch (e) {
            console.error(`Error cargando horario para curso ${curso.id}:`, e);
          }
        }
      }
      
      setHorarios(todosLosHorarios);
    } catch (error) {
      console.error("Error al cargar el horario del estudiante:", error);
    } finally {
      setCargando(false);
    }
  }

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
          Tutor / Horarios
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Horarios de Clases
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', margin: 0, fontWeight: '500' }}>
          Revisa el cronograma académico semanal de tus hijos.
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
              overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: '32px 32px 24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                  {hijoActivo.nombre?.charAt(0)}{hijoActivo.apellido?.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>Horario de {hijoActivo.nombre}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
                    <span style={{ padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>{hijoActivo.grado || 'Sin grado'}</span>
                  </div>
                </div>
              </div>

              {cargando ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                  <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Sincronizando horario...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', overflowX: 'auto', width: '100%', minHeight: '500px' }}>
                  {DIAS.map((dia, index) => {
                    const clasesDelDia = horarios
                      .filter(h => h.diaSemana === dia)
                      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
                      
                    return (
                      <div key={dia} style={{ flex: '1 1 20%', minWidth: '260px', borderRight: index !== DIAS.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                          <h3 style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px', margin: 0 }}>{dia}</h3>
                        </div>
                        <div style={{ padding: '16px', flex: '1 1 0%', backgroundColor: '#ffffff' }}>
                          {clasesDelDia.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                              <CalendarIcon size={32} color="#94a3b8" strokeWidth={1.5} style={{ marginBottom: '8px' }} />
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>Día libre</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {clasesDelDia.map(clase => (
                                <div key={clase.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: clase.tipoCurso === 'TALLER' ? '#f59e0b' : '#3b82f6' }}></div>
                                  
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '900', fontSize: '14px', marginBottom: '8px' }}>
                                    <Clock size={16} />
                                    <span>{clase.horaInicio} - {clase.horaFin}</span>
                                  </div>
                                  
                                  <h4 style={{ fontWeight: '800', color: '#1e293b', fontSize: '16px', lineHeight: '1.2', marginBottom: '4px' }}>
                                    {clase.nombreCurso}
                                  </h4>
                                  
                                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                                    {clase.codigoCurso}
                                  </p>
                                  
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#64748b', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <MapPin size={14} color="#94a3b8" />
                                    <span>Aula: {clase.aula}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
    </div>
  );
}
