import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  UserPlus, Search, GraduationCap,
  CheckCircle2, Users, Trash2, IdCard, Loader2, AlertCircle, X, Mail, Phone
} from 'lucide-react';
import api from '../../services/api';

export default function GestionMatriculas({ isEmbedded = false }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [matriculasGlobales, setMatriculasGlobales] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradoId, setSelectedGradoId] = useState(null);

  // Modal de Nueva Matrícula
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Formulario
  const [nuevaMatricula, setNuevaMatricula] = useState({
    estudianteId: '',
    gradoId: '',
    seccion: 'A'
  });

  useEffect(() => {
    fetchDatos();
  }, []);

  async function fetchDatos() {
    try {
      setCargando(true);
      const [estRes, gradosRes, matriculasRes] = await Promise.all([
        api.get('/usuarios/rol/ESTUDIANTE').catch(() => ({ data: [] })),
        api.get('/grados').catch(() => ({ data: [] })),
        api.get('/matriculas').catch(() => ({ data: [] }))
      ]);
      setEstudiantes(estRes.data);
      const gradosFiltrados = gradosRes.data.filter(g => g.id !== 'talleres-extracurriculares');
      setGrados(gradosFiltrados);
      setMatriculasGlobales(matriculasRes.data);
      
      if (gradosFiltrados.length > 0 && !selectedGradoId) {
        setSelectedGradoId(gradosFiltrados[0].id);
      }
    } catch (error) {
      console.error('Error al cargar datos de matrículas', error);
    } finally {
      setCargando(false);
    }
  };

  const openModal = () => {
    setNuevaMatricula({
      estudianteId: '',
      gradoId: selectedGradoId || (grados.length > 0 ? grados[0].id : ''),
      seccion: 'A'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const confirmarMatricula = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        estudiante: { id: nuevaMatricula.estudianteId },
        grado: { id: nuevaMatricula.gradoId },
        seccion: nuevaMatricula.seccion.trim().toUpperCase() || 'A'
      };
      
      const res = await api.post('/matriculas', payload);
      setMatriculasGlobales([...matriculasGlobales, res.data]);
      closeModal();
    } catch (error) {
      console.error("Error al registrar matrícula", error);
      setErrorMsg("Hubo un error al registrar la matrícula. Verifica los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const eliminarMatricula = async (id) => {
    if(!confirm("¿Estás seguro de retirar a este alumno de la matrícula?")) return;
    try {
      await api.delete(`/matriculas/${id}`);
      setMatriculasGlobales(matriculasGlobales.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error al eliminar", error);
      alert("No se pudo eliminar la matrícula.");
    }
  };

  // Filtrado
  const gradoSeleccionado = grados.find(g => g.id === selectedGradoId);
  const matriculasDelGrado = matriculasGlobales.filter(m => m.grado?.id === selectedGradoId);
  
  const matriculasFiltradas = matriculasDelGrado.filter(m => {
    const nombreCompleto = `${m.estudiante?.nombre || ''} ${m.estudiante?.apellido || ''}`.toLowerCase();
    const dni = m.estudiante?.dni || '';
    return nombreCompleto.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm);
  });

  const getMatriculasPorEstudiante = (estudianteId) => {
    return matriculasGlobales.filter(m => m.estudiante?.id === estudianteId);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "w-full animate-fade-in font-sans" : "w-full max-w-[1600px] mx-auto animate-fade-in h-[calc(100vh-80px)] flex flex-col font-sans"}>
      
      {!isEmbedded && (
        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 mb-6 text-white relative overflow-hidden shrink-0 shadow-xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                <IdCard size={14} strokeWidth={2.5} />
                Gestión Estudiantil
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                Control de Matrículas
              </h1>
              <p className="text-slate-300 font-medium text-base md:text-lg max-w-xl">
                Administra la asignación de estudiantes a sus respectivos grados y secciones escolares.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="text-center px-4 border-r border-white/20">
                <p className="text-3xl font-black text-white">{matriculasGlobales.length}</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Total Matriculados</p>
              </div>
              <div className="text-center px-4">
                <p className="text-3xl font-black text-indigo-300">{estudiantes.length - matriculasGlobales.length}</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT VIEW LAYOUT: Flex row forzado SIEMPRE para evitar que colapse */}
      <div className={`flex flex-row gap-4 lg:gap-6 flex-1 items-start ${isEmbedded ? 'pb-12' : ''}`}>
        
        {/* LEFT PANEL - LIST OF GRADOS */}
        <div className="w-[220px] lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-280px)] min-h-[500px]">
          <div className="p-4 lg:p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={16} className="text-indigo-600" /> Niveles
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {grados.map(grado => {
              const count = matriculasGlobales.filter(m => m.grado?.id === grado.id).length;
              const isSelected = selectedGradoId === grado.id;
              
              return (
                <button
                  key={grado.id}
                  onClick={() => setSelectedGradoId(grado.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 group flex items-center justify-between ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <h3 className={`font-bold text-[13px] lg:text-[14px] truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {grado.nombre}
                    </h3>
                    <p className={`text-[10px] lg:text-[11px] font-medium mt-0.5 truncate ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {grado.nivel}
                    </p>
                  </div>
                  <span className={`text-[10px] lg:text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL - MATRICULAS DETAIL */}
        <div className="flex-1 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative min-w-0 md:h-[calc(100vh-280px)] min-h-[400px] md:min-h-[500px]">
          
          {gradoSeleccionado ? (
            <>
              {/* Toolbar Right Panel - UX Mejorado con flex-wrap para evitar que se corte */}
              <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 lg:gap-4 bg-slate-50/30 shrink-0">
                <h2 className="text-[15px] lg:text-lg font-black text-slate-800 flex items-center gap-2 whitespace-nowrap shrink-0">
                  {gradoSeleccionado.nombre}
                </h2>
                
                <div className="flex flex-1 min-w-[200px] items-center justify-end gap-2 lg:gap-3">
                  <div className="relative flex-1 max-w-[240px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-[12px] lg:text-[13px] text-slate-700 shadow-sm"
                    />
                  </div>
                  <button 
                    onClick={openModal}
                    className="flex items-center justify-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl font-bold text-[12px] lg:text-[13px] bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 shrink-0"
                  >
                    <UserPlus size={14} strokeWidth={2.5} />
                    <span>Matricular</span>
                  </button>
                </div>
              </div>

              {/* Lista de Alumnos */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-5 bg-slate-50/30">
                {matriculasFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto p-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                      <Users size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-800 mb-1">Sin alumnos matriculados</h3>
                    <p className="text-[13px] text-slate-500 font-medium">
                      {searchTerm ? 'No hay resultados para la búsqueda.' : `Aún no has matriculado a ningún estudiante en ${gradoSeleccionado.nombre}.`}
                    </p>
                    {!searchTerm && (
                      <button onClick={openModal} className="mt-5 px-5 py-2.5 rounded-xl font-bold text-[13px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        Matricular primer alumno
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
                    {matriculasFiltradas.map(m => (
                      <div key={m.id} className="bg-white border border-slate-200 p-4 rounded-[1.25rem] flex items-center justify-between hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                        
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full -z-10 opacity-50 group-hover:from-indigo-50 transition-colors"></div>

                        <div className="flex items-center gap-3.5 z-10">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-[15px] shrink-0 shadow-sm">
                            {m.estudiante?.nombre?.charAt(0)}{m.estudiante?.apellido?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-[14px] text-slate-800 leading-tight mb-1 group-hover:text-indigo-900 transition-colors">
                              {m.estudiante?.apellido}, {m.estudiante?.nombre}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <IdCard size={10} className="text-slate-400" /> {m.estudiante?.dni}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                SEC {m.seccion || 'A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => eliminarMatricula(m.id)} 
                          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 transition-all opacity-0 group-hover:opacity-100 shrink-0 z-10 shadow-sm"
                          title="Retirar matrícula"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-5 relative">
                <GraduationCap size={32} className="text-indigo-200" />
                <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg border-[3px] border-slate-50">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Selecciona un nivel</h3>
              <p className="text-[13px] text-slate-500 font-medium max-w-xs mx-auto">
                Elige un nivel o grado del panel izquierdo para ver los estudiantes matriculados o registrar nuevos alumnos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- DRAWER PARA NUEVA MATRÍCULA --- */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          ></div>

          <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-1">
                  Nueva Matrícula
                </h3>
                <p className="text-[13px] font-medium text-slate-500">
                  Registra un estudiante en un grado.
                </p>
              </div>
              <button 
                onClick={closeModal} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-7 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {errorMsg && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} strokeWidth={2.5} />
                  {errorMsg}
                </div>
              )}
              
              <form id="matriculaForm" onSubmit={confirmarMatricula} className="space-y-6">
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alumno a Matricular</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-[13px] text-slate-800 appearance-none cursor-pointer" 
                    value={nuevaMatricula.estudianteId} 
                    onChange={e => setNuevaMatricula({ ...nuevaMatricula, estudianteId: e.target.value })}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    <option value="">Selecciona un estudiante...</option>
                    {estudiantes.map(est => {
                      const yaMatriculado = getMatriculasPorEstudiante(est.id).length > 0;
                      return (
                        <option key={est.id} value={est.id} disabled={yaMatriculado}>
                          {est.apellido}, {est.nombre} {yaMatriculado ? '(Ya matriculado)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grado / Nivel</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-bold text-[13px] text-slate-800 appearance-none cursor-pointer" 
                    value={nuevaMatricula.gradoId} 
                    onChange={e => setNuevaMatricula({ ...nuevaMatricula, gradoId: e.target.value })}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    {grados.map(g => (
                      <option key={g.id} value={g.id}>{g.nombre} ({g.nivel})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sección asignada</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none font-black text-sm text-indigo-900 placeholder:text-slate-400 uppercase tracking-wider" 
                    value={nuevaMatricula.seccion} 
                    onChange={e => setNuevaMatricula({ ...nuevaMatricula, seccion: e.target.value.toUpperCase() })} 
                    placeholder="Ej. A, B, C" 
                  />
                </div>
                
              </form>
            </div>

            <div className="px-7 py-5 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
              <button 
                type="button" 
                onClick={closeModal} 
                disabled={isSubmitting}
                className="flex-[0.4] py-3 rounded-xl font-bold text-[13px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="matriculaForm"
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-[13px] text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Guardando...' : (
                  <>
                    <CheckCircle2 size={16} /> Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
