import { useState } from 'react';
import { 
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function GestionEvaluaciones() {
  const [evaluaciones, setEvaluaciones] = useState([
    { id: 1, nombre: 'Primer Bimestre', fechaInicio: '2026-03-01', fechaFin: '2026-05-15', estado: 'CERRADO' },
    { id: 2, nombre: 'Segundo Bimestre', fechaInicio: '2026-05-16', fechaFin: '2026-07-31', estado: 'ACTIVO' },
    { id: 3, nombre: 'Tercer Bimestre', fechaInicio: '2026-08-01', fechaFin: '2026-10-15', estado: 'PROGRAMADO' },
    { id: 4, nombre: 'Cuarto Bimestre', fechaInicio: '2026-10-16', fechaFin: '2026-12-20', estado: 'PROGRAMADO' }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [evaluacionAEditar, setEvaluacionAEditar] = useState(null);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'PROGRAMADO' });
  const [searchTerm, setSearchTerm] = useState('');

  const openNewModal = () => {
    setEvaluacionAEditar(null);
    setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: 'PROGRAMADO' });
    setShowModal(true);
  };

  const openEditModal = (evaluacion) => {
    setEvaluacionAEditar(evaluacion);
    setForm({ ...evaluacion });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (evaluacionAEditar) {
      setEvaluaciones(evaluaciones.map(ev => ev.id === evaluacionAEditar.id ? { ...form, id: ev.id } : ev));
    } else {
      setEvaluaciones([...evaluaciones, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const toggleEstado = (id) => {
    setEvaluaciones(evaluaciones.map(ev => {
      if (ev.id === id) {
        const nextState = ev.estado === 'ACTIVO' ? 'CERRADO' : (ev.estado === 'CERRADO' ? 'PROGRAMADO' : 'ACTIVO');
        return { ...ev, estado: nextState };
      }
      return ev;
    }));
  };

  const deleteEvaluacion = (id) => {
    if (window.confirm('¿Eliminar este periodo de evaluación?')) {
      setEvaluaciones(evaluaciones.filter(ev => ev.id !== id));
    }
  };

  const filteredEvaluaciones = evaluaciones.filter(ev => 
    ev.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'ACTIVO': return <span className="bg-emerald-100 text-emerald-700 border-emerald-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Activo</span>;
      case 'PROGRAMADO': return <span className="bg-blue-100 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Clock size={10} /> Programado</span>;
      case 'CERRADO': return <span className="bg-slate-100 text-slate-600 border-slate-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><AlertCircle size={10} /> Cerrado</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar size={14} strokeWidth={2.5} />
            Académico
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Periodos de Evaluación
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
            Configura los bimestres o trimestres. Los periodos "Activos" permiten a los docentes ingresar notas.
          </p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0"
        >
          <Plus size={20} strokeWidth={2.5} />
          NUEVO PERIODO
        </button>
      </header>

      <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-sm mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar periodo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-indigo-500 outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[15px] font-bold text-slate-700">Cronograma de Evaluaciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Periodo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha Inicio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha Fin</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluaciones.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800 text-[15px]">{ev.nombre}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{ev.fechaInicio}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{ev.fechaFin}</td>
                  <td className="px-6 py-4">{getStatusBadge(ev.estado)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleEstado(ev.id)}
                        className={`p-2 rounded-lg transition-colors ${ev.estado === 'ACTIVO' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        title="Cambiar Estado"
                      >
                        {ev.estado === 'ACTIVO' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => openEditModal(ev)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteEvaluacion(ev.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {evaluacionAEditar ? 'Editar Periodo' : 'Nuevo Periodo'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre del Periodo</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Primer Trimestre" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Fecha Inicio</label>
                    <input required type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm text-slate-600" value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Fecha Fin</label>
                    <input required type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm text-slate-600" value={form.fechaFin} onChange={e => setForm({...form, fechaFin: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Estado Inicial</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium text-sm" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option value="PROGRAMADO">Programado (A futuro)</option>
                    <option value="ACTIVO">Activo (Abierto para notas)</option>
                    <option value="CERRADO">Cerrado (Finalizado)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
