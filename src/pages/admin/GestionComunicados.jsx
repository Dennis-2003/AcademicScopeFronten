import { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  Users, 
  AlertCircle,
  Paperclip
} from 'lucide-react';

export default function GestionComunicados() {
  const [comunicados, setComunicados] = useState([
    { id: 1, titulo: 'Suspensión de clases por feriado', fecha: '2026-06-05', audiencia: 'TODOS', prioridad: 'ALTA' },
    { id: 2, titulo: 'Reunión de Apoderados', fecha: '2026-06-01', audiencia: 'APODERADOS', prioridad: 'MEDIA' },
  ]);

  const [form, setForm] = useState({ titulo: '', contenido: '', audiencia: 'TODOS', prioridad: 'MEDIA' });

  const handleSend = (e) => {
    e.preventDefault();
    setComunicados([{ ...form, id: Date.now(), fecha: new Date().toISOString().split('T')[0] }, ...comunicados]);
    setForm({ titulo: '', contenido: '', audiencia: 'TODOS', prioridad: 'MEDIA' });
    alert('Comunicado enviado exitosamente');
  };

  const deleteComunicado = (id) => {
    if (window.confirm('¿Eliminar este comunicado?')) {
      setComunicados(comunicados.filter(c => c.id !== id));
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      <div className="xl:col-span-3">
        <header className="mb-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              <Megaphone size={14} strokeWidth={2.5} />
              Difusión
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Comunicados Oficiales
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Envía anuncios institucionales a estudiantes, apoderados o docentes de forma rápida.
            </p>
          </div>
        </header>
      </div>

      {/* Formulario de Envío */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[15px] font-bold text-slate-700">Redactar Nuevo Comunicado</h2>
          </div>
          
          <form onSubmit={handleSend} className="p-6">
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Título del Anuncio</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 font-medium text-sm text-slate-800 transition-colors" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ej. Suspensión de clases presenciales" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Audiencia (Destinatarios)</label>
                  <div className="relative">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 font-medium text-sm text-slate-800 transition-colors appearance-none" value={form.audiencia} onChange={e => setForm({...form, audiencia: e.target.value})}>
                      <option value="TODOS">Toda la Institución</option>
                      <option value="ESTUDIANTES">Solo Estudiantes</option>
                      <option value="DOCENTES">Solo Docentes</option>
                      <option value="APODERADOS">Solo Apoderados</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nivel de Prioridad</label>
                  <div className="relative">
                    <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 font-medium text-sm text-slate-800 transition-colors appearance-none" value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}>
                      <option value="BAJA">Baja (Informativo)</option>
                      <option value="MEDIA">Media (Importante)</option>
                      <option value="ALTA">Alta (Urgente)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Mensaje / Contenido</label>
                <textarea required rows="6" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 font-medium text-sm text-slate-800 transition-colors resize-none" value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} placeholder="Escribe el cuerpo del mensaje aquí..."></textarea>
              </div>

            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button type="button" className="p-3 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 transition-colors" title="Adjuntar Archivo">
                  <Paperclip size={20} />
                </button>
                <button type="button" className="p-3 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 transition-colors" title="Adjuntar Imagen">
                  <ImageIcon size={20} />
                </button>
              </div>
              <button type="submit" className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 active:translate-y-0">
                <Send size={18} strokeWidth={2.5} />
                PUBLICAR COMUNICADO
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Historial de Envíos */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-700">Enviados Recientemente</h2>
            <span className="text-xs font-bold px-2 py-1 bg-slate-200/50 rounded-md text-slate-600">{comunicados.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comunicados.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm font-medium">No hay comunicados enviados.</div>
            ) : (
              comunicados.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative group">
                  <button onClick={() => deleteComunicado(c.id)} className="absolute top-3 right-3 p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    {c.prioridad === 'ALTA' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                    {c.prioridad === 'MEDIA' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                    {c.prioridad === 'BAJA' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{c.fecha}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2 pr-8 leading-tight">{c.titulo}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">Para: {c.audiencia}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
