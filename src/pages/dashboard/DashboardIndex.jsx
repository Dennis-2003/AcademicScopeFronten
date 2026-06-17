import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import DocenteDashboard from "../dashboards/DocenteDashboard";
import EstudianteDashboard from "../dashboards/EstudianteDashboard";
import TutorDashboard from "../dashboards/TutorDashboard";
import {
  Users,
  GraduationCap,
  UserCheck,
  BookMarked,
  Activity,
  Clock,
  Calendar,
  MoreVertical,
  ChevronDown,
  MessageSquare,
  X,
  Send
} from "lucide-react";

// --- Helpers ---
function catmullRom2bezier(pts) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  let result = `M ${pts[0].x},${pts[0].y} `;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    result += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
  }
  return result;
}

// --- Components ---

function WelcomeBanner({ user, fechaStr }) {
  return (
    <div className="relative w-full mb-8 rounded-[1.25rem] p-6 md:p-8 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-bg shadow-[0_8px_30px_rgb(99,102,241,0.2)] border border-indigo-500 group">
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-10 -mb-10 w-40 h-40 rounded-full bg-indigo-400 opacity-20 blur-2xl group-hover:translate-x-10 transition-transform duration-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-fuchsia-500 opacity-20 blur-3xl animate-pulse"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-50 text-xs font-extrabold tracking-wider border border-white/20 mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Panel de Control Principal
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-2 drop-shadow-md">
            Bienvenido de vuelta, {user.nombre}
          </h1>
          <p className="text-indigo-100 font-medium text-sm md:text-base opacity-90">
            {fechaStr} — Todo está listo para gestionar tu institución.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat, animated }) {
  const { label, value, color, bg, Icon, prefix } = stat;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let c = 0;
    const step = Math.max(1, Math.ceil(value / 25));
    const t = setInterval(() => {
      c = Math.min(c + step, value);
      setCount(c);
      if (c >= value) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, [animated, value]);

  return (
    <div className="bg-white rounded-[1.25rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-800 tracking-tight leading-none mb-2">
            {prefix}{animated ? count : value}
          </h3>
          <p className="text-[13px] font-bold text-slate-400">{label}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: bg, color }}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

function SmoothAreaChart({ data }) {
  if (!data || !data.meses || data.meses.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl mt-4">Cargando datos...</div>;
  }

  const w = 400, h = 200, ox = 40, oy = 20;
  const n = data.meses.length;
  const step = (w - ox) / Math.max(1, n - 1);
  const maxVal = Math.max(10, ...data.cursosActivos) * 1.2;

  const pts = data.cursosActivos.map((v, i) => ({
    x: ox + i * step,
    y: h - oy - (v / maxVal) * (h - oy * 2)
  }));

  const pathD = catmullRom2bezier(pts);
  const fillD = `${pathD} L ${pts[pts.length - 1].x},${h - oy} L ${pts[0].x},${h - oy} Z`;

  return (
    <div className="w-full mt-6">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Y Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const val = Math.round(maxVal * pct);
          const y = h - oy - pct * (h - oy * 2);
          return (
            <g key={pct}>
              <text x={ox - 10} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="end">{val}</text>
              <line x1={ox} y1={y} x2={w} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            </g>
          );
        })}

        {/* Fill and Line */}
        <path d={fillD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DoubleBarChart({ data }) {
  if (!data || !data.meses || data.meses.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl mt-4">Cargando datos...</div>;
  }

  const bars = data.meses.map((mes, i) => {
    const ingresos = data.cursosActivos[i] || 0;
    const gastos = data.asistenciaMedia[i] || 0;
    return {
      label: mes,
      top: ingresos,
      bottom: gastos
    };
  });

  const maxVal = Math.max(...bars.map(b => Math.max(b.top, b.bottom)));

  return (
    <div className="w-full mt-6 h-[200px] flex items-stretch justify-between px-2">
      {/* Y Axis pseudo labels */}
      <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 py-4 h-full pr-4 text-right">
        <span>80k</span>
        <span>53k</span>
        <span>27k</span>
        <span>0k</span>
        <span>-27k</span>
        <span>-53k</span>
        <span>-80k</span>
      </div>

      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col items-center w-full relative h-full">
          {/* Middle zero line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 z-0"></div>
          
          <div className="flex-1 flex flex-col justify-end items-center pb-1 w-full z-10">
            <div className="w-3 md:w-4 bg-indigo-500 rounded-full" style={{ height: `${(bar.top / maxVal) * 90}%` }}></div>
          </div>
          <div className="flex-1 flex flex-col justify-start items-center pt-1 w-full z-10">
            <div className="w-3 md:w-4 bg-rose-500 rounded-full" style={{ height: `${(bar.bottom / maxVal) * 90}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickLink({ item, onClick }) {
  const { label, desc, Icon, color, bg } = item;
  return (
    <button 
      onClick={onClick} 
      className="w-full bg-white rounded-2xl border border-slate-100 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg, color }}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <h4 className="text-[15px] font-bold text-slate-800 leading-tight">{label}</h4>
        <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
      </div>
    </button>
  );
}

function NotificationModal({ isOpen, onClose, usuarios }) {
  const [destinatarioId, setDestinatarioId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    try {
      await api.post('/notificaciones', {
        usuario: { id: parseInt(destinatarioId) },
        titulo,
        mensaje,
        fechaEnvio: new Date().toISOString(),
        leido: false
      });
      setStatus({ loading: false, error: null, success: true });
      setTimeout(() => {
        setStatus({ loading: false, error: null, success: false });
        onClose();
        setDestinatarioId("");
        setTitulo("");
        setMensaje("");
      }, 1500);
    } catch (error) {
      setStatus({ loading: false, error: "Error al enviar notificación", success: false });
    }
  };

  return createPortal(
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '24px', 
        right: '24px', 
        width: '380px', 
        maxHeight: 'calc(100vh - 48px)',
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(103, 80, 164, 0.25), 0 0 0 1px rgba(103, 80, 164, 0.1)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* Fixed Header */}
      <div style={{ padding: '24px 24px 20px 24px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(103, 80, 164, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={24} fill="currentColor" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 2px 0' }}>Nuevo Mensaje</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: '500' }}>Envío directo al sistema</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: '#f8f7fc', border: 'none', cursor: 'pointer', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseOut={e => e.currentTarget.style.background = '#f8f7fc'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="custom-scrollbar" style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {status.success && (
          <div style={{ marginBottom: '20px', backgroundColor: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '12px', border: '1px solid #a7f3d0', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
            ¡Comunicado enviado con éxito!
          </div>
        )}
        {status.error && (
          <div style={{ marginBottom: '20px', backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Destinatario</label>
            <select 
              required
              value={destinatarioId}
              onChange={e => setDestinatarioId(e.target.value)}
              className="form-control"
              style={{ backgroundColor: '#f8f7fc', border: '1px solid transparent', padding: '14px', borderRadius: '12px', fontSize: '14px' }}
            >
              <option value="">Seleccione un usuario...</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} {u.apellido} - {u.rol}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Asunto</label>
            <input 
              required
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Reunión de Padres"
              className="form-control"
              style={{ backgroundColor: '#f8f7fc', border: '1px solid transparent', padding: '14px', borderRadius: '12px', fontSize: '14px' }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Mensaje</label>
            <textarea 
              required
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              placeholder="Escribe los detalles aquí..."
              className="form-control custom-scrollbar"
              style={{ backgroundColor: '#f8f7fc', border: '1px solid transparent', padding: '14px', borderRadius: '12px', resize: 'none', height: '100px', fontSize: '14px' }}
            ></textarea>
          </div>
          
          <div style={{ marginTop: '8px' }}>
            <button 
              type="submit" 
              disabled={status.loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', justifyContent: 'center' }}
            >
              {status.loading ? "Enviando..." : (
                <>
                  <Send size={18} /> Enviar Ahora
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function DashboardIndex() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.rol) {
    case 'ESTUDIANTE':
      return <EstudianteDashboard user={user} />;
    case 'DOCENTE':
      return <DocenteDashboard user={user} />;
    case 'TUTOR':
      return <TutorDashboard user={user} />;
    case 'ADMIN':
    default:
      return <AdminDashboard user={user} />;
  }
}

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);
  const [stats, setStats]   = useState({ estudiantes: 0, docentes: 0, tutores: 0, cursos: 0 });
  const [chartData, setChartData] = useState(null);
  
  // Notification Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuariosList, setUsuariosList] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/usuarios/rol/ESTUDIANTE').catch(() => ({ data: [] })),
      api.get('/usuarios/rol/DOCENTE').catch(() => ({ data: [] })),
      api.get('/usuarios/rol/TUTOR').catch(() => ({ data: [] })),
      api.get('/cursos').catch(() => ({ data: [] })),
      api.get('/dashboard/rendimiento').catch(() => ({ data: null }))
    ]).then(([e, d, t, c, r]) => {
      setStats({ estudiantes: e.data.length, docentes: d.data.length, tutores: t.data.length, cursos: c.data.length });
      setUsuariosList([...e.data, ...d.data, ...t.data]);
      if (r && r.data) setChartData(r.data);
    });
  }, []);

  const STATS = [
    { id: "students", label: "Total Students", value: stats.estudiantes, color: "#6366f1", bg: "#6366f115", Icon: GraduationCap, prefix: "" },
    { id: "courses", label: "Active Courses", value: stats.cursos, color: "#10b981", bg: "#10b98115", Icon: BookMarked, prefix: "" },
    { id: "teachers", label: "Total Teachers", value: stats.docentes, color: "#f43f5e", bg: "#f43f5e15", Icon: UserCheck, prefix: "" },
    { id: "tutors", label: "Total Tutors", value: stats.tutores, color: "#0ea5e9", bg: "#0ea5e915", Icon: Users, prefix: "" },
  ];

  const QUICK_LINKS = [
    { label: "Gestión de Cursos",  desc: "Administrar grados y secciones", Icon: BookMarked, color: "#6366f1", bg: "#6366f115", to: "/dashboard/admin/cursos" },
    { label: "Directorio", desc: "Administrar profesores y estudiantes",   Icon: Users, color: "#10b981", bg: "#10b98115", to: "/dashboard/admin/usuarios" },
    { label: "Matrículas",         desc: "Inscripciones activas",  Icon: Activity, color: "#f59e0b", bg: "#f59e0b15", to: "/dashboard/admin/matriculas" }
  ];

  const hoy = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = hoy.toLocaleDateString('es-ES', options);

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans bg-slate-50/50 min-h-screen px-4 md:px-8 pt-6 relative">
      
      <WelcomeBanner user={user} fechaStr={fechaStr} />

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
        {STATS.map((s) => (
          <StatCard key={s.id} stat={s} animated={animated} />
        ))}
      </div>

      {/* --- CHARTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* REVENUE CHART */}
        <section className="bg-white rounded-[1.25rem] p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up animate-delay-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Rendimiento (Cursos)</h2>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors">
              Mes <ChevronDown size={14} />
            </div>
          </div>
          <SmoothAreaChart data={chartData} />
        </section>

        {/* EXPENSES CHART */}
        <section className="bg-white rounded-[1.25rem] p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up animate-delay-200 relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Actividad vs Bajas</h2>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors">
              Mes <ChevronDown size={14} />
            </div>
          </div>
          <DoubleBarChart data={chartData} />
          
          {/* Floating Action Button */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="absolute -bottom-6 -right-4 w-14 h-14 bg-sky-500 rounded-full shadow-lg shadow-sky-500/40 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
          >
            <MessageSquare size={24} fill="currentColor" />
          </div>
        </section>

      </div>

      {/* --- QUICK LINKS (Accesos Directos) --- */}
      <section className="mb-8 animate-slide-up animate-delay-300">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-4 ml-1">Accesos Directos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {QUICK_LINKS.map(item => (
            <QuickLink key={item.label} item={item} onClick={() => navigate(item.to)} />
          ))}
        </div>
      </section>

      <NotificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        usuarios={usuariosList} 
      />
    </div>
  );
}
