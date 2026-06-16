import { useState, useEffect } from 'react';
import { Search, X, BookOpen, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Listen for Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  // Handle escape to close
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', down);
    }
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  // Buscar usuarios y cursos desde el backend
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setCargando(true);
    const timer = setTimeout(() => {
      Promise.all([
        api.get('/usuarios').catch(() => ({ data: [] })),
        api.get('/cursos').catch(() => ({ data: [] }))
      ]).then(([usersRes, cursosRes]) => {
        const q = query.toLowerCase();
        const users = (usersRes.data || []).filter(u =>
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
          u.dni?.includes(q)
        ).map(u => ({
          id: u.id, type: 'user',
          title: `${u.nombre} ${u.apellido}`,
          subtitle: `${u.rol} - DNI: ${u.dni}`,
          icon: User,
          path: '/dashboard/admin/usuarios'
        }));
        const cursos = (cursosRes.data || []).filter(c =>
          c.nombre?.toLowerCase().includes(q) ||
          c.codigo?.toLowerCase().includes(q)
        ).map(c => ({
          id: c.id, type: 'course',
          title: c.nombre,
          subtitle: c.codigo || '',
          icon: BookOpen,
          path: '/dashboard/admin/cursos'
        }));
        setResults([...cursos, ...users].slice(0, 10));
      }).finally(() => setCargando(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    setQuery('');
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden animate-slide-up flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100">
          <Search size={22} className="text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder-slate-400 font-medium"
            placeholder="Buscar estudiantes, cursos, profesores..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-400 bg-slate-100 rounded-md ml-3">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {cargando ? (
            <div className="p-8 text-center text-slate-500 font-medium">
              Buscando...
            </div>
          ) : query.length > 0 && results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">
              No se encontraron resultados para "{query}"
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {query.length === 0 && (
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Escribe para buscar usuarios o cursos
                </div>
              )}
              {results.map((res) => {
                const Icon = res.icon;
                return (
                  <button
                    key={res.id}
                    onClick={() => handleSelect(res.path)}
                    className="flex items-center gap-4 w-full p-3 text-left rounded-xl hover:bg-indigo-50/80 hover:text-indigo-700 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm ${res.type === 'course' ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-800 transition-colors">
                        {res.title}
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        {res.subtitle}
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center font-medium">
          <div>Busca rápidamente por el sistema</div>
          <div className="flex items-center gap-2">
            <span>Navegar con </span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">↓</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
