import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, Save, MessageSquareText, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerMatriculasPorCurso } from '../../services/matriculaService';
import { registrarComportamiento } from '../../services/comportamientoService';

export default function Semaforo() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (user?.id) {
      cargarCursos();
    }
  }, [user]);

  useEffect(() => {
    if (cursoSeleccionado) {
      cargarEstudiantes(cursoSeleccionado);
    }
  }, [cursoSeleccionado]);

  async function cargarCursos() {
    try {
      const data = await obtenerCursosPorDocente(user.id);
      setCursos(data);
      if (data.length > 0) {
        setCursoSeleccionado(data[0].id.toString());
      }
    } catch (error) {
      console.error("Error cargando cursos:", error);
    }
  };

  async function cargarEstudiantes(cursoId) {
    setCargando(true);
    try {
      const matriculas = await obtenerMatriculasPorCurso(cursoId);
      
      const listaEstudiantes = matriculas.map(m => ({
        id: m.estudiante.id,
        nombre: `${m.estudiante.nombre} ${m.estudiante.apellido}`,
        estado: '', 
        observacion: ''
      }));
      setEstudiantes(listaEstudiantes);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleEstadoChange = (id, nuevoEstado) => {
    setEstudiantes(estudiantes.map(est => 
      est.id === id ? { ...est, estado: nuevoEstado } : est
    ));
  };

  const handleObservacionChange = (id, obs) => {
    setEstudiantes(estudiantes.map(est => 
      est.id === id ? { ...est, observacion: obs } : est
    ));
  };

  const guardarReportes = async () => {
    setGuardando(true);
    try {
      const reportesAEnviar = estudiantes.filter(e => e.estado !== '');
      
      for (const est of reportesAEnviar) {
        const comportamiento = {
          estudiante: { id: est.id },
          docente: { id: user.id },
          curso: { id: parseInt(cursoSeleccionado) },
          periodoAcademico: { id: 1 }, 
          tipo: est.estado.toUpperCase(),
          descripcion: est.observacion,
          fechaRegistro: new Date().toISOString()
        };
        await registrarComportamiento(comportamiento);
      }
      alert("Reportes guardados correctamente");
      // Limpiar los estados para evitar reenvíos
      setEstudiantes(estudiantes.map(e => ({...e, estado: '', observacion: ''})));
    } catch (error) {
      console.error("Error guardando reportes:", error);
      alert("Hubo un error al guardar los reportes");
    } finally {
      setGuardando(false);
    }
  };

  const getSemaforoColor = (estado) => {
    switch (estado) {
      case 'verde': return 'bg-emerald-500 shadow-emerald-500/40 border-emerald-600';
      case 'amarillo': return 'bg-amber-400 shadow-amber-400/40 border-amber-500';
      case 'rojo': return 'bg-red-500 shadow-red-500/40 border-red-600';
      default: return 'bg-slate-200 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            Semáforo Académico
          </h1>
          <p className="text-slate-500 text-sm mt-1">Reporta el comportamiento y rendimiento general de tus alumnos.</p>
        </div>
        <button 
          onClick={guardarReportes}
          disabled={guardando}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200 disabled:opacity-50"
        >
          {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {guardando ? "Guardando..." : "Guardar Reportes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar estudiante..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <select 
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 min-w-[200px]"
          >
            {cursos.length === 0 && <option value="">Sin cursos asignados</option>}
            {cursos.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} - Grado {c.grado?.nombre || ''}</option>
            ))}
          </select>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay estudiantes matriculados en este curso.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estudiantes.map((est) => (
              <div key={est.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{est.nombre}</h3>
                    <p className="text-xs text-slate-400">ID: {est.id}</p>
                  </div>
                  <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button 
                      onClick={() => handleEstadoChange(est.id, 'verde')}
                      className={`w-6 h-6 rounded-full border-2 transition-all shadow-sm ${est.estado === 'verde' ? getSemaforoColor('verde') : 'bg-slate-200/50 border-slate-300 opacity-50 hover:opacity-100'}`}
                    />
                    <button 
                      onClick={() => handleEstadoChange(est.id, 'amarillo')}
                      className={`w-6 h-6 rounded-full border-2 transition-all shadow-sm ${est.estado === 'amarillo' ? getSemaforoColor('amarillo') : 'bg-slate-200/50 border-slate-300 opacity-50 hover:opacity-100'}`}
                    />
                    <button 
                      onClick={() => handleEstadoChange(est.id, 'rojo')}
                      className={`w-6 h-6 rounded-full border-2 transition-all shadow-sm ${est.estado === 'rojo' ? getSemaforoColor('rojo') : 'bg-slate-200/50 border-slate-300 opacity-50 hover:opacity-100'}`}
                    />
                  </div>
                </div>
                <div className="relative">
                  <MessageSquareText size={16} className="absolute left-3 top-3 text-slate-400" />
                  <textarea 
                    rows="2"
                    placeholder="Añadir observación para el tutor..."
                    value={est.observacion}
                    onChange={(e) => handleObservacionChange(est.id, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
