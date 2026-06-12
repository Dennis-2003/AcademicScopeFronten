import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import DocenteDashboard from "./dashboards/DocenteDashboard";
import EstudianteDashboard from "./dashboards/EstudianteDashboard";
import TutorDashboard from "./dashboards/TutorDashboard";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  TrendingUp,
  Activity,
  Clock,
  ChevronRight,
  BookMarked,
  Settings,
  MoreVertical,
  Calendar
} from "lucide-react";

// --- Helpers ---

function computeOccupation(stats) {
  return [
    { label: "Cursos activos",       value: stats.cursos, pct: Math.min(100, Math.round((stats.cursos / 40) * 100)),  color: "#6366f1" },
    { label: "Usuarios conectados",  value: stats.estudiantes + stats.docentes + stats.tutores, pct: Math.min(100, Math.round(((stats.estudiantes + stats.docentes + stats.tutores) / 500) * 100)), color: "#10b981" },
    { label: "Asistencia promedio",  value: "—", pct: 89,  color: "#3b82f6" },
    { label: "Tareas entregadas",    value: "—", pct: 74,  color: "#f59e0b" },
  ];
}

function WelcomeBanner({ user, fechaStr }) {
  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden mb-10 animate-slide-up shadow-2xl bg-slate-950">
      
      {/* Animated Aurora Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob animation-delay-4000"></div>
      
      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xl border border-white/10"></div>
      
      <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between z-10">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-slate-300 text-xs font-bold uppercase tracking-wider mb-5 border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            Panel de Administración
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">{user.nombre}</span> <span className="inline-block origin-[70%_70%] hover:rotate-12 transition-transform cursor-default text-white">👋</span>
          </h1>
          <p className="text-slate-400 font-medium text-base md:text-lg">
            {fechaStr} — Tienes un excelente día por delante.
          </p>
        </div>
        <div className="hidden md:flex mt-6 md:mt-0 relative group perspective-1000">
           {/* Futuristic Glowing Icon Container */}
           <div className="relative w-32 h-32 flex items-center justify-center transform group-hover:scale-105 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="relative w-full h-full bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Activity size={56} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" strokeWidth={1.5} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat, animated }) {
  const { label, value, pct, trend, trendLabel, color, bg, Icon } = stat;
  const [barW, setBarW] = useState(0);
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
    const b = setTimeout(() => setBarW(pct), 200);
    return () => { clearInterval(t); clearTimeout(b); };
  }, [animated, value, pct]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm" style={{ backgroundColor: bg, color }}>
            <Icon size={24} strokeWidth={2} className="transition-transform group-hover:scale-110" />
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1`} style={{ backgroundColor: `${color}15`, color }}>
          {trend === 'up' ? <TrendingUp size={14} /> : <Activity size={14} />}
          {trendLabel}
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
          {animated ? count : value}
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Progreso</span>
          <span className="text-xs font-bold text-slate-700">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${barW}%`, backgroundColor: color }} 
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ item, onClick }) {
  const { label, desc, Icon, color, bg } = item;
  return (
    <button 
      onClick={onClick} 
      className="w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 group relative overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
      <div className="flex justify-between items-center mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
      </div>
      <h4 className="text-[15px] font-bold text-slate-800">{label}</h4>
      <p className="text-xs font-medium text-slate-500 mt-1">{desc}</p>
    </button>
  );
}

function ActivityItem({ item }) {
  const { initials, name, code, role, time, color, bg } = item;
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ backgroundColor: bg, color }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-slate-800 truncate">{name}</div>
        <div className="text-xs font-medium text-slate-500 mt-0.5">{code}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: bg, color }}>
          {role}
        </span>
        <span className="text-[11px] font-medium text-slate-400">{time}</span>
      </div>
    </div>
  );
}

