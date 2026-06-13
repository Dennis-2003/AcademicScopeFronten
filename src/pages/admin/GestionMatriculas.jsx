import { useState, useEffect } from 'react';
import { 
  UserPlus, Search, GraduationCap,
  User, CheckCircle2, XCircle, Users, Trash2, IdCard, Loader2
} from 'lucide-react';
import api from '../../services/api';

export default function GestionMatriculas({ isEmbedded = false }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [matriculasGlobales, setMatriculasGlobales] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [seccionIngresada, setSeccionIngresada] = useState('');

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      setCargando(true);
      const [estRes, gradosRes, matriculasRes] = await Promise.all([
        api.get('/usuarios/rol/ESTUDIANTE'),
        api.get('/grados'),
        api.get('/matriculas')
      ]);
      setEstudiantes(estRes.data);
      setGrados(gradosRes.data);
      setMatriculasGlobales(matriculasRes.data);
    } catch (error) {
      console.error('Error al cargar datos de matrículas', error);
    } finally {
      setCargando(false);
    }
  };

  const openWizard = () => {
    setWizardStep(1);
    setSelectedStudent(null);
    setSelectedGrado(null);
    setSeccionIngresada('');
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
  };

  const handleNext = () => {
    if (wizardStep === 1 && !selectedStudent) return;
    if (wizardStep === 2 && !selectedGrado) return;
    setWizardStep(wizardStep + 1);
  };

  const handlePrev = () => {
    setWizardStep(wizardStep - 1);
  };

  const confirmarMatricula = async () => {
    try {
      const payload = {
        estudiante: { id: selectedStudent.id },
        grado: { id: selectedGrado.id },
        seccion: seccionIngresada || 'A' // Default a A si está vacío
      };
      
      const res = await api.post('/matriculas', payload);
      setMatriculasGlobales([res.data, ...matriculasGlobales]);
      closeWizard();
    } catch (error) {
      console.error("Error al registrar matrícula", error);
      alert("Hubo un error al registrar la matrícula.");
    }
  };

  const eliminarMatricula = async (id) => {
    if(!confirm("¿Estás seguro de eliminar esta matrícula?")) return;
    try {
      await api.delete(`/matriculas/${id}`);
      setMatriculasGlobales(matriculasGlobales.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  // Filtrado
  const filteredMatriculas = matriculasGlobales.filter(m => {
    const nombreCompleto = `${m.estudiante?.nombre || ''} ${m.estudiante?.apellido || ''}`.toLowerCase();
    const dni = m.estudiante?.dni || '';
    return nombreCompleto.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm);
  });

  const getMatriculasPorEstudiante = (estudianteId) => {
    return matriculasGlobales.filter(m => m.estudiante?.id === estudianteId);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-600">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "w-full animate-fade-in pb-12 font-sans" : "w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans"}>
      
      {!isEmbedded && (
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              <IdCard size={14} strokeWidth={2.5} />
              Gestión Estudiantil
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Control de Matrículas
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Asigna a los estudiantes a sus respectivos grados y secciones.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={openWizard}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus size={20} strokeWidth={2.5} />
              NUEVA MATRÍCULA
            </button>
          </div>
        </header>
      )}

      {/* DASHBOARD PRINCIPAL */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por DNI o nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-slate-700 flex items-center gap-2">
            <Users size={18} className="text-indigo-600"/>
            Alumnos Matriculados
          </h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
            {matriculasGlobales.length} Registros
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {filteredMatriculas.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No se encontraron matrículas.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estudiante</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Documento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Grado y Sección</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatriculas.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800 text-[15px]">{m.estudiante?.nombre} {m.estudiante?.apellido}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{m.estudiante?.dni}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        <GraduationCap size={14} />
                        {m.grado?.nombre} "{m.seccion}"
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{m.estado}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => eliminarMatricula(m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Eliminar Matrícula">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeWizard}></div>
          <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[85vh] relative z-10 animate-fade-in-up border border-slate-200/60 overflow-hidden">
            
            {/* Cabecera */}
            <div className="px-8 py-6 flex items-center justify-between shrink-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Nueva Matrícula</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Paso {wizardStep} de 3</p>
              </div>
              <button onClick={closeWizard} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full h-1 bg-slate-100 flex">
              <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${(wizardStep / 3) * 100}%` }}></div>
            </div>

            {/* Contenedor de Pasos */}
            <div className="flex-1 overflow-y-auto px-8 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              {/* PASO 1 */}
              {wizardStep === 1 && (
                <div className="animate-fade-in space-y-6">
                  <div>
                    <h4 className="text-[17px] font-bold text-slate-800">Selecciona al Estudiante</h4>
                    <p className="text-sm text-slate-500">Busca el alumno que deseas matricular para este periodo.</p>
                  </div>
                  
                  <div className="space-y-3 pb-4">
                    {estudiantes.map(est => {
                      const isSelected = selectedStudent?.id === est.id;
                      const matrAsociadas = getMatriculasPorEstudiante(est.id);
                      const isMatriculado = matrAsociadas.length > 0;
                      return (
                        <div 
                          key={est.id} 
                          onClick={() => setSelectedStudent(est)}
                          className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' 
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                              <User size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                              <p className={`font-bold text-[15px] leading-tight mb-0.5 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                {est.apellido}, {est.nombre}
                              </p>
                              <p className="text-[13px] font-medium text-slate-500">DNI: {est.dni}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isMatriculado && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                                MATRICULADO
                              </span>
                            )}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {wizardStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <div>
                    <h4 className="text-[17px] font-bold text-slate-800">Elige el Grado y Sección</h4>
                    <p className="text-sm text-slate-500">Asigna el nivel educativo al estudiante {selectedStudent?.nombre}.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    {grados.map(g => {
                      const isSelected = selectedGrado?.id === g.id;
                      return (
                        <div 
                          key={g.id}
                          onClick={() => setSelectedGrado(g)}
                          className={`p-5 rounded-xl border transition-all duration-200 relative group flex flex-col justify-between h-[100px] ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' 
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 cursor-pointer'
                          }`}
                        >
                          <div>
                            <h5 className={`font-bold text-[15px] ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{g.nombre}</h5>
                            <p className="text-[13px] font-medium text-slate-500 mt-0.5">Nivel: {g.nivel}</p>
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 hidden group-hover:flex group-hover:border-indigo-300'}`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {selectedGrado && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Sección a asignar:</label>
                      <input 
                        type="text" 
                        value={seccionIngresada}
                        onChange={(e) => setSeccionIngresada(e.target.value.toUpperCase())}
                        placeholder="Ej: A, B, C..."
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                        maxLength={10}
                      />
                    </div>
                  )}

                </div>
              )}

              {/* PASO 3 */}
              {wizardStep === 3 && (
                <div className="animate-fade-in flex flex-col items-center justify-center py-6 h-full space-y-6">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100">
                    <CheckCircle2 size={40} strokeWidth={2} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">Casi listo</h4>
                    <p className="text-slate-500 font-medium text-sm mt-2">Verifica los datos de la matrícula</p>
                  </div>
                  
                  <div className="w-full max-w-[400px] bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-slate-500">Estudiante</span>
                      <span className="text-[14px] font-bold text-slate-800">{selectedStudent?.nombre} {selectedStudent?.apellido}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-slate-500">DNI</span>
                      <span className="text-[14px] font-bold text-slate-800">{selectedStudent?.dni}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                      <span className="text-[13px] font-semibold text-slate-500">Grado Asignado</span>
                      <span className="text-[14px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        {selectedGrado?.nombre} "{seccionIngresada || 'A'}"
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
              {wizardStep > 1 ? (
                <button onClick={handlePrev} className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                  Volver atrás
                </button>
              ) : <div></div>}

              {wizardStep < 3 ? (
                <button 
                  onClick={handleNext} 
                  disabled={(wizardStep === 1 && !selectedStudent) || (wizardStep === 2 && (!selectedGrado || seccionIngresada.trim() === ''))}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  Continuar
                </button>
              ) : (
                <button onClick={confirmarMatricula} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-black transition-colors shadow-sm shadow-slate-900/20">
                  Confirmar Matrícula
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
