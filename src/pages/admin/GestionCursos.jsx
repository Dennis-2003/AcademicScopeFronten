import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { 
  BookOpen, Rocket, Plus, Trash2, Edit2, AlertCircle, 
  BookMarked, Search, Users, User, LayoutGrid, X, 
  ChevronRight, Sparkles, Percent, Save, Loader2
} from 'lucide-react';

function GradoListItem({ nombre, subtitle, courseCount, isTaller, isSelected, onClick }) {
  const Icon = isTaller ? Rocket : BookMarked;
  
  const activeClass = isSelected 
    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 border-transparent translate-x-1' 
    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md';

  const iconActive = isSelected ? 'text-white' : (isTaller ? 'text-orange-500' : 'text-indigo-500');
  const iconBg = isSelected ? 'bg-white/20 shadow-inner' : (isTaller ? 'bg-orange-50' : 'bg-indigo-50');
  const subtitleActive = isSelected ? 'text-indigo-200' : 'text-slate-400';
  const badgeClass = isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600';

  return (
    <button 
      onClick={onClick}
      className={`group w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${activeClass}`}
    >
      <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors ${iconBg}`}>
        <Icon size={20} className={iconActive} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-black truncate leading-tight mb-1">{nombre}</h3>
        <p className={`text-[10px] font-black uppercase tracking-widest truncate ${subtitleActive}`}>{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className={`text-xs font-black px-2.5 py-1 rounded-lg transition-colors ${badgeClass}`}>
          {courseCount}
        </div>
        <ChevronRight size={18} className={`transition-transform duration-300 ${isSelected ? 'text-white translate-x-1 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
      </div>
    </button>
  );
}

function CourseCard({ curso, docente, onEdit, onDelete, onConfigEvals }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all relative group flex flex-col h-full">
      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md rounded-lg p-1.5 shadow-sm border border-slate-100 z-10">
        <button onClick={() => onConfigEvals(curso)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Configurar Evaluaciones">
          <Percent size={16} strokeWidth={2.5} />
        </button>
        <button onClick={() => onEdit(curso)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar Curso">
          <Edit2 size={16} strokeWidth={2.5} />
        </button>
        <button onClick={() => onDelete(curso.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Eliminar Curso">
          <Trash2 size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${curso.tipo === 'TALLER' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'}`}>
          {curso.tipo === 'TALLER' ? <Rocket size={22} strokeWidth={2.5} /> : <BookOpen size={22} strokeWidth={2.5} />}
        </div>
        <div className="pt-0.5">
          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest uppercase rounded-lg mb-1.5">
            {curso.codigo}
          </span>
          <h4 className="text-lg font-black text-slate-800 leading-tight pr-12 group-hover:text-indigo-700 transition-colors">
            {curso.nombre}
          </h4>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-100/80">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50/80 inline-flex px-3 py-2 rounded-xl border border-slate-100">
          <User size={14} className="text-slate-400" />
          {docente ? `${docente.nombre} ${docente.apellido}` : 'Sin docente asignado'}
        </div>
      </div>
    </div>
  );
}

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
      <div className="relative w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
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
  
  // Estado para la vista de detalle
  const [selectedGrado, setSelectedGrado] = useState(null);
  
  // Estado para el modal
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

  const primaria = grados.filter(g => g.nivel === 'Primaria');
  const secundaria = grados.filter(g => g.nivel === 'Secundaria');
  const talleres = grados.filter(g => g.id === 'talleres-extracurriculares');

  // Actualizar el selectedGrado si hay cambios en 'grados'
  useEffect(() => {
    if (selectedGrado) {
      const updated = grados.find(g => g.id === selectedGrado.id);
      if (updated) setSelectedGrado(updated);
    } else if (grados.length > 0 && !selectedGrado) {
      // Auto seleccionar el primer grado disponible
      setSelectedGrado(grados[0]);
    }
  }, [grados]);

  // ACCIONES
  const handleEdit = (curso, gradoId) => {
    setCursoAEditar(curso);
    setNuevoCurso({
      ...curso,
      docenteId: curso.docente ? curso.docente.id : '',
      grado: { id: gradoId }
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
        const cursoActualizado = res.data;
        const targetGradoId = isTaller ? 'talleres-extracurriculares' : payload.grado.id;

        const nuevosGrados = grados.map(g => {
          let newCursos = g.cursos.filter(c => c.id !== cursoAEditar.id);
          if (g.id === targetGradoId) {
            newCursos.push(cursoActualizado);
          }
          return { ...g, cursos: newCursos };
        });
        setGrados(nuevosGrados);
      } else {
        const res = await api.post('/cursos', payload);
        const cursoCreado = res.data;
        const targetGradoId = isTaller ? 'talleres-extracurriculares' : payload.grado.id;
        
        const nuevosGrados = grados.map(g => {
          if (g.id === targetGradoId) {
            return {
              ...g,
              cursos: [...(g.cursos || []), cursoCreado]
            };
          }
          return g;
        });
        setGrados(nuevosGrados);
      }
      closeAndResetModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el curso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAndResetModal = () => {
    setShowModal(false);
    setCursoAEditar(null);
    setNuevoCurso({ nombre: '', codigo: '', tipo: 'REGULAR', docenteId: '', grado: { id: selectedGrado ? selectedGrado.id : '' } });
    setErrorMsg('');
  };

  const openNewCourseModal = () => {
    setCursoAEditar(null);
    setNuevoCurso({ 
      nombre: '', 
      codigo: '', 
      tipo: selectedGrado?.id === 'talleres-extracurriculares' ? 'TALLER' : 'REGULAR', 
      docenteId: '', 
      grado: { id: selectedGrado ? selectedGrado.id : '' } 
    });
    setShowModal(true);
  };

  const totalCursos = (grados || []).reduce((acc, g) => acc + (g?.cursos?.length || 0), 0);
  const totalDocentes = (docentes || []).length;

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
           <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
        </div>
      </div>
    );
  }

  const renderLeftSection = (title, data) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
          {title === 'Extracurriculares' ? <Sparkles size={14} className="text-amber-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
          {title}
        </h4>
        <div className="flex flex-col gap-2">
          {data.map(grado => (
            <GradoListItem
              key={grado.id}
              nombre={grado.nombre}
              subtitle={grado.nivel}
              courseCount={grado.cursos?.length || 0}
              isTaller={grado.id === 'talleres-extracurriculares'}
              isSelected={selectedGrado?.id === grado.id}
              onClick={() => { setSelectedGrado(grado); setSearchTerm(''); }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-8 h-[calc(100vh-80px)] flex flex-col">
      {/* GLOBAL HERO HEADER - COMPACTO */}
      <div className="relative mb-6 bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-xl shadow-indigo-900/10 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/20 shadow-inner">
                <LayoutGrid size={24} strokeWidth={2.5} />
              </div>
              <div>
                Gestión <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Académica</span>
              </div>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <BookMarked size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest mb-0.5">Total Cursos</p>
                <p className="text-2xl font-black text-white leading-none">{totalCursos}</p>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300">
                <Users size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-violet-200/60 uppercase tracking-widest mb-0.5">Total Docentes</p>
                <p className="text-2xl font-black text-white leading-none">{totalDocentes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT VIEW LAYOUT */}
      <div className="flex flex-row gap-6 flex-1 min-h-[600px]">
        
        {/* LEFT PANEL - LIST OF GRADOS */}
        <div className="w-[320px] shrink-0 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Estructura Académica</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">Selecciona un grado para ver sus cursos</p>
          </div>
          <div className="p-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {renderLeftSection('Primaria', primaria)}
            {renderLeftSection('Secundaria', secundaria)}
            {renderLeftSection('Extracurriculares', talleres)}
          </div>
        </div>

        {/* RIGHT PANEL - DETAIL VIEW */}
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-w-0">
          {!selectedGrado ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-in">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                 <LayoutGrid size={40} strokeWidth={1.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-2">Ningún nivel seleccionado</h3>
               <p className="text-slate-500 font-medium max-w-sm">
                 Por favor, elige un grado o taller en el menú lateral izquierdo para gestionar sus cursos y docentes.
               </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full animate-fade-in">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 opacity-60"></div>
              
              <div className="px-8 py-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${selectedGrado.id === 'talleres-extracurriculares' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/20' : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20'}`}>
                    {selectedGrado.id === 'talleres-extracurriculares' ? <Rocket size={20} strokeWidth={2.5} /> : <BookOpen size={20} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight flex items-center gap-3">
                      {selectedGrado.nombre}
                      <span className={`px-2.5 py-1 ${selectedGrado.id === 'talleres-extracurriculares' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'} text-[10px] font-black uppercase tracking-widest rounded-lg align-middle`}>
                        {selectedGrado.nivel}
                      </span>
                    </h2>
                    <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest">
                      {selectedGrado.cursos?.length || 0} cursos registrados
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar curso..."
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all w-[220px]"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={openNewCourseModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 hover:-translate-y-0.5 transition-all shadow-md active:scale-95 whitespace-nowrap"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Añadir Curso
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {(selectedGrado.cursos || [])
                    .filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(curso => (
                      <CourseCard
                        key={curso.id}
                        curso={curso}
                        docente={curso.docente}
                        onEdit={(c) => handleEdit(c, selectedGrado.id)}
                        onDelete={handleDelete}
                        onConfigEvals={(c) => {
                          setCursoParaEval(c);
                          setShowEvalModal(true);
                        }}
                      />
                    ))
                  }
                </div>
                  
                {selectedGrado.cursos && selectedGrado.cursos.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                      <BookOpen size={28} strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">Aún no hay cursos</h3>
                    <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm">Añade el primer curso para configurar el plan de estudios de {selectedGrado.nombre}.</p>
                    <button 
                      onClick={openNewCourseModal}
                      className="text-indigo-600 font-black hover:text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-xl transition-colors hover:bg-indigo-100 text-sm"
                    >
                      Añadir curso ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DRAWER PARA NUEVO / EDITAR CURSO --- */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={closeAndResetModal}
          ></div>

          <div className="relative w-full max-w-[400px] bg-white h-full shadow-[calc(-20px)_0_60px_-15px_rgba(0,0,0,0.3)] flex flex-col animate-slide-in-right">
            
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400" 
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
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-black text-sm text-indigo-900 placeholder:text-slate-400 uppercase tracking-wider" 
                      value={nuevoCurso.codigo} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, codigo: e.target.value.toUpperCase() })} 
                      placeholder="ALG-101" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
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
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
                      value={nuevoCurso.grado.id} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, grado: { id: e.target.value } })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="">Selecciona un grado...</option>
                      {grados.filter(g => g.id !== 'talleres-extracurriculares').map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.nivel})</option>)}
                    </select>
                  </div>
                )}
                
                <div className="pt-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Docente Asignado</label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
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
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
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
