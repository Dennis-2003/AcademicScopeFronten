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
    <div className="w-full max-w-7xl mx-auto animate-fade-in font-sans pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mi Perfil</h1>
          <p className="text-slate-500 font-medium mt-1">Gestiona tu información personal y configuración de seguridad</p>
        </div>
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

      {/* HERO PERFIL */}
      <div className="relative w-full bg-slate-900 rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Fondo elegante */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b] opacity-100"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-[0.05] blur-[50px]"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500 rounded-full opacity-[0.05] blur-[50px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400 flex items-center justify-center text-5xl font-black shadow-xl shadow-black/40 border-4 border-slate-800 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : user.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080/api/usuarios/avatar/${user.avatarUrl}`} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(user.nombre?.charAt(0) || '') + (user.apellido?.charAt(0) || '')}</span>
              )}
            </div>
            <label className="absolute inset-0 rounded-full bg-slate-900/0 group-hover:bg-slate-900/60 transition-colors flex items-center justify-center cursor-pointer">
              <Camera size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Info Principal */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-center pt-2 md:pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 text-amber-400 text-xs font-bold uppercase tracking-wider border border-slate-700/60 mb-4 shadow-sm backdrop-blur-md self-center md:self-start">
              <Shield size={14} />
              {user.rol}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm mb-2">{user.nombre} {user.apellido}</h2>
            <p className="text-slate-400 text-sm md:text-base font-medium">Panel de control de tu cuenta institucional</p>
          </div>
          
          {/* Detalles rápidos (DNI, Estado) */}
          <div className="flex flex-col gap-4 self-center md:self-end bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm min-w-[240px]">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Documento (DNI)</label>
              <div className="text-lg font-extrabold text-white mt-1">{user.dni}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Estado de Cuenta</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-bold text-white">Activa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* DATOS PERSONALES */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner text-slate-700 flex items-center justify-center">
                <User size={24} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Datos Personales</h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5">Información básica de tu cuenta</p>
              </div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all">
                <Edit3 size={16} /> Editar
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleProfileSave} disabled={status.loading} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-amber-400 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 disabled:opacity-70">
                  <Save size={16} /> Guardar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 content-start">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombres</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Apellidos</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all disabled:opacity-60 disabled:bg-slate-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all disabled:opacity-60 disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEGURIDAD */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 shadow-inner text-amber-600 flex items-center justify-center">
              <KeyRound size={24} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Seguridad de la Cuenta</h3>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Actualiza tu contraseña</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña Actual</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="passwordActual"
                  value={formData.passwordActual}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  name="passwordNuevo"
                  value={formData.passwordNuevo}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nueva</label>
                <input
                  type="password"
                  name="confirmarPassword"
                  value={formData.confirmarPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>
            <div className="pt-6 mt-auto flex justify-end">
              <button
                type="submit"
                disabled={status.loading}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status.loading ? (
                  <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
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
  );
}
