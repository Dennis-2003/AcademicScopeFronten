import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';

export default function Comunicados() {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [form, setForm] = useState({ destinatario: '', asunto: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (user?.id) {
      obtenerCursosPorDocente(user.id).then(data => setCursos(data || [])).catch(() => {});
    }
    api.get('/notificaciones/enviadas').then(r => setMensajes(r.data || [])).catch(() => {});
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.asunto || !form.mensaje) return;
    setEnviando(true);
    try {
      const res = await api.post('/notificaciones', form);
      setMensajes(prev => [res.data, ...prev]);
      setForm({ destinatario: '', asunto: '', mensaje: '' });
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch {
      alert('Error al enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Comunicados</h1>
          <p className="text-slate-500 text-sm mt-1">Envía mensajes a tus estudiantes y sus tutores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
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
                  {cursos.map(c => (
                    <React.Fragment key={c.id}>
                      <option value={`alumnos-${c.id}`}>Alumnos - {c.nombre}</option>
                      <option value={`tutores-${c.id}`}>Tutores - {c.nombre}</option>
                    </React.Fragment>
                  ))}
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
                  rows="5"
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
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-slate-400" />
              Enviados Recientemente
            </h2>
            <div className="space-y-4">
              {mensajes.length === 0 ? (
                <div className="text-center py-6 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No hay mensajes enviados
                </div>
              ) : mensajes.map(msg => (
                <div key={msg.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
                    <Users size={12} />
                    {msg.destinatario || msg.curso?.nombre || 'General'}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{msg.asunto}</h4>
                  <p className="text-xs text-slate-400">{msg.fecha || msg.createdAt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
