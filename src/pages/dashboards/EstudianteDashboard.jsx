import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  FileCheck2, 
  CalendarDays, 
  Clock,
  AlertCircle,
  Bell,
  ChevronRight,
  Loader2,
  MapPin
} from 'lucide-react';
import api from '../../services/api';

function StatCard({ label, value, Icon, color, bg }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm" style={{ backgroundColor: bg, color }}>
            <Icon size={24} strokeWidth={2} className="transition-transform group-hover:scale-110" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ label, desc, Icon, color, bg, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 group relative overflow-hidden"
    >
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

export default function EstudianteDashboard({ user }) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({ asistencia: 100, semaforo: 'GRIS', notaMedia: 0 });
  const [clasesHoy, setClasesHoy] = useState([]);
  const [cursosActivos, setCursosActivos] = useState([]);

  const hoy = new Date();
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = hoy.toLocaleDateString('es-ES', opcionesFecha);
  const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const diaSemanaActual = diasSemana[hoy.getDay()];

  useEffect(() => {
    if (user?.id) cargarDatos();
  }, [user]);

  async function cargarDatos() {
    setCargando(true);
    try {
      // 1. Calificaciones (Semáforo)
      const resNotas = await api.get(`/calificaciones/estudiante/${user.id}`).catch(() => ({ data: [] }));
      const notas = resNotas.data || [];
      let semaforo = 'GRIS';
      let notaMedia = 0;
      
      if (notas.length > 0) {
        const sum = notas.reduce((acc, curr) => acc + curr.nota, 0);
        notaMedia = Math.round(sum / notas.length);
        if (notaMedia >= 14) semaforo = 'VERDE';
        else if (notaMedia >= 11) semaforo = 'AMBAR';
        else semaforo = 'ROJO';
      }

      // 2. Matrículas (Para Asistencia Global y Horario de Hoy)
      const matRes = await api.get(`/matriculas/estudiante/${user.id}`).catch(() => ({ data: [] }));
      const matriculas = (matRes.data || []).filter(m => m.estado !== 'RETIRADA');
      
      let totalAsistencias = 0;
      let totalAsistidos = 0;
      let clasesDelDia = [];

      await Promise.all(matriculas.map(async (matricula) => {
        if (!matricula.curso) return;
        const cursoId = matricula.curso.id;
        
        // Asistencias
        const asisRes = await api.get(`/asistencias/estudiante/${user.id}/curso/${cursoId}`).catch(() => ({ data: [] }));
        const asistencias = asisRes.data || [];
        totalAsistencias += asistencias.length;
        totalAsistidos += asistencias.filter(a => ['PRESENTE', 'TARDANZA', 'JUSTIFICADO'].includes(a.tipo)).length;

        // Horarios
        const horRes = await api.get(`/horarios/curso/${cursoId}`).catch(() => ({ data: [] }));
        const horarios = horRes.data || [];
        const horariosHoy = horarios.filter(h => h.diaSemana === diaSemanaActual);
        
        horariosHoy.forEach(h => {
          clasesDelDia.push({
            ...h,
            nombreCurso: matricula.curso.nombre,
            codigoCurso: matricula.curso.codigo,
            tipoCurso: matricula.curso.tipo
          });
        });
      }));

      clasesDelDia.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      const porcentajeAsistencia = totalAsistencias > 0 ? Math.round((totalAsistidos / totalAsistencias) * 100) : 100;

      setStats({
        asistencia: porcentajeAsistencia,
        semaforo,
        notaMedia
      });
      setClasesHoy(clasesDelDia);
      
      // Guardar cursos activos para mostrarlos en el panel
      const cursosList = matriculas.map(m => m.curso).filter(Boolean);
      setCursosActivos(cursosList);

    } catch (error) {
      console.error("Error cargando dashboard de estudiante", error);
    } finally {
      setCargando(false);
    }
  };

  const getSemaforoColor = (color) => {
    switch (color) {
      case 'VERDE': return { bg: 'bg-emerald-500', text: 'text-emerald-500', cardBg: 'bg-emerald-50', cardBorder: 'border-emerald-200' };
      case 'AMBAR': return { bg: 'bg-amber-500', text: 'text-amber-500', cardBg: 'bg-amber-50', cardBorder: 'border-amber-200' };
      case 'ROJO': return { bg: 'bg-red-500', text: 'text-red-500', cardBg: 'bg-red-50', cardBorder: 'border-red-200' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-500', cardBg: 'bg-slate-50', cardBorder: 'border-slate-200' };
    }
  };

  const semaforoStyles = getSemaforoColor(stats.semaforo);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Cargando tu panel principal...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Banner de Bienvenida Estudiante */}
      <div className="relative w-full rounded-[2rem] overflow-hidden mb-8 shadow-xl bg-gradient-to-r from-cyan-600 to-blue-600 border border-blue-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between z-10">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
              Panel de Estudiante
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              ¡Hola, {user.nombre}! <span className="inline-block hover:rotate-12 transition-transform cursor-default text-white origin-[70%_70%]">✌️</span>
            </h1>
            <p className="text-blue-100 font-medium">
              {fechaStr} — Sigue aprendiendo y mejorando.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-2xl p-6 border ${semaforoStyles.cardBorder} shadow-sm ${semaforoStyles.cardBg} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-2">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <AlertCircle size={24} className={semaforoStyles.text} strokeWidth={2} />
            </div>
          </div>
          <div>
            <h3 className={`text-3xl font-black tracking-tight uppercase ${semaforoStyles.text}`}>
              {stats.semaforo === 'GRIS' ? 'S/N' : stats.semaforo}
            </h3>
            <p className="text-sm font-bold text-slate-600 mt-1">Estado del Semáforo</p>
          </div>
        </div>
        <StatCard label="Asistencia Global" value={`${stats.asistencia}%`} Icon={FileCheck2} color="#3b82f6" bg="#3b82f615" />
        <StatCard label="Promedio General" value={stats.notaMedia > 0 ? stats.notaMedia : 'N/A'} Icon={GraduationCap} color="#f59e0b" bg="#f59e0b15" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
        {/* Columna Izquierda */}
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Mis Cursos Activos</h2>
            {cursosActivos.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <GraduationCap size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Aún no tienes matrículas activas.</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Acércate a coordinación para regularizar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cursosActivos.map(curso => (
                  <div key={curso.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-sm flex items-center gap-4 group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-transform group-hover:scale-105 ${curso.tipo === 'TALLER' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {curso.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-[15px] truncate">{curso.nombre}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{curso.codigo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Accesos Directos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction label="Mis Notas (Semáforo)" desc="Ver detalle de calificaciones" Icon={GraduationCap} color="#10b981" bg="#10b98115" onClick={() => navigate('/dashboard/estudiante/notas')} />
              <QuickAction label="Mi Asistencia" desc="Ver reporte de tardanzas y faltas" Icon={FileCheck2} color="#6366f1" bg="#6366f115" onClick={() => navigate('/dashboard/estudiante/asistencia')} />
              <QuickAction label="Mis Tareas" desc="Subir trabajos y ver notas" Icon={FileCheck2} color="#f43f5e" bg="#f43f5e15" onClick={() => navigate('/dashboard/estudiante/tareas')} />
            </div>
          </section>
        </div>

        {/* Columna Derecha */}
        <div>
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Horario de Hoy</h2>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wider">
                {diaSemanaActual}
              </span>
            </div>
            
            {clasesHoy.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400 font-medium text-sm gap-2">
                <CalendarDays size={32} className="opacity-50" />
                No tienes clases programadas hoy
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {clasesHoy.map(clase => (
                  <div key={clase.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-sm relative overflow-hidden group">
                    {clase.tipoCurso === 'TALLER' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    )}
                    {clase.tipoCurso !== 'TALLER' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    )}
                    <div className="flex items-center gap-1.5 text-indigo-600 font-black text-[13px] mb-1">
                      <Clock size={14} />
                      <span>{clase.horaInicio} - {clase.horaFin}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-[15px] leading-tight mb-2">
                      {clase.nombreCurso}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg w-fit">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{clase.aula}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
