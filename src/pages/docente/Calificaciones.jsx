import React, { useState, useEffect } from 'react';
import { Search, Save, Filter, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerEvaluacionesPorCurso } from '../../services/evaluacionService';
import { obtenerMatriculasPorCurso } from '../../services/matriculaService';
import { obtenerCalificacionesPorEvaluacion, registrarCalificacion, actualizarCalificacion } from '../../services/calificacionService';

export default function Calificaciones() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [notas, setNotas] = useState({}); // { estId: { evalId: { id, nota } } }
  
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (user?.id) cargarCursos();
  }, [user]);

  useEffect(() => {
    if (cursoSeleccionado) cargarDatosGrilla(cursoSeleccionado);
  }, [cursoSeleccionado]);

  const cargarCursos = async () => {
    try {
      const data = await obtenerCursosPorDocente(user.id);
      setCursos(data);
      if (data.length > 0) setCursoSeleccionado(data[0].id.toString());
    } catch (error) {
      console.error("Error cargando cursos:", error);
    }
  };

  const cargarDatosGrilla = async (cursoId) => {
    setCargando(true);
    try {
      // 1. Obtener Evaluaciones (Columnas)
      const evals = await obtenerEvaluacionesPorCurso(cursoId);
      setEvaluaciones(evals.sort((a,b) => a.orden - b.orden));

      // 2. Obtener Estudiantes matriculados (Filas)
      const matriculas = await obtenerMatriculasPorCurso(cursoId);
      setEstudiantes(matriculas.map(m => m.estudiante));

      // 3. Obtener Calificaciones para cada Evaluación
      const mapNotas = {};
      
      for (const ev of evals) {
        const califs = await obtenerCalificacionesPorEvaluacion(ev.id);
        califs.forEach(c => {
          if (!mapNotas[c.estudiante.id]) mapNotas[c.estudiante.id] = {};
          mapNotas[c.estudiante.id][ev.id] = { id: c.id, nota: c.nota };
        });
      }
      
      setNotas(mapNotas);

    } catch (error) {
      console.error("Error cargando grilla:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleNotaChange = (estudianteId, evaluacionId, valor) => {
    const valStr = valor === '' ? '' : Number(valor);
    setNotas(prev => ({
      ...prev,
      [estudianteId]: {
        ...(prev[estudianteId] || {}),
        [evaluacionId]: {
          ...(prev[estudianteId]?.[evaluacionId] || {}),
          nota: valStr
        }
      }
    }));
  };

  const calcularPromedio = (estudianteId) => {
    if (evaluaciones.length === 0) return 0;
    const estNotas = notas[estudianteId] || {};
    let sum = 0;
    let count = 0;
    evaluaciones.forEach(ev => {
      const notaObj = estNotas[ev.id];
      if (notaObj && typeof notaObj.nota === 'number') {
        sum += notaObj.nota;
        count++;
      }
    });
    if (count === 0) return 0;
    return (sum / count).toFixed(1);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      let promesas = [];
      for (const estudianteId of estudiantes.map(e => e.id)) {
        for (const ev of evaluaciones) {
          const notaObj = notas[estudianteId]?.[ev.id];
          if (notaObj && typeof notaObj.nota === 'number') {
            const payload = {
              evaluacion: { id: ev.id },
              estudiante: { id: estudianteId },
              nota: notaObj.nota,
              fechaRegistro: new Date().toISOString()
            };
            
            if (notaObj.id) {
              // Ya existía, actualizar
              promesas.push(actualizarCalificacion(notaObj.id, payload));
            } else {
              // Nueva calificación
              promesas.push(registrarCalificacion(payload));
            }
          }
        }
      }
      await Promise.all(promesas);
      alert("Calificaciones guardadas exitosamente");
      // Recargar para obtener los IDs nuevos
      cargarDatosGrilla(cursoSeleccionado);
    } catch (error) {
      console.error("Error guardando calificaciones:", error);
      alert("Hubo un error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Calificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona las notas reales de tus estudiantes.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm">
            <Download size={16} />
            Exportar
          </button>
          <button 
            onClick={guardarCambios}
            disabled={guardando || cargando}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
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
          <button className="flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay estudiantes o datos para este curso.
          </div>
        ) : evaluaciones.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            El administrador aún no ha configurado evaluaciones (unidades) para este curso.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-sm font-bold text-slate-500">Estudiante</th>
                  {evaluaciones.map(ev => (
                    <th key={ev.id} className="pb-3 text-sm font-bold text-slate-500 text-center">
                      {ev.nombre} <span className="block text-[10px] font-normal">({ev.ponderacion}%)</span>
                    </th>
                  ))}
                  <th className="pb-3 text-sm font-bold text-slate-500 text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est) => {
                  const promedio = calcularPromedio(est.id);
                  return (
                    <tr key={est.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-slate-800 text-sm">{est.nombre} {est.apellido}</div>
                        <div className="text-xs text-slate-400">ID: {est.id}</div>
                      </td>
                      
                      {evaluaciones.map(ev => (
                        <td key={ev.id} className="py-4 text-center">
                          <input 
                            type="number" 
                            min="0" max="20"
                            value={notas[est.id]?.[ev.id]?.nota ?? ''}
                            onChange={(e) => handleNotaChange(est.id, ev.id, e.target.value)}
                            className="w-16 text-center py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
                          />
                        </td>
                      ))}

                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          promedio >= 14 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : promedio >= 11 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {promedio}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