function OccupationBar({ item, animated }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const t = setTimeout(() => setW(item.pct), 300);
    return () => clearTimeout(t);
  }, [animated, item.pct]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-semibold text-slate-600">{item.label}</span>
        <span className="text-[13px] font-bold text-slate-800">{item.value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[1500ms] ease-out"
          style={{ width: `${w}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

function MinimalClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = n => String(n).padStart(2, "0");

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200 text-indigo-500">
          <Clock size={24} strokeWidth={2} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {pad(time.getHours())}:{pad(time.getMinutes())}
            <span className="text-slate-400 text-lg ml-1 font-semibold">:{pad(time.getSeconds())}</span>
          </div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hora Local</div>
        </div>
      </div>
      <Calendar size={24} className="text-slate-300" strokeWidth={1.5} />
    </div>
  );
}

function ModernSparkChart({ data }) {
  if (!data || !data.meses || data.meses.length === 0) {
    return (
      <div className="w-full mt-4 h-[200px] flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        Cargando estadísticas...
      </div>
    );
  }

  const w = 300, h = 120, ox = 30;
  const n = data.meses.length;
  const step = (w - ox) / Math.max(1, n - 1);
  
  const maxCourses = Math.max(10, ...data.cursosActivos) * 1.2; // 20% padding top
  const maxAtt = 100;

  const getY = (val, max) => h - (val / Math.max(max, 1)) * h;

  const pts1 = data.cursosActivos.map((v, i) => `${ox + i * step},${getY(v, maxCourses)}`).join(" ");
  const pts2 = data.asistenciaMedia.map((v, i) => `${ox + i * step},${getY(v, maxAtt)}`).join(" ");
  
  const fill1 = `${pts1} ${w},${h} ${ox},${h}`;
  const fill2 = `${pts2} ${w},${h} ${ox},${h}`;

  return (
    <div className="w-full mt-4">
      <div className="flex gap-6 mb-6">
        {[["#6366f1", "Cursos Activos"], ["#10b981", "Asistencia Media"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            {l}
          </div>
        ))}
      </div>
      <svg viewBox="0 0 300 140" className="w-full h-auto overflow-visible" style={{ maxHeight: '200px' }}>
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 40, 80, 120].map(y => (
          <line key={y} x1={ox} y1={y} x2={w} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
        ))}
        
        {/* X Axis Labels */}
        {data.meses.map((m, i) => (
          <text key={i} x={ox + i * step} y={138} fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle">{m}</text>
        ))}
        
        {/* Fills */}
        <polygon points={fill1} fill="url(#grad1)" />
        <polygon points={fill2} fill="url(#grad2)" />
        
        {/* Lines */}
        <polyline points={pts1} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" />
        <polyline points={pts2} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-line" style={{ animationDelay: '200ms' }} />
        
        {/* Points for current month */}
        <circle cx={ox + (n - 1) * step} cy={getY(data.cursosActivos[n - 1], maxCourses)} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
        <circle cx={ox + (n - 1) * step} cy={getY(data.asistenciaMedia[n - 1], maxAtt)} r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
      </svg>
    </div>
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
  const [usuarios, setUsuarios] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [eventos, setEventos] = useState([]);

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
      api.get('/dashboard/rendimiento').catch(() => ({ data: null })),
      api.get('/eventos').catch(() => ({ data: [] }))
    ]).then(([e, d, t, c, r, ev]) => {
      setStats({ estudiantes: e.data.length, docentes: d.data.length, tutores: t.data.length, cursos: c.data.length });
      const all = [...e.data, ...d.data, ...t.data];
      setUsuarios(all.slice(0, 4));
      if (r && r.data) setChartData(r.data);
      setEventos(ev.data || []);
    });
  }, []);

  const STATS = [
    { id: "students", label: "Estudiantes Activos", value: stats.estudiantes, pct: 33, trend: "stable", trendLabel: "Estable", color: "#6366f1", bg: "#6366f115", Icon: GraduationCap },
    { id: "courses", label: "Cursos Registrados", value: stats.cursos, pct: 95, trend: "up", trendLabel: "+12%", color: "#10b981", bg: "#10b98115", Icon: BookMarked },
    { id: "teachers", label: "Plana Docente", value: stats.docentes, pct: 100, trend: "stable", trendLabel: "Estable", color: "#f43f5e", bg: "#f43f5e15", Icon: UserCheck },
    { id: "tutors", label: "Tutores Asignados", value: stats.tutores, pct: 100, trend: "stable", trendLabel: "Estable", color: "#3b82f6", bg: "#3b82f615", Icon: Users },
  ];

  const ACTIVITY = usuarios.map(u => {
    let color = "#6366f1", bg = "#6366f115";
    if (u.rol === 'DOCENTE') { color = "#f43f5e"; bg = "#f43f5e15"; }
    else if (u.rol === 'TUTOR') { color = "#10b981"; bg = "#10b98115"; }
    
    return {
      initials: (u.nombre?.charAt(0) || '') + (u.apellido?.charAt(0) || ''),
      name: `${u.apellido}, ${u.nombre}`,
      code: u.dni,
      role: u.rol === 'ESTUDIANTE' ? 'Estudiante' : u.rol === 'DOCENTE' ? 'Docente' : u.rol === 'TUTOR' ? 'Tutor' : u.rol,
      time: 'Hace un momento',
      color, bg
    };
  });

  const QUICK_LINKS = [
    { label: "Gestión de Cursos",  desc: "Administrar grados y secciones", Icon: BookOpen, color: "#6366f1", bg: "#6366f115", to: "/dashboard/admin/cursos" },
    { label: "Directorio",         desc: "Usuarios y roles del sistema",   Icon: Users, color: "#10b981", bg: "#10b98115", to: "/dashboard/admin/usuarios" },
    { label: "Matrículas",         desc: "Proceso de inscripción actual",  Icon: Activity, color: "#f59e0b", bg: "#f59e0b15", to: "/dashboard/admin/matriculas" },
    { label: "Configuración",      desc: "Ajustes globales del periodo",   Icon: Settings, color: "#64748b", bg: "#64748b15", to: "/dashboard" },
  ];

  const hoy = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = hoy.toLocaleDateString('es-ES', options);

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-fade-in pb-12 font-sans">
      
      <WelcomeBanner user={user} fechaStr={fechaStr} />

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up animate-delay-100">
        {STATS.map((s) => (
          <StatCard key={s.id} stat={s} animated={animated} />
        ))}
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8 animate-slide-up animate-delay-200">
          
          {/* Chart Section */}
          <section className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Rendimiento Académico</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Evolución de participación vs asistencia en el semestre</p>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
            <ModernSparkChart data={chartData} />
          </section>

          {/* Quick Links Section */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Accesos Directos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_LINKS.map(item => (
                <QuickLink key={item.label} item={item} onClick={() => navigate(item.to)} />
              ))}
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8 animate-slide-up animate-delay-300">
          
          {/* System Status Section */}
          <section className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Estado del Sistema</h2>
            </div>
            <div className="flex flex-col gap-6 flex-1">
              {computeOccupation(stats).map(item => (
                <OccupationBar 
                  key={item.label} 
                  item={item} 
                  animated={animated} 
                />
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100">
              <MinimalClock />
            </div>
          </section>

          {/* Recent Users Section */}
          <section className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Actividad Reciente</h2>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors">
                Ver todos
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {ACTIVITY.length === 0 ? (
                <div className="text-center py-6 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No hay actividad reciente
                </div>
              ) : ACTIVITY.map(item => (
                <ActivityItem key={item.code} item={item} />
              ))}
            </div>
          </section>

          {/* Upcoming Events Section (Bento Grid Addition) */}
          <section className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Próximos Eventos</h2>
            </div>
            <div className="flex flex-col gap-3">
              {eventos.length === 0 ? (
                <div className="text-center py-6 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No hay eventos programados
                </div>
              ) : eventos.slice(0, 5).map(ev => {
                const fecha = ev.fecha ? new Date(ev.fecha) : null;
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                    <div className="w-12 h-12 flex flex-col items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <span className="text-[10px] font-bold uppercase">{fecha ? fecha.toLocaleString('es-ES', { month: 'short' }).replace('.','') : '—'}</span>
                      <span className="text-lg font-extrabold leading-none">{fecha ? fecha.getDate() : '—'}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{ev.nombre || ev.titulo}</div>
                      <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {ev.hora || ev.horaInicio?.slice(0,5) || '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
