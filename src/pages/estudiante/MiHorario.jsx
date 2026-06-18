import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

export default function MiHorario() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user?.id) {
      cargarHorarioReal();
    }
  }, [user]);

  async function cargarHorarioReal() {
    setCargando(true);
    try {
      // 1. Obtener todas las matrículas del estudiante
      const resMatriculas = await api.get(`/matriculas/estudiante/${user.id}`);
      const matriculas = resMatriculas.data || [];
      
      let todosLosHorarios = [];

      let cursosDelEstudiante = [];
      if (matriculas.length > 0) {
        const gradoId = matriculas[0].curso.grado.id;
        const cursosRes = await api.get(`/cursos/grado/${gradoId}`);
        cursosDelEstudiante = cursosRes.data;
      }

      // 2. Por cada curso matriculado, traer sus horarios
      for (const curso of cursosDelEstudiante) {
        if (curso && curso.id) {
          try {
            const resHorario = await api.get(`/horarios/curso/${curso.id}`);
            const horariosDelCurso = resHorario.data || [];
            
            // Inyectar la información del curso al horario para poder mostrarla
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
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem', fontFamily: 'var(--font-main)' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            <CalendarIcon size={14} strokeWidth={2.5} />
            Estudiante / Horario
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            Mi Horario Semanal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', maxWidth: '600px', lineHeight: '1.5' }}>
            Visualiza tus clases programadas según tus matrículas actuales.
          </p>
        </div>
      </header>

      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
        {cargando ? (
          <div style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Sincronizando con el servidor...</p>
          </div>
        ) : (
          <div style={{ flex: '1 1 0%', display: 'flex', overflowX: 'auto', width: '100%' }}>
            {DIAS.map((dia, index) => {
              // Ordenar las clases del día por hora de inicio
              const clasesDelDia = horarios
                .filter(h => h.diaSemana === dia)
                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
                
              return (
                <div key={dia} style={{ flex: '1 1 20%', minWidth: '260px', borderRight: index !== DIAS.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                    <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9375rem', margin: 0 }}>{dia}</h3>
                  </div>
                  <div style={{ padding: '1rem', flex: '1 1 0%', backgroundColor: 'white' }}>
                    {clasesDelDia.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <CalendarIcon size={32} color="var(--text-muted)" strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Día libre</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {clasesDelDia.map(clase => (
                          <div key={clase.id} style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: clase.tipoCurso === 'TALLER' ? '#F59E0B' : 'var(--primary)' }}></div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '900', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              <Clock size={16} />
                              <span>{clase.horaInicio} - {clase.horaFin}</span>
                            </div>
                            
                            <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.2', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {clase.nombreCurso}
                            </h4>
                            
                            <p style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                              {clase.codigoCurso}
                            </p>
                            
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-body)', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                              <MapPin size={14} color="var(--text-muted)" />
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
    </div>
  );
}
