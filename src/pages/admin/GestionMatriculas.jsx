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
      
      await api.post('/matriculas', payload);
      await fetchDatos();
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
        <Loader2 className="animate-spin w-8 h-8 text-slate-900" />
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

      {/* ENTERPRISE TABLE VIEW */}
      <div className={`flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[500px] w-full ${isEmbedded ? 'mb-12' : 'mb-8'}`}>
        
        {/* TABS HEADER / FILTERS */}
        <div className="p-6 bg-slate-50/50 flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0 border-b border-slate-100">
          
          {/* PILLS DE NIVELES */}
          <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar w-full xl:w-auto">
            {grados.map(grado => {
              const count = matriculasGlobales.filter(m => m.grado?.id === grado.id).length;
              const isSelected = selectedGradoId === grado.id;
              return (
                <button
                  key={grado.id}
                  onClick={() => setSelectedGradoId(grado.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${isSelected ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                >
                  <GraduationCap size={16} strokeWidth={2.5} />
                  {grado.nombre}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] ${isSelected ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH & ADD */}
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar alumno..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 active:scale-95 whitespace-nowrap"
            >
              <UserPlus size={18} strokeWidth={2.5} />
              Matricular
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {gradoSeleccionado ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Estudiante</th>
                  <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">DNI</th>
                  <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Sección</th>
                  <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {matriculasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                       <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
                         <Users className="text-slate-300" size={28} />
                       </div>
                       <h3 className="text-lg font-black text-slate-800 mb-1">Sin alumnos matriculados</h3>
                       <p className="text-sm text-slate-500 font-medium">{searchTerm ? 'No hay resultados para la búsqueda.' : 'Aún no has matriculado a ningún estudiante en este grado.'}</p>
                       {!searchTerm && (
                         <button onClick={openModal} className="mt-4 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                           Matricular Primer Alumno
                         </button>
                       )}
                    </td>
                  </tr>
                ) : (
                  matriculasFiltradas.map(m => (
                    <tr key={m.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm shadow-inner border border-slate-200 uppercase flex-shrink-0">
                            {m.estudiante?.nombre?.charAt(0)}{m.estudiante?.apellido?.charAt(0)}
                          </div>
                          <span className="font-bold text-[15px] text-slate-800 group-hover:text-amber-600 transition-colors">
                            {m.estudiante?.apellido}, {m.estudiante?.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-8">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <IdCard size={14} className="text-slate-400" />
                          {m.estudiante?.dni}
                        </span>
                      </td>
                      <td className="py-4 px-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                          SEC {m.seccion || 'A'}
                        </span>
                      </td>
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => eliminarMatricula(m.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" 
                            title="Retirar matrícula"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-5">
                <GraduationCap size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Selecciona un nivel</h3>
              <p className="text-sm text-slate-500 font-medium">
                Elige un grado en la barra superior para ver los estudiantes matriculados.
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

          <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right shrink-0">
            
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
                className="flex-1 py-3 rounded-xl font-bold text-[13px] text-white bg-amber-400 hover:bg-amber-300 text-slate-900 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
