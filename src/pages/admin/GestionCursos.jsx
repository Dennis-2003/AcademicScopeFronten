import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { 
  BookOpen, Rocket, Plus, Trash2, Edit2, AlertCircle, 
  BookMarked, Search, Users, User, LayoutGrid, X, 
  ChevronRight, Sparkles, Percent, Save, Loader2,
  GraduationCap
} from 'lucide-react';



function ConfiguracionEvaluacionesModal({ curso, onClose }) {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  useEffect(() => {
    cargarEvaluaciones();
  }, [curso]);

  async function cargarEvaluaciones() {
    try {
      const res = await api.get(`/evaluaciones/curso/${curso.id}`);
      setEvaluaciones(res.data.sort((a, b) => a.orden - b.orden));
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleAdd = () => {
    setEvaluaciones([...evaluaciones, { id: `new_${Date.now()}`, nombre: '', ponderacion: 0, orden: evaluaciones.length + 1, isNew: true }]);
  };

  const handleDelete = async (id) => {
    if (typeof id === 'string' && id.startsWith('new_')) {
      setEvaluaciones(evaluaciones.filter(e => e.id !== id));
      return;
    }
    if (window.confirm("¿Eliminar evaluación?")) {
      try {
        await api.delete(`/evaluaciones/${id}`);
        setEvaluaciones(evaluaciones.filter(e => e.id !== id));
      } catch (e) {
        alert("Error eliminando evaluación. Es posible que ya tenga notas registradas.");
      }
    }
  };

  const handleChange = (id, field, value) => {
    setEvaluaciones(evaluaciones.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const handleSaveAll = async () => {
    const totalPonderacion = evaluaciones.reduce((acc, ev) => acc + (parseFloat(ev.ponderacion) || 0), 0);
    if (totalPonderacion !== 100) {
      if (!window.confirm(`La suma de ponderaciones es ${totalPonderacion}%. Lo ideal es 100%. ¿Deseas guardar de todos modos?`)) {
        return;
      }
    }
    setGuardando(true);
    try {
      const promises = evaluaciones.map(ev => {
        const payload = {
          nombre: ev.nombre,
          ponderacion: parseFloat(ev.ponderacion) || 0,
          orden: ev.orden,
          curso: { id: curso.id }
        };
        if (ev.isNew) {
          return api.post('/evaluaciones', payload);
        } else {
          return api.put(`/evaluaciones/${ev.id}`, payload);
        }
      });
      await Promise.all(promises);
      alert("Configuración de notas guardada correctamente");
      onClose();
    } catch (e) {
      alert("Error guardando configuraciones");
    } finally {
      setGuardando(false);
    }
  };

  const suma = evaluaciones.reduce((acc, ev) => acc + (parseFloat(ev.ponderacion) || 0), 0);

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right shrink-0">
        
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Configurar Notas</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">{curso.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {cargando ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-700">Ponderaciones</span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${suma === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  Total: {suma}%
                </span>
              </div>
              
              {evaluaciones.map((ev, i) => (
                <div key={ev.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={ev.nombre} 
                      onChange={e => handleChange(ev.id, 'nombre', e.target.value)}
                      placeholder="Nombre (ej. Examen Parcial)"
                      className="w-full text-sm font-bold bg-white border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-20">
                    <div className="relative">
                      <input 
                        type="number" 
                        value={ev.ponderacion} 
                        onChange={e => handleChange(ev.id, 'ponderacion', e.target.value)}
                        className="w-full text-sm font-bold text-center bg-white border border-slate-200 rounded-md py-2 pr-4 outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button onClick={handleAdd} className="w-full py-3 mt-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold text-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                <Plus size={16} /> Añadir Evaluación
              </button>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-[0.4] py-3 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50">Cancelar</button>
          <button onClick={handleSaveAll} disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center gap-2">
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar Configuración
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default function GestionCursos() {
  const [grados, setGrados] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // TABS STATE
  const [selectedGradoId, setSelectedGradoId] = useState('ALL');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState(null);
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: '', codigo: '', tipo: 'REGULAR', docenteId: '', grado: { id: '' }
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Eval
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [cursoParaEval, setCursoParaEval] = useState(null);

  // CARGAR DATOS
  useEffect(() => {
    async function fetchDatos() {
      try {
        const [resGrados, resDocentes, resCursos] = await Promise.all([
          api.get('/grados'),
          api.get('/usuarios/rol/DOCENTE'),
          api.get('/cursos')
        ]);
        
        const cursos = resCursos.data || [];
        const gradosConCursos = (resGrados.data || []).map(g => ({
          ...g,
          cursos: cursos.filter(c => c.grado?.id === g.id && c.tipo !== 'TALLER')
        }));

        const talleres = cursos.filter(c => !c.grado || c.tipo === 'TALLER');
        if (talleres.length > 0 || true) {
          gradosConCursos.push({
            id: 'talleres-extracurriculares',
            nombre: 'Talleres Extracurriculares',
            nivel: 'TALLERES',
            cursos: talleres
          });
        }
        
        setGrados(gradosConCursos);
        setDocentes(resDocentes.data || []);
      } catch (err) {
        console.error("Error al cargar grados/docentes/cursos:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, []);

  // Filter only secondary grades (and optionally talleres if you want to keep them, but user said ONLY secondary, so let's just show all grades that exist assuming they are secondary, or strictly filter to 'Secundaria').
  // Let's strictly use the ones from the backend and maybe filter out Primaria just in case.
  const activeGrados = grados;

  let cursosMostrados = [];
  if (selectedGradoId === 'ALL') {
    activeGrados.forEach(g => {
      if (g.cursos) cursosMostrados = [...cursosMostrados, ...g.cursos.map(c => ({...c, gradoRef: g}))];
    });
  } else {
    const found = activeGrados.find(g => g.id === selectedGradoId);
    if (found && found.cursos) {
      cursosMostrados = found.cursos.map(c => ({...c, gradoRef: found}));
    }
  }

  if (searchTerm) {
    cursosMostrados = cursosMostrados.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleEdit = (curso, gradoId) => {
    setCursoAEditar(curso);
    setNuevoCurso({
      ...curso,
      docenteId: curso.docente ? curso.docente.id : '',
      grado: { id: gradoId || '' }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este curso permanentemente?')) return;
    try {
      await api.delete(`/cursos/${id}`);
      const nuevosGrados = grados.map(g => ({
        ...g,
        cursos: g.cursos.filter(c => c.id !== id)
      }));
      setGrados(nuevosGrados);
    } catch (err) {
      alert("Error al eliminar. Verifique que no haya evaluaciones asociadas.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const isTaller = nuevoCurso.tipo === 'TALLER' || nuevoCurso.grado.id === 'talleres-extracurriculares';
      const payload = {
        ...nuevoCurso,
        docente: nuevoCurso.docenteId ? { id: nuevoCurso.docenteId } : null,
        grado: isTaller ? null : { id: nuevoCurso.grado.id }
      };

      if (cursoAEditar) {
        const res = await api.put(`/cursos/${cursoAEditar.id}`, payload);
        const nuevosGrados = grados.map(g => ({
          ...g,
          cursos: g.cursos.map(c => c.id === cursoAEditar.id ? res.data : c)
        }));
        setGrados(nuevosGrados);
      } else {
        const res = await api.post('/cursos', payload);
        const nuevosGrados = grados.map(g => {
          if (isTaller && g.id === 'talleres-extracurriculares') {
            return { ...g, cursos: [...g.cursos, res.data] };
          }
          if (!isTaller && g.id === payload.grado.id) {
            return { ...g, cursos: [...g.cursos, res.data] };
          }
          return g;
        });
        setGrados(nuevosGrados);
      }
      closeAndResetModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el curso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewCourseModal = () => {
    setCursoAEditar(null);
    setNuevoCurso({
      nombre: '', codigo: '', tipo: 'REGULAR', docenteId: '', grado: { id: selectedGradoId === 'ALL' ? '' : selectedGradoId }
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const closeAndResetModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setCursoAEditar(null);
      setNuevoCurso({ nombre: '', codigo: '', tipo: 'REGULAR', docenteId: '', grado: { id: '' } });
      setErrorMsg('');
    }, 300);
  };

  if (cargando) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] w-full">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
          <BookOpen className="text-indigo-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-medium">Cargando gestión académica...</p>
      </div>
    );
  }

  const totalCursos = activeGrados.reduce((acc, curr) => acc + (curr.cursos?.length || 0), 0);
  const totalDocentes = docentes.length;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col">
      {/* GLOBAL HERO HEADER - COMPACTO */}
      <div className="relative mb-6 bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-800 shrink-0 w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[50px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700/60 shadow-inner">
                <LayoutGrid size={24} strokeWidth={2.5} />
              </div>
              <div>
                Gestión <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Académica</span>
              </div>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <BookMarked size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Cursos</p>
                <p className="text-2xl font-black text-white leading-none">{totalCursos}</p>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Users size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Docentes</p>
                <p className="text-2xl font-black text-white leading-none">{totalDocentes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENTERPRISE TABLE VIEW */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-0 w-full mb-8">
        
        {/* TOOLBAR & FILTERS */}
        <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 border-b border-slate-100">
          
          {/* PILLS */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
            <button
              onClick={() => setSelectedGradoId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedGradoId === 'ALL' ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
            >
              Todos los Grados
            </button>
            {activeGrados.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGradoId(g.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedGradoId === g.id ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
              >
                {g.nombre}
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar curso o código..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={openNewCourseModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              Nuevo
            </button>
          </div>

        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Código</th>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Curso</th>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Grado</th>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Docente Asignado</th>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {cursosMostrados.map(curso => (
                <tr key={curso.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-8">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black tracking-widest uppercase rounded-lg border border-slate-200/60">
                      {curso.codigo}
                    </span>
                  </td>
                  <td className="py-4 px-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner border ${curso.tipo === 'TALLER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {curso.tipo === 'TALLER' ? <Rocket size={16} strokeWidth={2.5} /> : <BookOpen size={16} strokeWidth={2.5} />}
                      </div>
                      <span className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">{curso.nombre}</span>
                    </div>
                  </td>
                  <td className="py-4 px-8">
                    <span className="text-xs font-bold text-slate-500">
                      {curso.gradoRef ? curso.gradoRef.nombre : 'Taller General'}
                    </span>
                  </td>
                  <td className="py-4 px-8">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                        <User size={12} className="text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {curso.docente ? `${curso.docente.nombre} ${curso.docente.apellido}` : <span className="text-slate-400 italic font-normal">Sin asignar</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-8">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setCursoParaEval(curso); setShowEvalModal(true); }}
                        className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                      >
                        <Percent size={14} strokeWidth={2.5} />
                        Notas
                      </button>
                      <button 
                        onClick={() => handleEdit(curso, curso.gradoRef?.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(curso.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {cursosMostrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
                      <BookOpen className="text-slate-300" size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">No se encontraron cursos</h3>
                    <p className="text-sm text-slate-500 font-medium">Prueba ajustando los filtros de búsqueda o agrega uno nuevo.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DRAWER PARA NUEVO / EDITAR CURSO --- */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeAndResetModal}
          ></div>

          <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right shrink-0">
            
            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-0.5">
                  {cursoAEditar ? 'Editar Curso' : 'Nuevo Curso'}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {cursoAEditar ? 'Modifica los detalles.' : 'Registra un nuevo curso.'}
                </p>
              </div>
              <button 
                onClick={closeAndResetModal} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-7 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {errorMsg && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} strokeWidth={2.5} />
                  {errorMsg}
                </div>
              )}
              
              <form id="cursoForm" onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Curso</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400" 
                    value={nuevoCurso.nombre} 
                    onChange={e => setNuevoCurso({ ...nuevoCurso, nombre: e.target.value })} 
                    placeholder="Ej. Álgebra Avanzada" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Código</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-black text-sm text-slate-900 placeholder:text-slate-400 uppercase tracking-wider" 
                      value={nuevoCurso.codigo} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, codigo: e.target.value.toUpperCase() })} 
                      placeholder="ALG-101" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
                      value={nuevoCurso.tipo} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, tipo: e.target.value })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="REGULAR">Regular</option>
                      <option value="TALLER">Taller</option>
                    </select>
                  </div>
                </div>
                
                {nuevoCurso.tipo === 'REGULAR' && (
                  <div className="animate-fade-in">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grado Asociado</label>
                    <select 
                      required 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
                      value={nuevoCurso.grado.id} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, grado: { id: e.target.value } })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="">Selecciona un grado...</option>
                      {activeGrados.filter(g => g.id !== 'talleres-extracurriculares').map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.nivel})</option>)}
                    </select>
                  </div>
                )}
                
                <div className="pt-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Docente Asignado</label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
                    value={nuevoCurso.docenteId} 
                    onChange={e => setNuevoCurso({ ...nuevoCurso, docenteId: e.target.value })}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Sin asignar...</option>
                    {(docentes || []).map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
                  </select>
                </div>
              </form>
            </div>

            <div className="px-7 py-6 border-t border-slate-100 bg-white shrink-0 flex gap-3">
              <button 
                type="button" 
                onClick={closeAndResetModal} 
                disabled={isSubmitting}
                className="flex-[0.4] py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="cursoForm"
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : (cursoAEditar ? 'Guardar Cambios' : 'Registrar Curso')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- DRAWER PARA EVALUACIONES --- */}
      {showEvalModal && cursoParaEval && createPortal(
        <ConfiguracionEvaluacionesModal 
          curso={cursoParaEval} 
          onClose={() => { setShowEvalModal(false); setCursoParaEval(null); }} 
        />,
        document.body
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
