import { useState, useEffect } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle2, KeyRound, Shield, Camera, Mail, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '',
    passwordActual: '', passwordNuevo: '', confirmarPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
      }));
    }
    const authData = JSON.parse(sessionStorage.getItem('auth'));
    if (authData && user && authData.password === user.dni) {
      setNeedsPasswordChange(true);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error || status.success) setStatus({ loading: false, error: null, success: false });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setEditing(true); // Permitir guardar el cambio
    }
  };

  const handleProfileSave = async () => {
    setStatus({ loading: true, error: null, success: false });
    try {
      await api.put(`/usuarios/${user.id}`, {
        ...user,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
      });

      let updatedAvatarUrl = user.avatarUrl;

      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('archivo', avatarFile);
        const resAvatar = await api.post(`/usuarios/${user.id}/avatar`, formDataAvatar, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedAvatarUrl = resAvatar.data.avatarUrl;
      }

      updateUser({
        ...user,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        avatarUrl: updatedAvatarUrl
      });
      setEditing(false);
      setAvatarFile(null);
      setStatus({ loading: false, error: null, success: true });
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: 'Error al actualizar perfil', success: false });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.passwordNuevo !== formData.confirmarPassword) {
      setStatus({ loading: false, error: 'Las contraseñas nuevas no coinciden', success: false });
      return;
    }
    if (formData.passwordNuevo.length < 6) {
      setStatus({ loading: false, error: 'La nueva contraseña debe tener al menos 6 caracteres', success: false });
      return;
    }
    setStatus({ loading: true, error: null, success: false });
    try {
      await api.put('/usuarios/cambiar-password', {
        dni: user.dni,
        passwordActual: formData.passwordActual,
        passwordNuevo: formData.passwordNuevo
      });
      setStatus({ loading: false, error: null, success: true });
      setFormData(prev => ({ ...prev, passwordActual: '', passwordNuevo: '', confirmarPassword: '' }));
      setNeedsPasswordChange(false);
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 4000);
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.',
        success: false
      });
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in font-sans pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mi Perfil</h1>
        <p className="text-slate-500 font-medium mt-1">Gestiona tu información personal y configuración de seguridad</p>
      </div>

      {status.success && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100 animate-slide-down">
          <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold">Cambios guardados correctamente.</p>
        </div>
      )}
      {status.error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold">{status.error}</p>
        </div>
      )}

      {needsPasswordChange && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-slide-down">
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-full mt-0.5 flex-shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-amber-800 font-bold text-lg">¡Actualiza tu contraseña!</h3>
            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
              Estás usando tu DNI como contraseña. Cámbiala por una más segura en el formulario de más abajo.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA IZQUIERDA: Avatar + Datos Fijos */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-black mb-4 shadow-inner overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : user.avatarUrl ? (
                  <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080/api/usuarios/avatar/${user.avatarUrl}`} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user.nombre?.charAt(0) || '') + (user.apellido?.charAt(0) || '')}</span>
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer">
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user.nombre} {user.apellido}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mt-2">
              <Shield size={14} />
              {user.rol}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} /> Detalles
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Documento (DNI)</label>
                <div className="text-sm font-bold text-slate-700 mt-0.5">{user.dni}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Estado</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-bold text-emerald-700">Cuenta Activa</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Rol</label>
                <div className="text-sm font-bold text-slate-700 mt-0.5 capitalize">{user.rol?.toLowerCase()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-2 space-y-6">

          {/* DATOS PERSONALES */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Datos Personales</h3>
                  <p className="text-sm font-medium text-slate-500">Información básica de tu cuenta</p>
                </div>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Edit3 size={16} /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleProfileSave} disabled={status.loading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-70">
                    <Save size={16} /> Guardar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombres</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Apellidos</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEGURIDAD */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <KeyRound size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Seguridad de la Cuenta</h3>
                <p className="text-sm font-medium text-slate-500">Actualiza tu contraseña</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Contraseña Actual</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="passwordActual"
                    value={formData.passwordActual}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Ingresa tu contraseña actual"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nueva Contraseña</label>
                  <input
                    type="password"
                    name="passwordNuevo"
                    value={formData.passwordNuevo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmar Nueva</label>
                  <input
                    type="password"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status.loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
