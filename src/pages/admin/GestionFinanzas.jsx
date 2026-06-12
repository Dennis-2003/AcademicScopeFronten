import { useState, useEffect } from 'react';
import { 
  Wallet,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Receipt,
  Download
} from 'lucide-react';

export default function GestionFinanzas() {
  const [tipoInstitucion, setTipoInstitucion] = useState('PUBLICO');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalConcepto, setShowModalConcepto] = useState(false);
  
  // Para colegio Público (Cuotas)
  const [conceptos, setConceptos] = useState([
    { id: 1, nombre: 'Aporte APAFA 2026', monto: 50 },
    { id: 2, nombre: 'Pro-Fondos Aniversario', monto: 20 }
  ]);
  const [nuevoConcepto, setNuevoConcepto] = useState({ nombre: '', monto: '' });

  // Estudiantes mockeados con estado de pago
  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: 'Juan Pérez', dni: '71234567', grado: '3ro Sec', 
      pagosPublico: { 1: true, 2: false }, 
      pagosPrivado: { matricula: true, marzo: true, abril: false } 
    },
    { id: 2, nombre: 'Sofía Castro', dni: '72345678', grado: '5to Sec', 
      pagosPublico: { 1: false, 2: false }, 
      pagosPrivado: { matricula: true, marzo: false, abril: false } 
    }
  ]);

  useEffect(() => {
    const config = localStorage.getItem('academicScope_config');
    if (config) {
      setTipoInstitucion(JSON.parse(config).tipoInstitucion);
    }
  }, []);

  const handleCrearConcepto = (e) => {
    e.preventDefault();
    setConceptos([...conceptos, { id: Date.now(), nombre: nuevoConcepto.nombre, monto: parseFloat(nuevoConcepto.monto) }]);
    setNuevoConcepto({ nombre: '', monto: '' });
    setShowModalConcepto(false);
  };

  const togglePagoPublico = (estudianteId, conceptoId) => {
    setEstudiantes(estudiantes.map(est => {
      if (est.id === estudianteId) {
        return {
          ...est,
          pagosPublico: { ...est.pagosPublico, [conceptoId]: !est.pagosPublico[conceptoId] }
        };
      }
      return est;
    }));
  };

  const togglePagoPrivado = (estudianteId, mes) => {
    setEstudiantes(estudiantes.map(est => {
      if (est.id === estudianteId) {
        return {
          ...est,
          pagosPrivado: { ...est.pagosPrivado, [mes]: !est.pagosPrivado[mes] }
        };
      }
      return est;
    }));
  };

  const filteredEstudiantes = estudiantes.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || e.dni.includes(searchTerm)
  );

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
                    <p className="font-bold text-slate-800 text-sm">{est.nombre}</p>
                    <p className="text-xs font-medium text-slate-500">{est.grado} - DNI: {est.dni}</p>
                  </td>
                  
                  {tipoInstitucion === 'PUBLICO' ? (
                    conceptos.map(c => (
                      <td key={c.id} className="px-6 py-4 text-center">
                        <button 
                          onClick={() => togglePagoPublico(est.id, c.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            est.pagosPublico[c.id] 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {est.pagosPublico[c.id] ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {est.pagosPublico[c.id] ? 'PAGADO' : 'DEUDA'}
                        </button>
                      </td>
                    ))
                  ) : (
                    ['matricula', 'marzo', 'abril', 'mayo'].map(mes => (
                      <td key={mes} className="px-6 py-4 text-center">
                        <button 
                          onClick={() => togglePagoPrivado(est.id, mes)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            est.pagosPrivado[mes] 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {est.pagosPrivado[mes] ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {est.pagosPrivado[mes] ? 'PAGADO' : 'MOROSO'}
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
      {showModalConcepto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Nuevo Aporte/Cuota</h3>
            </div>
            <form onSubmit={handleCrearConcepto} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre del Concepto</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm" value={nuevoConcepto.nombre} onChange={e => setNuevoConcepto({...nuevoConcepto, nombre: e.target.value})} placeholder="Ej. Cuota APAFA" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Monto (S/)</label>
                  <input required type="number" step="0.10" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm" value={nuevoConcepto.monto} onChange={e => setNuevoConcepto({...nuevoConcepto, monto: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModalConcepto(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
