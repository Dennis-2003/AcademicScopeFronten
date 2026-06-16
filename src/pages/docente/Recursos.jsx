import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, FileText, Image as ImageIcon, Video, Link as LinkIcon, Download, Trash2, Loader2, Search, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCursosPorDocente } from '../../services/cursoService';
import { obtenerRecursosPorCurso, crearRecurso, eliminarRecurso } from '../../services/recursoService';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function Recursos() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [recursos, setRecursos] = useState([]);
  const [cargando, setCargando] = useState(false);


  
  const [mostrandoModal, setMostrandoModal] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoCursoId, setNuevoCursoId] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('PDF');
  const [nuevoArchivo, setNuevoArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

  useEffect(() => {
    if (nuevoArchivo && typeof nuevoArchivo !== 'string') {
      const url = URL.createObjectURL(nuevoArchivo);
      setLocalPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [nuevoArchivo]);

  useEffect(() => {
    if (user?.id) cargarDatos();
  }, [user]);

  async function cargarDatos() {
    setCargando(true);
    try {
      const cursosData = await obtenerCursosPorDocente(user.id);
      setCursos(cursosData);
      
      let todos = [];
      for (const curso of cursosData) {
        const recs = await obtenerRecursosPorCurso(curso.id);
        const conCurso = recs.map(r => ({ ...r, nombreCurso: curso.nombre, cursoId: curso.id }));
        todos = [...todos, ...conCurso];
      }
      
      todos.sort((a,b) => b.id - a.id);
      setRecursos(todos);
    } catch (error) {
      console.error("Error cargando recursos:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubir = async () => {
    if (!nuevoTitulo || !nuevoCursoId) return alert('Completa los campos obligatorios');
    if (!nuevoArchivo && nuevoTipo !== 'LINK') return alert('Selecciona un archivo para subir');

    setSubiendo(true);
    try {
      if (nuevoTipo === 'LINK') {
        await crearRecurso({
          curso: { id: parseInt(nuevoCursoId) },
          titulo: nuevoTitulo,
          tipo: 'LINK',
          url: nuevoArchivo || '',
        });
      } else {
        const formData = new FormData();
        formData.append('file', nuevoArchivo);
        formData.append('curso', parseInt(nuevoCursoId));
        formData.append('titulo', nuevoTitulo);
        formData.append('tipo', nuevoTipo);
        formData.append('tamano', nuevoArchivo?.size || 0);
        await api.post('/recursos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setMostrandoModal(false);
      setNuevoTitulo('');
      setNuevoArchivo(null);
      cargarDatos();
    } catch (err) {
      console.error("Error al subir recurso", err);
      alert("No se pudo subir el recurso");
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await eliminarRecurso(deleteTarget);
      await cargarDatos();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const getIconForType = (tipo) => {
    switch (tipo) {
      case 'PDF': return <FileText size={24} className="text-rose-500" />;
      case 'IMAGEN': return <ImageIcon size={24} className="text-emerald-500" />;
      case 'VIDEO': return <Video size={24} className="text-indigo-500" />;
      case 'LINK': return <LinkIcon size={24} className="text-amber-500" />;
      default: return <FileText size={24} className="text-slate-500" />;
    }
  };

  const formatearFecha = (isoString) => {
    if(!isoString) return '';
    return new Date(isoString).toLocaleDateString();
  };

  const recursosFiltrados = cursoFiltro 
    ? recursos.filter(r => r.cursoId === parseInt(cursoFiltro))
    : recursos;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Recursos y Materiales</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los archivos y enlaces para tus clases.</p>
        </div>
        <button 
          onClick={() => setMostrandoModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200"
        >
          <Upload size={18} />
          Subir Material
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar archivo..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <select 
            value={cursoFiltro}
            onChange={(e) => setCursoFiltro(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 min-w-[200px]"
          >
            <option value="">Todos los cursos</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : recursosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay recursos subidos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recursosFiltrados.map((rec) => (
              <div key={rec.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                    {getIconForType(rec.tipo)}
                  </div>
                  <button onClick={() => handleEliminar(rec.id)} className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2" title={rec.titulo}>{rec.titulo}</h3>
                <p className="text-xs text-slate-500 mb-4">{rec.nombreCurso}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{formatearFecha(rec.fechaSubida)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPreviewTarget({ url: rec.url, tipo: rec.tipo, titulo: rec.titulo })} 
                      className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors" 
                      title="Visualizar"
                    >
                      <Eye size={14} />
                    </button>
                    <a href={rec.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors" title="Descargar">
                      <Download size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && createPortal(
        <ConfirmModal
          isOpen={true}
          title="Eliminar recurso"
          message="¿Estás seguro de eliminar este recurso? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />,
        document.body
      )}

      {/* MODAL SUBIR RECURSO */}
      {mostrandoModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] p-4 flex justify-center items-center overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-[90vw] md:w-[480px] shrink-0 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Subir Nuevo Material</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Curso</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={nuevoCursoId}
                  onChange={e => setNuevoCursoId(e.target.value)}
                >
                  <option value="">Selecciona un curso...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tipo de Archivo</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={nuevoTipo}
                  onChange={e => setNuevoTipo(e.target.value)}
                >
                  <option value="PDF">Documento PDF</option>
                  <option value="VIDEO">Video</option>
                  <option value="IMAGEN">Imagen</option>
                  <option value="LINK">Enlace Web</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nombre del Material</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={nuevoTitulo}
                  onChange={e => setNuevoTitulo(e.target.value)}
                  placeholder="Ej. Lectura de Historia Tema 1"
                />
              </div>

              {nuevoTipo !== 'LINK' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Archivo</label>
                  {!nuevoArchivo ? (
                    <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                      <Upload size={18} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-500 flex-1 truncate">
                        Seleccionar archivo...
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Subir</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={e => setNuevoArchivo(e.target.files?.[0] || null)}
                      />
                    </label>
                  ) : (
                    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex justify-center items-center h-48 relative group">
                      {localPreviewUrl && nuevoTipo === 'IMAGEN' && <img src={localPreviewUrl} className="max-w-full max-h-full object-contain" alt="Vista previa" />}
                      {localPreviewUrl && nuevoTipo === 'VIDEO' && <video src={localPreviewUrl} controls className="max-w-full max-h-full" />}
                      {localPreviewUrl && nuevoTipo === 'PDF' && <iframe src={localPreviewUrl} className="w-full h-full border-0" title="Vista previa PDF" />}
                      
                      <button 
                        onClick={() => setNuevoArchivo(null)} 
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 rounded-lg shadow-sm backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        title="Quitar archivo"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent p-2 pointer-events-none">
                        <p className="text-white text-xs font-medium truncate">{nuevoArchivo.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">URL del Enlace</label>
                  <input
                    type="url"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    value={nuevoArchivo || ''}
                    onChange={e => setNuevoArchivo(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setMostrandoModal(false);
                    setNuevoArchivo(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubir}
                  disabled={subiendo}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {subiendo ? 'Subiendo...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL VISUALIZAR RECURSO */}
      {previewTarget && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] p-4 flex justify-center items-center">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {getIconForType(previewTarget.tipo)}
                {previewTarget.titulo}
              </h3>
              <div className="flex items-center gap-2">
                <a 
                  href={previewTarget.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Download size={14} /> Descargar
                </a>
                <button onClick={() => setPreviewTarget(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-0 sm:p-4 flex-1 overflow-hidden bg-slate-100 flex justify-center items-center min-h-[50vh]">
              {previewTarget.tipo === 'IMAGEN' && <img src={previewTarget.url} alt={previewTarget.titulo} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm" />}
              {previewTarget.tipo === 'VIDEO' && <video src={previewTarget.url} controls className="max-w-full max-h-[75vh] rounded-lg shadow-sm w-full" />}
              {previewTarget.tipo === 'PDF' && <iframe src={previewTarget.url} className="w-full h-[75vh] rounded-lg border-0 shadow-sm bg-white" title={previewTarget.titulo} />}
              {previewTarget.tipo === 'LINK' && (
                <div className="text-center space-y-4 bg-white p-8 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                    <LinkIcon size={32} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Enlace Externo</h4>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">Este recurso apunta a una página externa. Haz clic en el botón para visitarla.</p>
                  </div>
                  <a href={previewTarget.url} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm shadow-indigo-200">
                    Abrir Página
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
