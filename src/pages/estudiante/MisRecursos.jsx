import React, { useState, useEffect } from 'react';
import { FolderOpen, FileText, Video, Link as LinkIcon, Download, Search, BookOpen } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MisRecursos() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.id) {
      api.get(`/matriculas/estudiante/${user.id}`)
        .then(async res => {
          const matriculasValidas = res.data.filter(m => m.estado !== 'RETIRADA');
          if (matriculasValidas.length > 0) {
            const gradoId = matriculasValidas[0].curso.grado.id;
            const cursosRes = await api.get(`/cursos/grado/${gradoId}`);
            setCursos(cursosRes.data);
            if (cursosRes.data.length > 0) setCursoSeleccionado(cursosRes.data[0]);
          } else {
            setCursos([]);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (cursoSeleccionado?.id) {
      setLoading(true);
      api.get(`/recursos/curso/${cursoSeleccionado.id}`)
        .then(res => setRecursos(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [cursoSeleccionado]);

  const getIconForType = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PDF': return <FileText size={20} className="text-rose-500" />;
      case 'VIDEO': return <Video size={20} className="text-purple-500" />;
      case 'LINK': return <LinkIcon size={20} className="text-blue-500" />;
      default: return <FileText size={20} className="text-slate-500" />;
    }
  };

  const getBgForType = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PDF': return 'bg-rose-50 border-rose-100 text-rose-600';
      case 'VIDEO': return 'bg-purple-50 border-purple-100 text-purple-600';
      case 'LINK': return 'bg-blue-50 border-blue-100 text-blue-600';
      default: return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const getColorForType = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'PDF': return 'bg-rose-50 border-rose-100 text-rose-600';
      case 'VIDEO': return 'bg-purple-50 border-purple-100 text-purple-600';
      case 'LINK': return 'bg-blue-50 border-blue-100 text-blue-600';
      default: return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const filtrados = recursos.filter(r => 
    r.titulo.toLowerCase().includes(search.toLowerCase()) || 
    r.tipo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans">
      
      {/* Premium Header */}
      <header className="mb-10 relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 md:p-12 shadow-2xl shadow-indigo-900/20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 z-0"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-inner">
            <FolderOpen size={14} strokeWidth={2.5} />
            Estudiante / Materiales
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Mis Recursos
          </h1>
          <p className="text-slate-300 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
            Explora, descarga y visualiza el material de clase, lecturas y enlaces que tus profesores han preparado para complementar tu aprendizaje.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR DE CURSOS */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                Tus Cursos
              </h3>
            </div>
            
            <div className="p-3 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
              {cursos.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={20} className="text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sin Cursos</p>
                </div>
              ) : cursos.map(curso => (
                <button
                  key={curso.id}
                  onClick={() => setCursoSeleccionado(curso)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${
                    cursoSeleccionado?.id === curso.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-500' 
                      : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {cursoSeleccionado?.id === curso.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    cursoSeleccionado?.id === curso.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:scale-110'
                  }`}>
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-[14px] truncate leading-tight mb-1 ${cursoSeleccionado?.id === curso.id ? 'text-white' : 'text-slate-800'}`}>
                      {curso.nombre}
                    </p>
                    <p className={`text-[10px] font-black tracking-widest uppercase truncate ${cursoSeleccionado?.id === curso.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {curso.grado?.nombre || 'General'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ÁREA PRINCIPAL DE RECURSOS */}
        <div className="lg:col-span-9 flex flex-col min-h-[500px]">
          {cursoSeleccionado ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
              
              {/* Header del Curso Seleccionado y Buscador */}
              <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mb-2">
                    {cursoSeleccionado.nombre}
                  </h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {filtrados.length} recursos disponibles
                  </p>
                </div>
                
                <div className="relative w-full md:w-72 group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar archivo o enlace..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Lista de Recursos */}
              <div className="p-6 md:p-8 flex-1 bg-slate-50/30">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Cargando archivos...</p>
                  </div>
                ) : filtrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center max-w-md mx-auto bg-white p-10 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 rotate-3">
                      <FolderOpen size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Bandeja Vacía</h3>
                    <p className="text-slate-500 font-medium text-center">
                      {search ? 'No se encontraron recursos que coincidan con tu búsqueda.' : 'Tus profesores aún no han subido material para este curso.'}
                    </p>
                    {search && (
                      <button onClick={() => setSearch('')} className="mt-6 text-indigo-600 font-bold text-sm hover:text-indigo-700 hover:underline">
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtrados.map(recurso => (
                      <a
                        key={recurso.id}
                        href={recurso.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-3xl -z-0 group-hover:from-indigo-50 transition-colors"></div>
                        
                        <div className="flex items-start gap-4 relative z-10 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${getBgForType(recurso.tipo)}`}>
                            {getIconForType(recurso.tipo)}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-extrabold text-slate-800 text-[15px] leading-tight mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {recurso.titulo}
                            </h4>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-wider">
                              {recurso.tipo}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                          <span className="text-[11px] font-bold text-slate-400">
                            {new Date(recurso.fechaSubida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {recurso.tipo === 'LINK' ? <LinkIcon size={14} /> : <Download size={14} />}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-6">
                <BookOpen size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">Selecciona un Curso</h3>
              <p className="text-slate-500 font-medium max-w-sm">
                Elige uno de tus cursos en el panel lateral para visualizar todo el material de estudio disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
