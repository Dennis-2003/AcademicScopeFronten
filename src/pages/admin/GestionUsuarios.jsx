import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  IdCard,
  User,
  Lock,
  Unlock,
  KeyRound,
  Download
} from 'lucide-react';
import ExportButton from '../../components/ui/ExportButton';
import Pagination, { usePagination } from '../../components/ui/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';
import GestionMatriculas from './GestionMatriculas';

export default function GestionUsuarios() {
  const [mainTab, setMainTab] = useState('directorio');
  const [usuarios, setUsuarios] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', dni: '', rol: 'ESTUDIANTE', tutorId: ''
  });

  const cargarUsuarios = () => {
    setLoading(true);
    Promise.all([
      api.get('/usuarios/rol/ADMIN').catch(() => ({ data: [] })),
      api.get('/usuarios/rol/DOCENTE').catch(() => ({ data: [] })),
      api.get('/usuarios/rol/TUTOR').catch(() => ({ data: [] })),
      api.get('/usuarios/rol/ESTUDIANTE').catch(() => ({ data: [] }))
    ]).then(([a, d, t, e]) => {
      setTutores(t.data);
      setUsuarios([...a.data, ...d.data, ...t.data, ...e.data]);
      setLoading(false);
    });
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const openNewModal = () => {
    setUsuarioAEditar(null);
    setForm({ nombre: '', apellido: '', email: '', dni: '', rol: 'ESTUDIANTE', tutorId: '' });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (usuario) => {
    setUsuarioAEditar(usuario);
    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      dni: usuario.dni || '',
      rol: usuario.rol || 'ESTUDIANTE',
      tutorId: usuario.tutor?.id || ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { ...form };
      
      // Clean up tutor payload for the backend
      const tId = payload.tutorId ? parseInt(payload.tutorId) : null;
      if (payload.rol === 'ESTUDIANTE' && tId) {
        payload.tutor = { id: tId };
        payload.tutorId = tId; // Por si el backend espera el campo plano
      } else {
        payload.tutor = null; // Enviar null explícito a ver si borra
        payload.tutorId = null;
      }
      
      console.log('Enviando payload al backend:', payload);

      if (usuarioAEditar) {
        await api.put(`/usuarios/${usuarioAEditar.id}`, { ...payload, activo: usuarioAEditar.activo });
      } else {
        await api.post('/usuarios', payload);
      }
      setShowModal(false);
      cargarUsuarios();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el usuario.');
    } finally { setIsSubmitting(false); }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      await api.put(`/usuarios/${usuario.id}`, { ...usuario, activo: !usuario.activo });
      cargarUsuarios();
    } catch (err) {
      alert('No se pudo cambiar el estado del usuario.');
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/usuarios/${deleteTarget}`); cargarUsuarios(); }
    catch { alert('No se pudo eliminar el usuario.'); }
    finally { setDeleteTarget(null); }
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = searchTerm === '' || 
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTab = activeTab === 'ALL' || u.rol === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const { page, totalPages, setPage, paginatedData } = usePagination(filteredUsuarios);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="bg-purple-100 text-purple-700 border-purple-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Administrador</span>;
      case 'DOCENTE': return <span className="bg-rose-100 text-rose-700 border-rose-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Docente</span>;
      case 'TUTOR': return <span className="bg-emerald-100 text-emerald-700 border-emerald-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Apoderado</span>;
      case 'ESTUDIANTE': return <span className="bg-blue-100 text-blue-700 border-blue-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Estudiante</span>;
      default: return <span className="bg-slate-100 text-slate-700 border-slate-200 border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{role}</span>;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col pb-8 font-sans">
      
      {/* GLOBAL HERO HEADER - COMPACTO */}
      <div className="relative mb-6 bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-800 shrink-0 w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[50px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[50px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700/60 shadow-inner">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Usuarios</span>
              </div>
            </h1>
            <p className="text-slate-400 font-medium mt-2 text-sm ml-16">
              Administra el acceso de estudiantes, docentes, tutores y administradores.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {mainTab === 'directorio' && (
              <>
                <ExportButton 
                  headers={[
                    { label: 'DNI', accessor: 'dni' },
                    { label: 'Nombre', accessor: 'nombre' },
                    { label: 'Apellido', accessor: 'apellido' },
                    { label: 'Rol', accessor: 'rol' },
                  ]}
                  data={usuarios}
                  filename="usuarios.csv"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ENTERPRISE TABLE VIEW */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-0 w-full mb-8">
        
        {/* TABS HEADER */}
        <div className="flex items-center px-8 border-b border-slate-100 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setMainTab('directorio')}
            className={`px-6 py-5 text-sm font-black tracking-wide border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${mainTab === 'directorio' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={16} strokeWidth={2.5} />
            DIRECTORIO DE PERSONAS
          </button>
          <button
            onClick={() => setMainTab('matriculas')}
            className={`px-6 py-5 text-sm font-black tracking-wide border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${mainTab === 'matriculas' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <IdCard size={16} strokeWidth={2.5} />
            GESTIÓN DE MATRÍCULAS
          </button>
        </div>

        {mainTab === 'matriculas' ? (
          <div className="flex-1 overflow-auto">
            <GestionMatriculas isEmbedded={true} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* TOOLBAR & FILTERS */}
            <div className="p-6 bg-slate-50/50 flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0 border-b border-slate-100">
              
              {/* PILLS */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full xl:w-auto">
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'ESTUDIANTE', label: 'Estudiantes' },
                  { id: 'DOCENTE', label: 'Docentes' },
                  { id: 'TUTOR', label: 'Apoderados' },
                  { id: 'ADMIN', label: 'Administradores' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SEARCH & ADD */}
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por DNI, nombre o correo..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={openNewModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-amber-400 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 active:scale-95 whitespace-nowrap"
                >
                  <UserPlus size={18} strokeWidth={2.5} />
                  Nuevo
                </button>
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Usuario</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Rol</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contacto</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Estado</th>
                    <th className="py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
                           <Users className="text-slate-300 animate-pulse" size={28} />
                         </div>
                         <h3 className="text-lg font-black text-slate-800 mb-1">Cargando usuarios...</h3>
                      </td>
                    </tr>
                  ) : filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-4">
                           <Users className="text-slate-300" size={28} />
                         </div>
                         <h3 className="text-lg font-black text-slate-800 mb-1">No se encontraron usuarios</h3>
                         <p className="text-sm text-slate-500 font-medium">{searchTerm ? 'Ningún usuario coincide con la búsqueda.' : 'No hay usuarios registrados.'}</p>
                      </td>
                    </tr>
                  ) : paginatedData.map(u => (
                    <tr key={u.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm shadow-inner border border-slate-200 uppercase flex-shrink-0">
                            {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                              {u.apellido}, {u.nombre}
                            </p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                              <IdCard size={12} /> {u.dni}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-8">
                        {getRoleBadge(u.rol)}
                      </td>
                      
                      <td className="py-4 px-8">
                        {u.email ? (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                            <Mail size={14} className="text-slate-400" />
                            {u.email}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">No registrado</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-8">
                        {u.activo ? (
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Inactivo</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="py-4 px-8 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${u.activo ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} 
                            title={u.activo ? "Desactivar" : "Activar"}
                          >
                            {u.activo ? <Lock size={16} strokeWidth={2.5} /> : <Unlock size={16} strokeWidth={2.5} />}
                          </button>
                          <button 
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
                            title="Editar"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Eliminar"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-slate-100">
               <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {deleteTarget && createPortal(
        <ConfirmModal
          isOpen={true}
          title="Eliminar usuario"
          message="¿Estás seguro? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />,
        document.body
      )}

      {/* --- DRAWER NUEVO / EDITAR USUARIO --- */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative w-full max-w-[450px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right shrink-0">
            
            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-0.5">
                  {usuarioAEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Ingresa los datos personales y asigna un rol de sistema.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-7 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {errorMsg && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} strokeWidth={2.5} />
                  {errorMsg}
                </div>
              )}
              
              <form id="userForm" onSubmit={handleSave} className="space-y-5">
                
                {!usuarioAEditar && (
                  <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                    <KeyRound size={20} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-700">Contraseña por defecto</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed">
                        El sistema utilizará automáticamente el <strong>DNI</strong> ingresado como contraseña inicial.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {/* NOMBRES */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombres</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400" 
                      value={form.nombre} 
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Ej. Juan Carlos"
                    />
                  </div>
                  
                  {/* APELLIDOS */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Apellidos</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400" 
                      value={form.apellido} 
                      onChange={e => setForm({ ...form, apellido: e.target.value })}
                      placeholder="Ej. Pérez Gómez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* DNI */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">DNI</label>
                    <input 
                      required 
                      type="text"
                      maxLength="8"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-black text-sm text-slate-900 placeholder:text-slate-400" 
                      value={form.dni} 
                      onChange={e => setForm({ ...form, dni: e.target.value })}
                      placeholder="00000000"
                    />
                  </div>

                  {/* ROL */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rol de Usuario</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
                      value={form.rol} 
                      onChange={e => setForm({ ...form, rol: e.target.value })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="DOCENTE">Docente</option>
                      <option value="TUTOR">Tutor / Apoderado</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* TUTOR (APODERADO) - Solo visible si el rol es ESTUDIANTE */}
                {form.rol === 'ESTUDIANTE' && (
                  <div className="animate-fade-in">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Apoderado / Tutor (Opcional)</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 appearance-none" 
                      value={form.tutorId} 
                      onChange={e => setForm({ ...form, tutorId: e.target.value })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      <option value="">Ninguno (O asignar más adelante)</option>
                      {tutores.map(t => (
                        <option key={t.id} value={t.id}>{t.apellido}, {t.nombre} (DNI: {t.dni})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* CORREO */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correo Electrónico (Opcional)</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                
              </form>
            </div>

            <div className="px-7 py-6 border-t border-slate-100 bg-white shrink-0 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                disabled={isSubmitting}
                className="flex-[0.4] py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="userForm"
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : (usuarioAEditar ? 'Guardar Cambios' : 'Crear Usuario')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
