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

  const fetchDatos = async () => {
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
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Wallet size={14} strokeWidth={2.5} />
            Tesorería
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Gestión de {tipoInstitucion === 'PUBLICO' ? 'Cuotas y Aportes' : 'Pensiones'}
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            {tipoInstitucion === 'PUBLICO' 
              ? 'Registra el pago de cuotas extracurriculares (APAFA, actividades).'
              : 'Control de pagos de matrículas y mensualidades del alumnado.'}
          </p>
        </div>
        
        {tipoInstitucion === 'PUBLICO' && (
          <button 
            onClick={() => setShowModalConcepto(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
          >
            <Plus size={20} strokeWidth={2.5} />
            CREAR CONCEPTO
          </button>
        )}
      </header>

      {/* Alerta de Configuración */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} />
          El sistema está operando en modo <strong className="uppercase bg-blue-200 px-2 py-0.5 rounded text-blue-800 ml-1">{tipoInstitucion}</strong>. 
          Puedes cambiar esto en Configuración.
        </div>
      </div>

      <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-sm mb-6">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar estudiante por DNI o nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-indigo-500 outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-bold text-slate-700">Registro de Pagos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estudiante</th>
                {tipoInstitucion === 'PUBLICO' ? (
                  conceptos.map(c => (
                    <th key={c.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">
                      <div className="flex flex-col items-center">
                        <span>{c.nombre}</span>
                        <span className="text-[10px] text-slate-400">S/ {c.monto.toFixed(2)}</span>
                      </div>
                    </th>
                  ))
                ) : (
                  <>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Matrícula</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Marzo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Abril</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Mayo</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEstudiantes.map(est => (
                <tr key={est.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{est.apellido}, {est.nombre}</p>
                    <p className="text-xs font-medium text-slate-500">DNI: {est.dni}</p>
                  </td>
                  
                  {tipoInstitucion === 'PUBLICO' ? (
                    conceptos.map(c => (
                      <td key={c.id} className="px-6 py-4 text-center">
                        <button 
                          onClick={() => togglePagoPublico(est.id, c.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isPagadoPublico(est.id, c.id) 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isPagadoPublico(est.id, c.id) ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {isPagadoPublico(est.id, c.id) ? 'PAGADO' : 'DEUDA'}
                        </button>
                      </td>
                    ))
                  ) : (
                    ['matricula', 'marzo', 'abril', 'mayo'].map(mes => (
                      <td key={mes} className="px-6 py-4 text-center">
                        <button 
                          onClick={() => togglePagoPrivado(est.id, mes)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-slate-500 border-slate-200 hover:bg-slate-50`}
                        >
                          <XCircle size={14} /> MOROSO
                        </button>
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Concepto */}
      {showModalConcepto && createPortal(
        <div 
          className="fixed inset-0 z-[9999]" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl"
            style={{ width: '400px', maxWidth: '90vw', display: 'flex', flexDirection: 'column' }}
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Nuevo Aporte/Cuota</h3>
              <button onClick={() => setShowModalConcepto(false)} className="text-slate-400 hover:text-slate-800 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCrearConcepto} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre del Concepto</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm text-slate-800" value={nuevoConcepto.nombre} onChange={e => setNuevoConcepto({...nuevoConcepto, nombre: e.target.value})} placeholder="Ej. Cuota APAFA" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Monto (S/)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                  <input required type="number" step="0.10" min="0" className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-bold text-sm text-slate-800" value={nuevoConcepto.monto} onChange={e => setNuevoConcepto({...nuevoConcepto, monto: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModalConcepto(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Crear Cuota
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
