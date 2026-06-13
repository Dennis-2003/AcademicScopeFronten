import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';

export default function Comunicados() {
  const { user } = useAuth();
  const [mensajesEnviados, setMensajesEnviados] = useState([]);
  const [mensajesRecibidos, setMensajesRecibidos] = useState([]);
  const [comunicadosAdmin, setComunicadosAdmin] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [form, setForm] = useState({ destinatario: '', asunto: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [tab, setTab] = useState('recibidos');

  useEffect(() => {
    if (user?.id) {
      obtenerCursosPorDocente(user.id).then(data => setCursos(data || [])).catch(() => {});
      api.get(`/notificaciones/enviadas/remitente/${user.id}`).then(r => setMensajesEnviados(r.data || [])).catch(() => {});
      api.get(`/notificaciones/usuario/${user.id}`).then(r => setMensajesRecibidos(r.data || [])).catch(() => {});
      api.get('/comunicados').then(r => setComunicadosAdmin(r.data || [])).catch(() => {});
      api.get('/usuarios/rol/ADMIN').then(r => setAdministradores(r.data || [])).catch(() => {});
    }
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.asunto || !form.mensaje || !form.destinatario) {
       alert("Por favor completa todos los campos, incluyendo el destinatario.");
       return;
    }
    setEnviando(true);
    try {
      let destId = user.id; // fallback simulado
      if (form.destinatario.startsWith('admin-')) {
         destId = parseInt(form.destinatario.split('-')[1]);
      } else if (form.destinatario.startsWith('alumnos-') || form.destinatario.startsWith('tutores-')) {
         // NOTA: Para alumnos y tutores de un curso, se requeriría un envío masivo.
         // Por ahora, usamos el fallback.
         destId = user.id; 
      }

      const res = await api.post('/notificaciones', {
         titulo: form.asunto,
         mensaje: form.mensaje,
         remitente: { id: user.id },
         usuario: { id: destId }
      });
      setMensajesEnviados(prev => [res.data, ...prev]);
      setForm({ destinatario: '', asunto: '', mensaje: '' });
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch {
      alert('Error al enviar el mensaje. Verifica la conexión.');
    } finally {
      setEnviando(false);
    }
  };

  const comunicadosVisibles = comunicadosAdmin.filter(c => c.audiencia === 'TODOS' || c.audiencia === 'DOCENTES');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Comunicados</h1>
          <p className="text-slate-500 text-sm mt-1">Envía y recibe mensajes importantes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <form onSubmit={handleSend} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Send size={18} className="text-indigo-600" />
              Redactar Nuevo Mensaje
            </h2>
            {exito && (
              <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-700">
                Mensaje enviado correctamente
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Destinatario (Curso o Grupo)</label>
                <select
                  value={form.destinatario}
                  onChange={e => setForm(f => ({ ...f, destinatario: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="">Selecciona un destinatario...</option>
                  {administradores.length > 0 && (
                    <option value={`admin-${administradores[0].id}`}>Dirección / Administración</option>
                  )}
                  <optgroup label="Cursos / Grupos">
                    {cursos.map(c => (
                      <React.Fragment key={c.id}>
                        <option value={`alumnos-${c.id}`}>Alumnos - {c.nombre}</option>
                        <option value={`tutores-${c.id}`}>Tutores - {c.nombre}</option>
                      </React.Fragment>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Asunto</label>
                <input
                  type="text"
                  value={form.asunto}
                  onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                  placeholder="Ej: Material para laboratorio"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Mensaje</label>
                <textarea
                  value={form.mensaje}
                  onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                  rows="4"
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-bold text-sm shadow-sm shadow-indigo-200"
                >
                  <Send size={16} />
                  {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </div>
          </form>

          {/* COMUNICADOS GLOBALES DEL ADMIN */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3"></div>
             <h2 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
               <MessageSquare size={20} />
               Avisos de la Dirección
             </h2>
             <div className="space-y-3 relative z-10">
               {comunicadosVisibles.length === 0 ? (
                 <div className="text-white/70 text-sm font-medium">No hay comunicados administrativos por ahora.</div>
               ) : comunicadosVisibles.map(c => (
                 <div key={c.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{c.titulo}</h4>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-md font-medium">{c.fecha}</span>
                    </div>
                    <p className="text-sm text-indigo-100">{c.contenido}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setTab('recibidos')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'recibidos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Bandeja de Entrada
              </button>
              <button 
                onClick={() => setTab('enviados')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'enviados' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Enviados
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {tab === 'enviados' && (
                mensajesEnviados.length === 0 ? (
                  <div className="text-center py-6 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No has enviado mensajes
                  </div>
                ) : mensajesEnviados.map(msg => (
                  <div key={msg.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-default">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
                      <Users size={12} />
                      Enviado por ti
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{msg.titulo || msg.asunto}</h4>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{msg.mensaje}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(msg.fechaEnvio).toLocaleDateString()}</p>
                  </div>
                ))
              )}

              {tab === 'recibidos' && (
                (() => {
                  const comunicadosMapeados = comunicadosVisibles.map(c => ({
                    id: `com-${c.id}`,
                    titulo: c.titulo,
                    mensaje: c.contenido,
                    fechaEnvio: c.fecha,
                    remitente: { nombre: 'Dirección', apellido: '(Comunicado)' },
                    esComunicado: true
                  }));
                  
                  const bandeja = [...mensajesRecibidos, ...comunicadosMapeados].sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
                  
                  if (bandeja.length === 0) {
                    return (
                      <div className="text-center py-6 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Tu bandeja está vacía
                      </div>
                    );
                  }

                  return bandeja.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-xl border ${msg.esComunicado ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50'} hover:bg-slate-50 transition-colors cursor-default`}>
                      <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${msg.esComunicado ? 'text-purple-600' : 'text-indigo-600'}`}>
                        <MessageSquare size={12} />
                        {msg.remitente ? `${msg.remitente.nombre} ${msg.remitente.apellido}` : 'Sistema'}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{msg.titulo}</h4>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{msg.mensaje}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(msg.fechaEnvio).toLocaleDateString()}</p>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
