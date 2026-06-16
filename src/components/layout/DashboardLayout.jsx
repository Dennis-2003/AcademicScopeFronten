import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileCheck2, 
  CalendarDays, 
  GraduationCap, 
  Bell, 
  HeartHandshake,
  LogOut,
  Search,
  Menu,
  X,
  Wallet,
  Award,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import CommandPalette from '../ui/CommandPalette';
import NotificationsDropdown from '../ui/NotificationsDropdown';
import ErrorBoundary from '../ui/ErrorBoundary';

const NAV_CONFIG = {
  ADMIN: [
    {
      category: 'Principal',
      items: [
        { to: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, end: true },
      ]
    },
    {
      category: 'Académico',
      items: [
        { to: '/dashboard/admin/cursos', label: 'Gestión Académica', icon: BookOpen },
        { to: '/dashboard/admin/evaluaciones', label: 'Desempeño y Asistencia', icon: GraduationCap },
        { to: '/dashboard/admin/conducta', label: 'Conducta', icon: AlertCircle },
      ]
    },
    {
      category: 'Comunidad',
      items: [
        { to: '/dashboard/admin/usuarios', label: 'Comunidad y Matrículas', icon: Users },
      ]
    },
    {
      category: 'Administración',
      items: [
        { to: '/dashboard/admin/pagos', label: 'Tesorería', icon: Wallet },
        { to: '/dashboard/admin/comunicados', label: 'Comunicados', icon: Bell },
      ]
    }
  ],
  DOCENTE: [
    {
      category: 'Principal',
      items: [
        { to: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, end: true },
        { to: '/dashboard/docente/horario', label: 'Mi Horario', icon: CalendarDays },
      ]
    },
    {
      category: 'Gestión de Clases',
      items: [
        { to: '/dashboard/docente/cursos', label: 'Mis Cursos', icon: BookOpen },
        { to: '/dashboard/docente/asistencia', label: 'Asistencia', icon: FileCheck2 },
        { to: '/dashboard/docente/calificaciones', label: 'Calificaciones', icon: Award },
      ]
    },
    {
      category: 'Actividades',
      items: [
        { to: '/dashboard/docente/asignaciones', label: 'Tareas', icon: ClipboardList },
        { to: '/dashboard/docente/recursos', label: 'Recursos', icon: FolderOpen },
      ]
    },
    {
      category: 'Comunicación',
      items: [
        { to: '/dashboard/docente/comunicados', label: 'Comunicados', icon: MessageSquare },
        { to: '/dashboard/docente/semaforo', label: 'Semáforo', icon: AlertCircle },
      ]
    }
  ],
  TUTOR: [
    {
      category: 'Menú Principal',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/dashboard/tutor/hijos', label: 'Mis Hijos (Semáforo)', icon: HeartHandshake },
        { to: '/dashboard/tutor/horario', label: 'Horarios de Clases', icon: CalendarDays },
      ]
    },
    {
      category: 'Administrativo',
      items: [
        { to: '/dashboard/tutor/pagos', label: 'Pagos y Finanzas', icon: Wallet },
        { to: '/dashboard/tutor/notificaciones', label: 'Avisos y Notificaciones', icon: Bell },
      ]
    }
  ],
  ESTUDIANTE: [
    {
      category: 'Principal',
      items: [
        { to: '/dashboard', label: 'Panel Principal', icon: LayoutDashboard, end: true },
        { to: '/dashboard/estudiante/horario', label: 'Mi Horario', icon: CalendarDays },
      ]
    },
    {
      category: 'Académico',
      items: [
        { to: '/dashboard/estudiante/tareas', label: 'Mis Tareas', icon: ClipboardList },
        { to: '/dashboard/estudiante/recursos', label: 'Material de Clase', icon: FolderOpen },
        { to: '/dashboard/estudiante/notas', label: 'Mis Notas', icon: GraduationCap },
      ]
    },
    {
      category: 'Seguimiento',
      items: [
        { to: '/dashboard/estudiante/asistencia', label: 'Mi Asistencia', icon: FileCheck2 },
        { to: '/dashboard/estudiante/conducta', label: 'Mi Conducta', icon: AlertCircle },
      ]
    },
    {
      category: 'Comunicación',
      items: [
        { to: '/dashboard/estudiante/comunicados', label: 'Comunicados', icon: MessageSquare },
      ]
    }
  ],
};

