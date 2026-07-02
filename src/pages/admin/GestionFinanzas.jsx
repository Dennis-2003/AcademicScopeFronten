import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wallet,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Receipt,
  Download,
  Loader2
} from 'lucide-react';
import api from '../../services/api';

export default function GestionFinanzas() {
  const [tipoInstitucion, setTipoInstitucion] = useState('PUBLICO');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalConcepto, setShowModalConcepto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [conceptos, setConceptos] = useState([]);
  const [nuevoConcepto, setNuevoConcepto] = useState({ nombre: '', monto: '' });
  const [estudiantes, setEstudiantes] = useState([]);
  const [pagos, setPagos] = useState([]); // List of PagoEstudiante

  useEffect(() => {
    const config = localStorage.getItem('academicScope_config');
    if (config) {
      setTipoInstitucion(JSON.parse(config).tipoInstitucion);
    }
    fetchDatos();
  }, []);

  async function fetchDatos() {
    try {
      setCargando(true);
      const [conceptosRes, estudiantesRes, pagosRes] = await Promise.all([
        api.get('/finanzas/conceptos').catch(() => ({ data: [] })),
        api.get('/usuarios/rol/ESTUDIANTE').catch(() => ({ data: [] })),
        api.get('/finanzas/pagos').catch(() => ({ data: [] }))
      ]);
      setConceptos(conceptosRes.data);
      setEstudiantes(estudiantesRes.data);
      setPagos(pagosRes.data);
    } catch (error) {
      console.error("Error al cargar datos financieros", error);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearConcepto = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/finanzas/conceptos', { 
        nombre: nuevoConcepto.nombre, 
        monto: parseFloat(nuevoConcepto.monto) 
      });
      setConceptos([...conceptos, res.data]);
      setNuevoConcepto({ nombre: '', monto: '' });
      setShowModalConcepto(false);
    } catch (error) {
      console.error("Error al crear concepto", error);
    }
  };

  const togglePagoPublico = async (estudianteId, conceptoId) => {
    try {
      // Optmistic UI update can be complex here, so we update after success or refetch
      const res = await api.post(`/finanzas/pagos/toggle/${estudianteId}/${conceptoId}`);
      const pagoActualizado = res.data;
      
      // Update local state
      setPagos(prevPagos => {
        const existe = prevPagos.find(p => p.id === pagoActualizado.id);
        if (existe) {
          return prevPagos.map(p => p.id === pagoActualizado.id ? pagoActualizado : p);
        } else {
          return [...prevPagos, pagoActualizado];
        }
      });
    } catch (error) {
      console.error("Error al registrar pago", error);
    }
  };

  const togglePagoPrivado = (estudianteId, mes) => {
    alert("La gestión de pensiones privadas aún no está conectada a la base de datos.");
  };

  // Helper para saber si pagó
  const isPagadoPublico = (estudianteId, conceptoId) => {
    const pago = pagos.find(p => p.estudiante?.id === estudianteId && p.concepto?.id === conceptoId);
    return pago ? pago.pagado : false;
  };

  const filteredEstudiantes = estudiantes.filter(e => 
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) || (e.dni && e.dni.includes(searchTerm))
  );

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col pb-8 font-sans">
      
      {/* GLOBAL HERO HEADER - COMPACTO */}
      <div className="relative mb-6 bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-800 shrink-0 w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[50px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700/60 shadow-inner">
                <Wallet size={24} strokeWidth={2.5} />
              </div>
              <div>
                Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{tipoInstitucion === 'PUBLICO' ? 'Cuotas y Aportes' : 'Pensiones'}</span>
              </div>
            </h1>
            <p className="text-slate-400 font-medium mt-2 text-sm ml-16">
              {tipoInstitucion === 'PUBLICO' 
                ? 'Registra el pago de cuotas extracurriculares (APAFA, actividades).'
                : 'Control de pagos de matrículas y mensualidades del alumnado.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {tipoInstitucion === 'PUBLICO' && (
              <button 
                onClick={() => setShowModalConcepto(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-slate-800/50 hover:bg-slate-800 text-amber-400 border border-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900/20 active:translate-y-0"
              >
                <Plus size={20} strokeWidth={2.5} />
                CREAR CONCEPTO
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Configuración */}
      <div className="mb-6 px-5 py-4 rounded-[1.25rem] bg-amber-50/50 border border-amber-200/50 text-slate-700 text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <AlertCircle size={18} className="text-amber-500" strokeWidth={2.5} />
          <span>El sistema está operando en modo <strong className="uppercase bg-amber-100/80 px-2 py-0.5 rounded-md text-amber-700 ml-1 tracking-widest text-[11px]">{tipoInstitucion}</strong>. Puedes cambiar esto en Configuración.</span>
        </div>
      </div>

      {/* ENTERPRISE TABLE VIEW */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-0 w-full mb-8">
        
        {/* TOOLBAR & FILTERS */}
        <div className="p-6 bg-slate-50/50 flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Receipt size={16} className="text-slate-400" /> Registro de Pagos
            </h2>
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar estudiante por DNI o nombre..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Estudiante</th>
                {tipoInstitucion === 'PUBLICO' ? (
                  conceptos.map(c => (
                    <th key={c.id} className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                      <div className="flex flex-col items-center">
                        <span>{c.nombre}</span>
                        <span className="text-[10px] text-slate-400/80">S/ {c.monto.toFixed(2)}</span>
                      </div>
                    </th>
                  ))
                ) : (
                  <>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Matrícula</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Marzo</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Abril</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Mayo</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredEstudiantes.length === 0 ? (
                <tr>
                  <td colSpan={tipoInstitucion === 'PUBLICO' ? conceptos.length + 1 : 5} className="py-16 text-center">
                     <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
                       <Receipt className="text-slate-300" size={28} />
                     </div>
                     <h3 className="text-lg font-black text-slate-800 mb-1">Sin estudiantes</h3>
                     <p className="text-sm text-slate-500 font-medium">{searchTerm ? 'No hay resultados para la búsqueda.' : 'No hay estudiantes registrados.'}</p>
                  </td>
                </tr>
              ) : (
                filteredEstudiantes.map(est => (
                  <tr key={est.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm shadow-inner border border-slate-200 uppercase flex-shrink-0">
                          {est.nombre?.charAt(0)}{est.apellido?.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-[15px] text-slate-800 group-hover:text-amber-600 transition-colors block leading-tight">
                            {est.apellido}, {est.nombre}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 mt-1 block">DNI: {est.dni}</span>
                        </div>
                      </div>
                    </td>
                    
                    {tipoInstitucion === 'PUBLICO' ? (
                      conceptos.map(c => (
                        <td key={c.id} className="py-4 px-8 text-center">
                          <button 
                            onClick={() => togglePagoPublico(est.id, c.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border ${
                              isPagadoPublico(est.id, c.id) 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                          >
                            {isPagadoPublico(est.id, c.id) ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                            {isPagadoPublico(est.id, c.id) ? 'PAGADO' : 'DEUDA'}
                          </button>
                        </td>
                      ))
                    ) : (
                      ['matricula', 'marzo', 'abril', 'mayo'].map(mes => (
                        <td key={mes} className="py-4 px-8 text-center">
                          <button 
                            onClick={() => togglePagoPrivado(est.id, mes)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all border bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600`}
                          >
                            <XCircle size={12} strokeWidth={3} /> MOROSO
                          </button>
                        </td>
                      ))
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER NUEVO CONCEPTO */}
      {showModalConcepto && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModalConcepto(false)}
          ></div>

          <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right shrink-0">
            
            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                  Nuevo Aporte
                </h3>
                <p className="text-[12px] font-medium text-slate-500">
                  Crea una nueva cuota para los estudiantes.
                </p>
              </div>
              <button 
                onClick={() => setShowModalConcepto(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <XCircle size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <form id="conceptoForm" onSubmit={handleCrearConcepto} className="p-7 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Concepto</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400" 
                  value={nuevoConcepto.nombre} 
                  onChange={e => setNuevoConcepto({...nuevoConcepto, nombre: e.target.value})} 
                  placeholder="Ej. Cuota APAFA" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monto (S/)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                  <input 
                    required 
                    type="number" 
                    step="0.10" 
                    min="0" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-black text-sm text-slate-900 placeholder:text-slate-400" 
                    value={nuevoConcepto.monto} 
                    onChange={e => setNuevoConcepto({...nuevoConcepto, monto: e.target.value})} 
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </form>

            <div className="px-7 py-6 border-t border-slate-100 bg-white shrink-0 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowModalConcepto(false)} 
                className="flex-[0.4] py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="conceptoForm"
                type="submit" 
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} strokeWidth={3} /> Crear Cuota
              </button>
            </div>
          </div>
        </div>,
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
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
