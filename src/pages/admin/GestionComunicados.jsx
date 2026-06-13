import { useState, useEffect, useRef } from 'react';
import { 
  Megaphone, 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  Users, 
  AlertCircle,
  Paperclip,
  Loader2,
  CheckCircle2,
  FileText,
  Download,
  MessageSquare
} from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function GestionComunicados() {
  const { user } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mainTab, setMainTab] = useState('difusion');
  const [toast, setToast] = useState({ show: false, message: '' });

  const [form, setForm] = useState({ titulo: '', contenido: '', audiencia: 'TODOS', prioridad: 'MEDIA' });
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const fileInputRef = useRef(null);

  // Función para mostrar Toast
  const showNotification = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  useEffect(() => {
    fetchComunicados();
    if (user?.id) {
      fetchInbox();
    }
  }, [user]);

  const fetchComunicados = async () => {
    try {
      setCargando(true);
      const res = await api.get('/comunicados');
      setComunicados(res.data);
    } catch (error) {
      console.error("Error al cargar comunicados", error);
    } finally {
      setCargando(false);
    }
  };

  const fetchInbox = async () => {
    try {
      const res = await api.get(`/notificaciones/usuario/${user.id}`);
      setInbox(res.data || []);
    } catch (error) {
      console.error("Error al cargar inbox", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('comunicado', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      if (archivoAdjunto) {
        formData.append('archivo', archivoAdjunto);
      }

      const res = await api.post('/comunicados', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setComunicados([res.data, ...comunicados]);
      setForm({ titulo: '', contenido: '', audiencia: 'TODOS', prioridad: 'MEDIA' });
      setArchivoAdjunto(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      showNotification('Comunicado publicado exitosamente');
    } catch (error) {
      console.error("Error al publicar comunicado", error);
    }
  };

  const deleteComunicado = async (id) => {
    if (window.confirm('¿Eliminar este comunicado?')) {
      try {
        await api.delete(`/comunicados/${id}`);
        setComunicados(comunicados.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error al eliminar comunicado", error);
      }
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

      {/* Pestañas / Tabs Principales */}
      <div className="xl:col-span-3">
        <div className="flex border-b border-slate-200 mb-2">
          <button
            onClick={() => setMainTab('difusion')}
            className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              mainTab === 'difusion'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Megaphone size={16} />
            Difusión de Comunicados
          </button>
          <button
            onClick={() => setMainTab('inbox')}
            className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              mainTab === 'inbox'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MessageSquare size={16} />
            Bandeja de Entrada
          </button>
        </div>
      </div>

      {mainTab === 'difusion' ? (
        <>
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
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={(e) => setArchivoAdjunto(e.target.files[0])}
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 transition-colors relative" title="Adjuntar Archivo o Imagen">
                      <Paperclip size={20} />
                      {archivoAdjunto && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                    {archivoAdjunto && (
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 max-w-[200px] truncate">
                        <FileText size={14} className="text-indigo-500" />
                        {archivoAdjunto.name}
                        <button type="button" onClick={() => { setArchivoAdjunto(null); if(fileInputRef.current) fileInputRef.current.value=''; }} className="ml-1 text-slate-400 hover:text-rose-500">
                          &times;
                        </button>
                      </div>
                    )}
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
                {cargando ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
                  </div>
                ) : comunicados.length === 0 ? (
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
                      
                      {c.archivoUrl && (
                        <div className="mb-3">
                          <a href={`http://localhost:8080/api/comunicados/download/${c.archivoUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                            <FileText size={12} className="text-indigo-500" />
                            {c.archivoNombre}
                            <Download size={12} className="ml-1 opacity-50" />
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">Para: {c.audiencia}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* TAB: BANDEJA DE ENTRADA (Inbox del Administrador) */
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-700">Mensajes Recibidos</h2>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">{inbox.length} mensajes</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
             {cargando ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
                </div>
              ) : inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                   <MessageSquare size={48} className="opacity-50" />
                   <p className="font-medium text-sm">Tu bandeja de entrada está vacía.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inbox.map(msg => (
                    <div key={msg.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-default relative">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                           <Users size={14} />
                           {msg.remitente ? `${msg.remitente.nombre} ${msg.remitente.apellido} (${msg.remitente.rol})` : 'Sistema'}
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                           {new Date(msg.fechaEnvio).toLocaleDateString()} {new Date(msg.fechaEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       </div>
                       <h4 className="font-bold text-slate-800 text-base mb-2">{msg.titulo}</h4>
                       <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">{msg.mensaje}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Toast Notification Flotante */}
      {toast.show && createPortal(
        <div 
          className="fixed top-8 right-8 z-[9999] animate-slide-in-right"
        >
          <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-medium">
            <div className="bg-emerald-500 text-white p-1 rounded-full">
              <CheckCircle2 size={16} strokeWidth={3} />
            </div>
            {toast.message}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
