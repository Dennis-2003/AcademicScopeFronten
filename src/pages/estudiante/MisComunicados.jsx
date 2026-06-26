import { useState, useEffect } from 'react';
import { MessageSquare, Bell } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MisComunicados() {
  const { user } = useAuth();
  const [mensajesRecibidos, setMensajesRecibidos] = useState([]);
  const [comunicadosAdmin, setComunicadosAdmin] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.get(`/notificaciones/usuario/${user.id}`).then(r => setMensajesRecibidos(r.data || [])).catch(() => {});
      api.get('/comunicados').then(r => setComunicadosAdmin(r.data || [])).catch(() => {});
    }
  }, [user]);

  const comunicadosVisibles = comunicadosAdmin.filter(c => c.audiencia === 'TODOS' || c.audiencia === 'ESTUDIANTES');

  const comunicadosMapeados = comunicadosVisibles.map(c => ({
    id: `com-${c.id}`,
    titulo: c.titulo,
    mensaje: c.contenido,
    fechaEnvio: c.fecha,
    remitente: { nombre: 'Dirección', apellido: '(Comunicado Oficial)' },
    esComunicado: true
  }));
  
  const bandeja = [...mensajesRecibidos, ...comunicadosMapeados].sort((a, b) => new Date(b.fechaEnvio || b.fecha) - new Date(a.fechaEnvio || a.fecha));

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fade-in pb-12 font-sans">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
          <Bell size={14} strokeWidth={2.5} />
          Estudiante / Comunicados
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
          Mis Comunicados
        </h1>
        <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
          Revisa las notificaciones de tus docentes y los anuncios oficiales del colegio.
        </p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
          <MessageSquare size={18} className="text-indigo-600" />
          Bandeja de Entrada
        </h2>
        
        <div className="space-y-4">
          {bandeja.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Bell size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">No tienes comunicados ni notificaciones por ahora.</p>
            </div>
          ) : bandeja.map(msg => (
            <div key={msg.id} className={`p-5 rounded-2xl border ${msg.esComunicado ? 'border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/60' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'} transition-all cursor-default flex flex-col md:flex-row gap-4 md:items-start`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.esComunicado ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                {msg.esComunicado ? <Bell size={18} /> : <MessageSquare size={18} />}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{msg.titulo || msg.asunto}</h4>
                    <div className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${msg.esComunicado ? 'text-indigo-600' : 'text-slate-500'}`}>
                      De: {msg.remitente ? `${msg.remitente.nombre} ${msg.remitente.apellido}` : 'Sistema'}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm shrink-0 w-max">
                    {new Date(msg.fechaEnvio || msg.fecha || new Date()).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-3 rounded-xl border border-slate-100/50 mt-3">{msg.mensaje || msg.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