function NavItem({ item, isActive, onClick, isSubItem = false }) {
  const Icon = item.icon;
  
  return (
    <NavLink 
      to={item.to} 
      end={item.end} 
      onClick={onClick}
      className={`relative flex items-center gap-3 py-3 transition-all duration-200 group ${isSubItem ? 'pl-10 pr-6' : 'px-6'} ${
        isActive
          ? 'bg-indigo-50/80 text-indigo-700 font-extrabold'
          : 'text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {/* Active Left Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 transition-transform duration-200 ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></div>

      <Icon 
        size={isSubItem ? 18 : 20} 
        strokeWidth={isActive ? 2.5 : 2} 
        className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
      />
      <span className={`text-[13px] tracking-wide truncate mt-0.5 ${isSubItem ? '' : 'uppercase'}`}>{item.label}</span>
    </NavLink>
  );
}

function NavGroup({ group, isActiveItem, onClickItem }) {
  const isGroupActive = group.items.some(isActiveItem);
  const [isOpen, setIsOpen] = useState(isGroupActive);

  // Mostrar directamente sin acordeón si es la categoría principal o no requiere agrupación
  const isFlat = group.category === 'Principal' || group.category === 'Menú' || group.items.length === 1;

  if (isFlat) {
    return (
      <div className="mb-2">
        {group.category !== 'Menú' && group.category !== 'Principal' && (
           <p className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 mt-4">{group.category}</p>
        )}
        {group.items.map(item => (
          <NavItem key={item.to} item={item} isActive={isActiveItem(item)} onClick={onClickItem} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-3 text-left transition-colors hover:bg-slate-50 group"
      >
        <span className={`text-[11px] font-black uppercase tracking-wider ${isOpen ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
          {group.category}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-2">
          {group.items.map(item => (
            <NavItem key={item.to} item={item} isActive={isActiveItem(item)} onClick={onClickItem} isSubItem={true} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const navItems = NAV_CONFIG[user.rol] || [];
  const isActive = (item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  const userInitials = (user.nombre?.charAt(0) || '') + (user.apellido?.charAt(0) || '');

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans flex">
      
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} user={user} />
      
      {/* ==============================
          MOBILE OVERLAY & SIDEBAR
          ============================== */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ==============================
          DESKTOP & MOBILE SIDEBAR
          ============================== */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white z-50 flex flex-col transition-transform duration-300 ease-in-out w-[240px] shadow-sm
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* LOGO AREA */}
        <div className="h-[76px] flex items-center justify-between px-5 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-2">
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-sm text-base shadow-sm">AS</span>
              AcademicScope
            </span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 flex flex-col gap-0 overflow-y-auto hide-scrollbar pt-4 pb-6">
          {navItems.map((group, idx) => (
            <NavGroup 
              key={idx} 
              group={group} 
              isActiveItem={isActive} 
              onClickItem={() => setMobileMenuOpen(false)} 
            />
          ))}
        </nav>

        {/* USER PROFILE & LOGOUT */}
        <div className="border-t border-slate-200 bg-slate-50">
          <Link 
            to="/dashboard/perfil"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-4 hover:bg-slate-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080/api/usuarios/avatar/${user.avatarUrl}`} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-indigo-200" />
              ) : (
                userInitials
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <h3 className="text-sm font-bold text-slate-800 truncate">{user.nombre} {user.apellido}</h3>
              <p className="text-[12px] font-medium text-slate-500 truncate">Ver perfil</p>
            </div>
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-white border-t border-slate-200 text-[13px] font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} strokeWidth={2.5} />
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* ==============================
          MAIN CONTENT AREA
          ============================== */}
      <div className="flex-1 lg:pl-[240px] min-w-0 flex flex-col">
        
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden bg-transparent h-[70px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AS
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </header>

        {/* DESKTOP TOP BAR (Command Palette Trigger) - SOLO EN DASHBOARD */}
        {location.pathname === '/dashboard' && (
          <div className="hidden lg:flex items-center justify-between h-[80px] px-8 bg-transparent shrink-0">
            <div className="flex-1 max-w-2xl ml-8">
              {user?.rol === 'ADMIN' && (
                <button 
                  onClick={() => setCmdOpen(true)}
                  className="flex items-center justify-between w-full max-w-[400px] bg-slate-100/80 hover:bg-slate-200/80 border border-transparent hover:border-slate-300 text-slate-500 px-4 py-2.5 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Search size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-sm font-medium">Comandos y búsqueda rápida...</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-sm">
                    <span>Ctrl</span>
                    <span>K</span>
                  </div>
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationsDropdown />
            </div>
          </div>
        )}
        
        {/* NOTIFICACIONES FLOTANTES PARA OTRAS PÁGINAS */}
        {location.pathname !== '/dashboard' && (
          <div className="hidden lg:flex absolute top-6 right-8 z-50">
            <div className="bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50">
              <NotificationsDropdown />
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full max-w-full overflow-x-hidden">
          <div className="animate-fade-in w-full">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* ==============================
          MODAL DE CERRAR SESIÓN
          ============================== */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '400px',
            padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <LogOut size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>¿Cerrar Sesión?</h2>
            <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 32px 0', lineHeight: '1.5' }}>
              Estás a punto de salir de AcademicScope. Tendrás que volver a ingresar tus credenciales para acceder.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#475569', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancelar
              </button>
              <button 
                onClick={() => { setShowLogoutModal(false); logout(); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(239,68,68,0.2)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
