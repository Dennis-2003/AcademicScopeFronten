import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Rocket, 
  Plus, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  BookMarked,
  Search,
  Filter,
  ArrowLeft,
  Users,
  User,
  GraduationCap
} from 'lucide-react';

function GradoCard({ id, nombre, subtitle, courseCount, isTaller, onClick }) {
  const Icon = isTaller ? Rocket : BookMarked;
  const colorClass = isTaller ? 'text-amber-500' : 'text-indigo-500';
  const bgClass = isTaller ? 'bg-amber-50' : 'bg-indigo-50';
  const borderHover = isTaller ? 'hover:border-amber-300' : 'hover:border-indigo-300';
  
  const safeNombre = nombre || '';
  const gradeNumber = safeNombre.match(/^\d+/)?.[0] || (isTaller ? 'TE' : 'G');

  return (
    <button 
      onClick={() => onClick()}
      className={`w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left group ${borderHover}`}
    >
      <div className="flex items-start justify-between w-full mb-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner transition-transform group-hover:scale-105 ${bgClass} ${colorClass}`}>
          {gradeNumber}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:${bgClass} group-hover:${colorClass} transition-colors`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="mt-auto">
        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-indigo-900 transition-colors">
          {nombre}
        </h3>
        {subtitle && (
          <p className="text-sm font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{subtitle}</p>
        )}
      </div>
      
      <div className="w-full flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500">{courseCount} {courseCount === 1 ? 'Curso' : 'Cursos'}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} className="text-indigo-500 rotate-180" />
        </div>
      </div>
    </button>
  );
}

function CourseCard({ curso, docente, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-100">
        <button onClick={() => onEdit(curso)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar Curso">
          <Edit2 size={16} strokeWidth={2.5} />
        </button>
        <button onClick={() => onDelete(curso.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar Curso">
          <Trash2 size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${curso.tipo === 'TALLER' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
          {curso.tipo === 'TALLER' ? <Rocket size={24} strokeWidth={2.5} /> : <BookOpen size={24} strokeWidth={2.5} />}
        </div>
        <div>
          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black tracking-widest uppercase rounded-md mb-2">
            {curso.codigo}
          </span>
          <h4 className="text-[17px] font-black text-slate-800 leading-tight mb-2 pr-12">
            {curso.nombre}
          </h4>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <User size={14} className="text-slate-400" />
            {docente ? `${docente.nombre} ${docente.apellido}` : 'Sin docente asignado'}
          </div>
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
  
  // Estado para el modal del slider
  const [showModal, setShowModal] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState(null);
  
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: '', codigo: '', tipo: 'REGULAR', docenteId: '', grado: { id: '' }
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  // CARGAR DATOS
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [resGrados, resDocentes, resCursos] = await Promise.all([
          api.get('/grados'),
          api.get('/usuarios/rol/DOCENTE'),
          api.get('/cursos')
        ]);
        
        const cursos = resCursos.data || [];
        const gradosConCursos = (resGrados.data || []).map(g => ({
          ...g,
          cursos: cursos.filter(c => c.grado?.id === g.id)
        }));
        
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

  // FILTRADO (Para la vista maestra y el modal, asumiendo búsqueda por nombre)
  const filteredGrados = (grados || []).filter(g => {
    const nombreStr = g.nombre || '';
    const nivelStr = g.nivel || '';
    const searchStr = searchTerm || '';
    return nombreStr.toLowerCase().includes(searchStr.toLowerCase()) || 
           nivelStr.toLowerCase().includes(searchStr.toLowerCase());
  });

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
      
      // Actualizar el estado local
      const nuevosGrados = grados.map(g => ({
        ...g,
        cursos: g.cursos.filter(c => c.id !== id)
      }));
      setGrados(nuevosGrados);
      
      if (selectedGrado) {
        setSelectedGrado({
          ...selectedGrado,
          cursos: selectedGrado.cursos.filter(c => c.id !== id)
        });
      }
    } catch (err) {
      alert("Error al eliminar. Verifique que no haya evaluaciones asociadas.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...nuevoCurso,
        docente: nuevoCurso.docenteId ? { id: nuevoCurso.docenteId } : null,
        // Si es TALLER, en este sistema simplificado podríamos o no asociarlo a un grado. 
        // Si el backend exige grado, usamos el que se eligió o uno por defecto.
      };

      if (cursoAEditar) {
        // Actualizar
        const res = await api.put(`/cursos/${cursoAEditar.id}`, payload);
        const cursoActualizado = res.data;
        
        // Actualizar UI
        const nuevosGrados = grados.map(g => {
          if (g.id === payload.grado.id) {
            return {
              ...g,
              cursos: g.cursos.map(c => c.id === cursoAEditar.id ? cursoActualizado : c)
            };
          }
          return g;
        });
        setGrados(nuevosGrados);
        
        if (selectedGrado && selectedGrado.id === payload.grado.id) {
          setSelectedGrado({
            ...selectedGrado,
            cursos: selectedGrado.cursos.map(c => c.id === cursoAEditar.id ? cursoActualizado : c)
          });
        }
      } else {
        // Crear
        const res = await api.post('/cursos', payload);
        const cursoCreado = res.data;
        
        // Actualizar UI
        const nuevosGrados = grados.map(g => {
          if (g.id === payload.grado.id) {
            return {
              ...g,
              cursos: [...(g.cursos || []), cursoCreado]
            };
          }
          return g;
        });
        setGrados(nuevosGrados);
        
        if (selectedGrado && selectedGrado.id === payload.grado.id) {
          setSelectedGrado({
            ...selectedGrado,
            cursos: [...(selectedGrado.cursos || []), cursoCreado]
          });
        }
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
      tipo: 'REGULAR', 
      docenteId: '', 
      grado: { id: selectedGrado ? selectedGrado.id : '' } 
    });
    setShowModal(true);
  };

  // ESTADÍSTICAS GLOBALES
  const totalCursos = (grados || []).reduce((acc, g) => acc + (g?.cursos?.length || 0), 0);
  const totalDocentes = (docentes || []).length;

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* GLOBAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión Académica</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Configura grados, talleres y asigna docentes a los cursos.</p>
        </div>

        {!selectedGrado && (
          <div className="flex gap-4">
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <BookMarked size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Cursos</p>
                <p className="text-xl font-black text-slate-800 leading-none">{totalCursos}</p>
              </div>
            </div>
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Users size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Docentes</p>
                <p className="text-xl font-black text-slate-800 leading-none">{totalDocentes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        
        {/* TRANSITION CONTAINER */}
        <div className="transition-all duration-300">
          
          {/* MASTER VIEW: GRID OF GRADOS */}
          {!selectedGrado && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredGrados.map(grado => (
                <GradoCard
                  key={grado.id}
                  id={grado.id}
                  nombre={grado.nombre}
                  subtitle={grado.nivel}
                  courseCount={grado.cursos?.length || 0}
                  isTaller={grado.nivel === 'TALLERES EXTRACURRICULARES'}
                  onClick={() => setSelectedGrado(grado)}
                />
              ))}
            </div>
          )}

          {/* DETAIL VIEW: CURSOS OF SELECTED GRADO */}
          {selectedGrado && (
            <div className="animate-slide-up bg-slate-50 rounded-3xl p-8 border border-slate-200">
              
              {/* Detail Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => { setSelectedGrado(null); setSearchTerm(''); }}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                  >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                  </button>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight flex items-center gap-3">
                      {selectedGrado.nombre}
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-lg align-middle">
                        {selectedGrado.nivel}
                      </span>
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Administra los cursos asignados a esta sección.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar curso..."
                      className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all w-[250px]"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={openNewCourseModal}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Añadir Curso
                  </button>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {(selectedGrado.cursos || [])
                  .filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(curso => (
                    <CourseCard
                      key={curso.id}
                      curso={curso}
                      docente={curso.docente}
                      onEdit={(c) => handleEdit(c, selectedGrado.id)}
                      onDelete={handleDelete}
                    />
                  ))
                }
                
                {(!selectedGrado.cursos || selectedGrado.cursos.length === 0) && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                      <BookOpen size={32} strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Sin Cursos</h3>
                    <p className="text-slate-500 font-medium">No hay cursos asignados a este grado todavía.</p>
                    <button 
                      onClick={openNewCourseModal}
                      className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
                    >
                      Añadir el primer curso
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* --- DRAWER PARA NUEVO / EDITAR CURSO --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={closeAndResetModal}
          ></div>

          <div className="relative w-full max-w-[450px] bg-white h-full shadow-[calc(-20px)_0_60px_-15px_rgba(0,0,0,0.3)] flex flex-col animate-slide-in-right border-l border-slate-200">
            
            <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {cursoAEditar ? 'Editar Curso' : 'Nuevo Curso'}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {cursoAEditar ? 'Modifica los detalles del curso.' : 'Registra un nuevo curso o taller.'}
                </p>
              </div>
              <button 
                onClick={closeAndResetModal} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {errorMsg && (
                <div className="mb-8 px-5 py-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={20} strokeWidth={2.5} />
                  {errorMsg}
                </div>
              )}
              
              <form id="cursoForm" onSubmit={handleSave} className="space-y-7">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Nombre del Curso</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-[15px] text-slate-800 placeholder:text-slate-400 placeholder:font-medium" 
                    value={nuevoCurso.nombre} 
                    onChange={e => setNuevoCurso({ ...nuevoCurso, nombre: e.target.value })} 
                    placeholder="Ej. Álgebra Avanzada" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Código</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-black text-[15px] text-indigo-900 placeholder:text-slate-400 placeholder:font-medium uppercase tracking-wider" 
                      value={nuevoCurso.codigo} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, codigo: e.target.value.toUpperCase() })} 
                      placeholder="ALG-101" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Tipo</label>
                    <select 
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-[15px] text-slate-800 appearance-none" 
                      value={nuevoCurso.tipo} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, tipo: e.target.value })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                    >
                      <option value="REGULAR">Regular</option>
                      <option value="TALLER">Taller</option>
                    </select>
                  </div>
                </div>
                
                {nuevoCurso.tipo === 'REGULAR' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Grado Asociado</label>
                    <select 
                      required 
                      className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-[15px] text-slate-800 appearance-none" 
                      value={nuevoCurso.grado.id} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, grado: { id: e.target.value } })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                    >
                      <option value="">Selecciona un grado...</option>
                      {grados.map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.nivel})</option>)}
                    </select>
                  </div>
                )}
                
                <div className="pt-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">Docente Asignado</label>
                  <select 
                    required
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-[15px] text-slate-800 appearance-none" 
                    value={nuevoCurso.docenteId} 
                    onChange={e => setNuevoCurso({ ...nuevoCurso, docenteId: e.target.value })}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2em' }}
                  >
                    <option value="">Sin asignar...</option>
                    {(docentes || []).map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
                  </select>
                </div>
              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-white shrink-0 flex gap-4">
              <button 
                type="button" 
                onClick={closeAndResetModal} 
                disabled={isSubmitting}
                className="flex-[0.4] py-4 rounded-xl font-bold text-[15px] text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="cursoForm"
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-xl font-bold text-[15px] text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : (cursoAEditar ? 'Guardar Cambios' : 'Registrar Curso')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
