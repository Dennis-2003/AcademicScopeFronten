import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import api from '../../services/api';

const ICONS = {
  SUCCESS: <CheckCircle2 size={16} className="text-emerald-500" />,
  WARNING: <AlertCircle size={16} className="text-amber-500" />,
  INFO: <Info size={16} className="text-blue-500" />,
  EVENT: <Calendar size={16} className="text-indigo-500" />,
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notis, setNotis] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    api.get('/notificaciones')
      .then(r => setNotis(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sinLeer = notis.filter(n => !n.leida).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
      >
        <Bell size={20} />
        {sinLeer > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Notificaciones</h3>
            {sinLeer > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase">{sinLeer} sin leer</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notis.length === 0 ? (
              <div className="text-center py-8 text-sm font-medium text-slate-400">
                Sin notificaciones
              </div>
            ) : notis.slice(0, 10).map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.leida ? 'bg-indigo-50/40' : ''}`}>
                <div className="mt-0.5">{ICONS[n.tipo] || ICONS.INFO}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.leida ? 'font-bold' : 'font-medium'} text-slate-800 truncate`}>
                    {n.titulo || n.asunto}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.mensaje || n.descripcion}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1">
                    {n.fecha ? new Date(n.fecha).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
