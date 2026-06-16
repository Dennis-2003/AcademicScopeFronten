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
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans">
      
      {/* --- HEADER --- */}
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} strokeWidth={2.5} />
            Admin / Directorio
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
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
              <button 
                onClick={openNewModal}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserPlus size={20} strokeWidth={2.5} />
                NUEVO USUARIO
              </button>
            </>
          )}
        </div>
      </header>

      {/* --- MAIN TABS --- */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setMainTab('directorio')}
          className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            mainTab === 'directorio'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users size={16} />
          Directorio de Personas
        </button>
        <button
          onClick={() => setMainTab('matriculas')}
          className={`px-6 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            mainTab === 'matriculas'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <IdCard size={16} />
          Gestión de Matrículas
        </button>
      </div>

      {mainTab === 'matriculas' ? (
        <div className="animate-fade-in">
          <GestionMatriculas isEmbedded={true} />
        </div>
      ) : (
        <>
          {/* --- TOOLBAR (Tabs & Search) --- */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-sm mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* TABS */}
        <div className="flex w-full xl:w-auto overflow-x-auto hide-scrollbar bg-slate-50 p-1 rounded-xl border border-slate-100">
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
              className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="flex w-full xl:w-auto items-center gap-2">
          <div className="relative w-full xl:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por DNI, nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <button className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-[15px] font-bold text-slate-700">Directorio de Personas</h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200/50 text-slate-600">
            {filteredUsuarios.length} usuarios
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-400">CARGANDO USUARIOS...</span>
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
              <Users size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">No se encontraron usuarios</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              {searchTerm ? 'Ningún usuario coincide con la búsqueda o filtros actuales.' : 'No hay usuarios registrados en el sistema.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {u.nombre?.charAt(0)}{u.apellido?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-slate-800">
                            {u.apellido}, {u.nombre}
                          </p>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <IdCard size={12} /> {u.dni}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getRoleBadge(u.rol)}
                    </td>
                    
                    <td className="px-6 py-4">
                      {u.email ? (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {u.email}
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-400 italic">No registrado</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      {u.activo ? (
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-bold text-slate-700 uppercase">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                          <span className="text-xs font-bold text-slate-500 uppercase">Inactivo</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          className={`p-2 rounded-lg transition-colors ${u.activo ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-amber-500 hover:text-emerald-600 hover:bg-emerald-50'}`} 
                          title={u.activo ? "Desactivar" : "Activar"}
                        >
                          {u.activo ? <Lock size={16} strokeWidth={2} /> : <Unlock size={16} strokeWidth={2} />}
                        </button>
                        <button 
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
                          title="Editar"
                        >
                          <Edit2 size={16} strokeWidth={2} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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

      {/* --- MODAL NUEVO USUARIO --- */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{ width: '90vw', maxWidth: '600px', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600">
                <UserPlus size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{usuarioAEditar ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Ingresa los datos personales y asigna un rol de sistema.</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              {errorMsg && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-3">
                  <AlertCircle size={18} />
                  {errorMsg}
                </div>
              )}
              
              <form onSubmit={handleSave}>
                
                {!usuarioAEditar && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <KeyRound size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-bold text-blue-800">Contraseña por defecto</h4>
                      <p className="text-xs text-blue-600/80 mt-1 font-medium leading-relaxed">
                        El sistema utilizará automáticamente el <strong>DNI</strong> ingresado como contraseña inicial. El usuario deberá cambiarla en su primer inicio de sesión.
                      </p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* NOMBRES */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nombres</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] text-slate-800 font-medium outline-none" 
                        value={form.nombre} 
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Ej. Juan Carlos"
                      />
                    </div>
                  </div>
                  
                  {/* APELLIDOS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Apellidos</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] text-slate-800 font-medium outline-none" 
                        value={form.apellido} 
                        onChange={e => setForm({ ...form, apellido: e.target.value })}
                        placeholder="Ej. Pérez Gómez"
                      />
                    </div>
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Documento (DNI)</label>
                    <div className="relative">
                      <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required 
                        type="text"
                        maxLength="8"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] text-slate-800 font-medium outline-none" 
                        value={form.dni} 
                        onChange={e => setForm({ ...form, dni: e.target.value })}
                        placeholder="00000000"
                      />
                    </div>
                  </div>

                  {/* ROL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Rol de Usuario</label>
                    <div className="relative">
                      <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] text-slate-800 font-medium outline-none appearance-none" 
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
                </div>

                {/* TUTOR (APODERADO) - Solo visible si el rol es ESTUDIANTE */}
                {form.rol === 'ESTUDIANTE' && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Apoderado / Tutor (Opcional)</label>
                    <div className="relative">
                      <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] text-slate-800 font-medium outline-none appearance-none" 
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
                  </div>
                )}

                {/* CORREO */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Correo Electrónico (Opcional)</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] text-slate-800 font-medium outline-none" 
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 text-[14px] font-bold text-slate-600 transition-colors hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white text-[14px] font-bold transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Guardando...' : (
                      <>
                        <CheckCircle2 size={18} />
                        {usuarioAEditar ? 'Guardar Cambios' : 'Crear Usuario'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      </>)}
    </div>
  );
}
