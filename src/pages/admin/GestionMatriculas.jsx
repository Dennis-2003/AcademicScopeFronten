import { useState } from 'react';
import { 
  FileCheck2, UserPlus, Search, GraduationCap,
  User, CheckCircle2, XCircle, ChevronRight, 
  ChevronLeft, Users, AlertCircle, BookOpen, Trash2
} from 'lucide-react';

export default function GestionMatriculas() {
  // Datos mockeados para demostración
  const [estudiantes] = useState([
    { id: 1, nombre: 'Juan', apellido: 'Pérez Gómez', dni: '71234567', estado: 'Sin Matrícula' },
    { id: 2, nombre: 'María', apellido: 'López Ruiz', dni: '72345678', estado: 'Matriculada' },
    { id: 3, nombre: 'Carlos', apellido: 'Sánchez Díaz', dni: '73456789', estado: 'Sin Matrícula' },
  ]);

  const [grados] = useState([
    { id: 1, nombre: '1ro Secundaria', seccion: 'A', cupos: 30, ocupados: 25 },
    { id: 2, nombre: '1ro Secundaria', seccion: 'B', cupos: 30, ocupados: 30 },
    { id: 3, nombre: '2do Secundaria', seccion: 'A', cupos: 30, ocupados: 12 },
  ]);

  const [matriculasGlobales, setMatriculasGlobales] = useState([
    { id: 101, estudiante: 'María López Ruiz', dni: '72345678', grado: '1ro Secundaria', seccion: 'A', fecha: '2026-02-15' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState(null);

  const openWizard = () => {
    setWizardStep(1);
    setSelectedStudent(null);
    setSelectedGrado(null);
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

  const confirmarMatricula = () => {
    const nuevaMatricula = {
      id: Date.now(),
      estudiante: `${selectedStudent.nombre} ${selectedStudent.apellido}`,
      dni: selectedStudent.dni,
      grado: selectedGrado.nombre,
      seccion: selectedGrado.seccion,
      fecha: new Date().toISOString().split('T')[0]
    };
    
    setMatriculasGlobales([nuevaMatricula, ...matriculasGlobales]);
    closeWizard();
    // Simulate updating student status
    selectedStudent.estado = 'Matriculada';
  };

  const filteredMatriculas = matriculasGlobales.filter(m => 
    m.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) || m.dni.includes(searchTerm)
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans relative">
      
      <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold uppercase tracking-wider mb-3">
            <FileCheck2 size={14} strokeWidth={2.5} />
            Secretaría Académica
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Gestión de Matrículas
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Panel unificado para inscribir alumnos a un grado completo.
          </p>
        </div>

        <button 
          onClick={openWizard}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-1"
        >
          <UserPlus size={22} strokeWidth={2.5} />
          NUEVA MATRÍCULA
        </button>
      </header>

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
            Alumnos Matriculados en el Año Actual
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatriculas.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800 text-[15px]">{m.estudiante}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{m.dni}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        <GraduationCap size={14} />
                        {m.grado} "{m.seccion}"
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{m.fecha}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Eliminar Matrícula">
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[650px] animate-fade-in-up">
            
            {/* Wizard Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <UserPlus className="text-indigo-600" /> Asistente de Matrícula
                </h3>
                <button onClick={closeWizard} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${wizardStep >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${wizardStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${wizardStep >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
              </div>
            </div>

            {/* Wizard Content */}
            <div className="flex-1 overflow-y-auto p-8 relative">
              
              {/* STEP 1: Seleccionar Estudiante */}
              {wizardStep === 1 && (
                <div className="animate-fade-in">
                  <h4 className="text-xl font-bold text-slate-800 mb-6">1. Selecciona al Estudiante</h4>
                  <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar por DNI o Apellidos..." className="w-full pl-11 pr-4 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-indigo-500 outline-none font-medium" />
                  </div>
                  <div className="space-y-3">
                    {estudiantes.map(est => (
                      <div 
                        key={est.id} 
                        onClick={() => setSelectedStudent(est)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedStudent?.id === est.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-300'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedStudent?.id === est.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-[15px]">{est.apellido}, {est.nombre}</p>
                            <p className="text-xs font-medium text-slate-500">DNI: {est.dni}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {est.estado === 'Matriculada' && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Ya Matriculado</span>}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedStudent?.id === est.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                            {selectedStudent?.id === est.id && <CheckCircle2 size={16} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Seleccionar Grado */}
              {wizardStep === 2 && (
                <div className="animate-fade-in">
                  <h4 className="text-xl font-bold text-slate-800 mb-2">2. Asignar Grado y Sección</h4>
                  <p className="text-sm font-medium text-slate-500 mb-6">El estudiante será inscrito automáticamente en todos los cursos del grado elegido.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {grados.map(g => {
                      const isFull = g.ocupados >= g.cupos;
                      const isSelected = selectedGrado?.id === g.id;
                      return (
                        <div 
                          key={g.id}
                          onClick={() => !isFull && setSelectedGrado(g)}
                          className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : isFull ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-slate-100 hover:border-indigo-300 cursor-pointer'}`}
                        >
                          {isFull && <div className="absolute top-3 right-3 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase">Lleno</div>}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                              <BookOpen size={20} />
                            </div>
                            <h5 className="font-bold text-slate-800">{g.nombre}</h5>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Sección</p>
                              <p className="text-2xl font-black text-slate-800">"{g.seccion}"</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Cupos</p>
                              <p className={`text-lg font-black ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>{g.cupos - g.ocupados}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Confirmación */}
              {wizardStep === 3 && (
                <div className="animate-fade-in flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 mb-2">¡Todo listo para matricular!</h4>
                  <p className="text-slate-500 font-medium text-center mb-8 max-w-sm">Revisa los datos antes de confirmar la inscripción en el sistema.</p>
                  
                  <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-sm font-bold text-slate-400 uppercase">Alumno</span>
                      <span className="text-sm font-bold text-slate-800">{selectedStudent?.nombre} {selectedStudent?.apellido}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-sm font-bold text-slate-400 uppercase">DNI</span>
                      <span className="text-sm font-bold text-slate-800">{selectedStudent?.dni}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-400 uppercase">Asignación</span>
                      <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded">{selectedGrado?.nombre} "{selectedGrado?.seccion}"</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Wizard Footer / Navigation */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button onClick={handlePrev} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  <ChevronLeft size={18} /> Atrás
                </button>
              ) : <div></div>}

              {wizardStep < 3 ? (
                <button 
                  onClick={handleNext} 
                  disabled={(wizardStep === 1 && !selectedStudent) || (wizardStep === 2 && !selectedGrado)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={confirmarMatricula} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 animate-pulse">
                  <CheckCircle2 size={18} /> CONFIRMAR MATRÍCULA
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
