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
  
  const gradeNumber = nombre.match(/^\d+/)?.[0] || (isTaller ? 'TE' : 'G');

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
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight mb-1">{nombre}</h3>
        <p className="text-sm font-medium text-slate-500 mb-4">{subtitle}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
            {courseCount} {courseCount === 1 ? (isTaller ? 'taller' : 'curso') : (isTaller ? 'talleres' : 'cursos')}
          </span>
          <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalles &rarr;
          </span>
        </div>
      </div>
    </button>
  );
}

function CourseCardRich({ curso, onDelete, onEdit }) {
  const isTaller = curso.tipo === 'TALLER';
  const docente = curso.docente || null; 
  const estudiantesCount = curso.matriculados || 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:border-slate-300 group relative">
      
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="pr-16">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-lg font-bold text-slate-800 leading-tight">{curso.nombre || 'Sin Nombre'}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${isTaller ? 'bg-amber-50 text-amber-600 border border-amber-200/50' : 'bg-indigo-50 text-indigo-600 border border-indigo-200/50'}`}>
              {isTaller ? 'Taller' : 'Regular'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">
            {curso.codigo || 'S/N'}
          </p>
        </div>
        
        {/* ACTIONS */}
        <div className="absolute top-4 right-4 flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-xl shadow-sm border border-slate-100 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(curso); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
            title="Editar Curso"
          >
            <Edit2 size={16} strokeWidth={2} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(curso.id); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 text-slate-400 hover:text-red-500"
            title="Eliminar Curso"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* TEACHER INFO */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center gap-3 border border-slate-100/80">
        {docente ? (
          <>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {docente.nombre?.charAt(0)}{docente.apellido?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Docente Asignado</p>
              <p className="text-sm font-bold text-slate-800 truncate">{docente.nombre} {docente.apellido}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-dashed border-slate-300 text-slate-400 flex items-center justify-center flex-shrink-0">
              <User size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Docente Asignado</p>
              <p className="text-sm font-medium text-slate-400 italic">Sin asignar</p>
            </div>
          </>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users size={14} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[15px] font-bold">{estudiantesCount}</span>
            <span className="text-xs font-medium text-slate-500 ml-1">estudiantes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-3xl h-56 border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between">
             <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
             <div className="w-10 h-10 bg-slate-100 rounded-full" />
          </div>
          <div>
             <div className="h-5 w-3/4 bg-slate-100 rounded-md mb-2" />
             <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GestionCursos() {
  const [cursos, setCursos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGrado, setSelectedGrado] = useState(null); 
  
  const [showModal, setShowModal] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: '', codigo: '', tipo: 'REGULAR', grado: { id: '' }, docenteId: ''
  });

  const cargarDatos = () => {
    setLoading(true);
    Promise.all([
      api.get('/cursos').catch(() => ({ data: [] })),
      api.get('/grados').catch(() => ({ data: [] })),
      api.get('/usuarios/rol/DOCENTE').catch(() => ({ data: [] }))
    ]).then(([resCursos, resGrados, resDocentes]) => {
      setCursos(resCursos.data || []);
      setGrados(resGrados.data || []);
      setDocentes(resDocentes.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { cargarDatos(); }, []);

  const openNewModal = () => {
    setCursoAEditar(null);
    setNuevoCurso({ nombre: '', codigo: '', tipo: 'REGULAR', grado: { id: '' }, docenteId: '' });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (curso) => {
    if (!curso) return;
    setCursoAEditar(curso);
    setNuevoCurso({
      nombre: curso.nombre || '',
      codigo: curso.codigo || '',
      tipo: curso.tipo || 'REGULAR',
      grado: (curso.grado && curso.grado.id) ? { id: curso.grado.id } : { id: '' },
      docenteId: (curso.docente && curso.docente.id) ? curso.docente.id : ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const closeAndResetModal = () => {
    setShowModal(false);
    setCursoAEditar(null);
    setNuevoCurso({ nombre: '', codigo: '', tipo: 'REGULAR', grado: { id: '' }, docenteId: '' });
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        nombre: nuevoCurso.nombre,
        codigo: nuevoCurso.codigo,
        tipo: nuevoCurso.tipo,
        grado: (nuevoCurso.tipo === 'REGULAR' && nuevoCurso.grado.id) ? { id: nuevoCurso.grado.id } : null,
        docente: nuevoCurso.docenteId ? { id: nuevoCurso.docenteId } : null
      };

      if (cursoAEditar && cursoAEditar.id) {
        await api.put(`/cursos/${cursoAEditar.id}`, payload);
      } else {
        await api.post('/cursos', payload);
      }
      
      closeAndResetModal();
      cargarDatos();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Error al guardar el curso. Revisa los datos.');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este curso?')) return;
    try {
      await api.delete(`/cursos/${id}`);
      cargarDatos();
    } catch { alert('No se pudo eliminar el curso.'); }
  };

  const talleres = cursos.filter(c => !c.grado || c.tipo === 'TALLER');
  
  const filteredCursos = cursos.filter(c => 
    (c.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.codigo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCursosForSelectedGrado = () => {
    if (!selectedGrado) return [];
    if (selectedGrado.isTaller) {
      return filteredCursos.filter(c => !c.grado || c.tipo === 'TALLER');
    }
    return filteredCursos.filter(c => c.grado && c.grado.id === selectedGrado.id);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans relative">
      
      {/* --- HEADER --- */}
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen size={14} strokeWidth={2.5} />
            Academia / Gestión
          </div>
          
          {selectedGrado ? (
            <div className="flex items-center gap-4 animate-fade-in">
              <button 
                onClick={() => { setSelectedGrado(null); setSearchTerm(''); }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                  Cursos: {selectedGrado.nombre}
                </h1>
                <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">
                  {selectedGrado.subtitle}
                </p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                Gestión de Cursos
              </h1>
              <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
                Administra los grados, cursos regulares y talleres curriculares.
              </p>
            </>
          )}
        </div>

        <button 
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
        >
          <Plus size={20} strokeWidth={2.5} />
          NUEVO CURSO
        </button>
      </header>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* MASTER VIEW: GRID OF GRADOS */}
          {!selectedGrado && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {grados.map(grado => (
                <GradoCard 
                  key={grado.id}
                  id={grado.id}
                  nombre={grado.nombre}
                  subtitle={`Nivel ${grado.nivel}`}
                  courseCount={cursos.filter(c => c.grado && c.grado.id === grado.id).length}
                  isTaller={false}
                  onClick={() => setSelectedGrado({ id: grado.id, nombre: grado.nombre, subtitle: `Nivel ${grado.nivel}`, isTaller: false })}
                />
              ))}
              
              {talleres.length > 0 && (
                <GradoCard 
                  id="talleres"
                  nombre="Talleres Libres"
                  subtitle="Extracurriculares"
                  courseCount={talleres.length}
                  isTaller={true}
                  onClick={() => setSelectedGrado({ id: 'talleres', nombre: 'Talleres Extracurriculares', subtitle: 'Sin grado específico', isTaller: true })}
                />
              )}
            </div>
          )}

          {/* DETAIL VIEW: GRID OF COURSES */}
          {selectedGrado && (
            <div className="animate-slide-up">
              {/* Toolbar in detail view */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-2 rounded-2xl border border-slate-200/70 shadow-sm">
                <div className="relative w-full sm:w-96">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar curso por nombre o código..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-700 placeholder-slate-400 outline-none"
                  />
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Filter size={16} />
                  Filtros
                </button>
              </div>

              {getCursosForSelectedGrado().length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                  <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No hay cursos</h3>
                  <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                    {searchTerm 
                      ? "Ningún curso coincide con tu búsqueda." 
                      : `Aún no se han registrado cursos para ${selectedGrado.nombre}. Utiliza el botón "Nuevo Curso" para empezar.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCursosForSelectedGrado().map(curso => (
                    <CourseCardRich key={curso.id} curso={curso} onDelete={handleDelete} onEdit={openEditModal} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- MODAL NUEVO / EDITAR CURSO --- */}
      {showModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={closeAndResetModal}
        >
          <div 
            style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600 flex-shrink-0">
                <BookOpen size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {cursoAEditar ? 'Editar Curso' : 'Nuevo Curso'}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {cursoAEditar ? 'Modifica los datos y asignaciones.' : 'Completa los datos para registrar un curso o taller.'}
                </p>
              </div>
            </div>
            
            <div className="p-6">
              {errorMsg && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={18} flex-shrink-0 />
                  {errorMsg}
                </div>
              )}
              
              <form onSubmit={handleSave}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Nombre del Curso</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[14px] text-slate-800 font-medium outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400" 
                      value={nuevoCurso.nombre} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, nombre: e.target.value })} 
                      placeholder="Ej. Álgebra Avanzada" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Código</label>
                      <input 
                        required 
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[14px] text-slate-800 font-medium outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 uppercase" 
                        value={nuevoCurso.codigo} 
                        onChange={e => setNuevoCurso({ ...nuevoCurso, codigo: e.target.value.toUpperCase() })} 
                        placeholder="ALG-101" 
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Tipo</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[14px] text-slate-800 font-medium outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none" 
                        value={nuevoCurso.tipo} 
                        onChange={e => setNuevoCurso({ ...nuevoCurso, tipo: e.target.value })}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                      >
                        <option value="REGULAR">Regular</option>
                        <option value="TALLER">Taller</option>
                      </select>
                    </div>
                  </div>
                  
                  {nuevoCurso.tipo === 'REGULAR' && (
                    <div className="animate-fade-in">
                      <label className="block text-[13px] font-bold text-slate-700 mb-2">Grado Asociado</label>
                      <select 
                        required 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[14px] text-slate-800 font-medium outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none" 
                        value={nuevoCurso.grado.id} 
                        onChange={e => setNuevoCurso({ ...nuevoCurso, grado: { id: e.target.value } })}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                      >
                        <option value="">Selecciona un grado</option>
                        {grados.map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.nivel})</option>)}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Docente Asignado</label>
                    <select 
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[14px] text-slate-800 font-medium outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none" 
                      value={nuevoCurso.docenteId} 
                      onChange={e => setNuevoCurso({ ...nuevoCurso, docenteId: e.target.value })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      <option value="">Sin asignar</option>
                      {docentes.map(d => <option key={d.id} value={d.id}>{d.apellido}, {d.nombre}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={closeAndResetModal} 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 text-[14px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white text-[14px] font-bold transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : (cursoAEditar ? 'Guardar Cambios' : 'Guardar Curso')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
