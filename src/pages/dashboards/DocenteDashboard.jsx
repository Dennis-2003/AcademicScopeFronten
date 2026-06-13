import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  Calendar,
  Clock,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import { CardSkeleton, Skeleton } from '../../components/ui/SkeletonLoader';

const DIAS_LAB = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

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

export default function DocenteDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ cursos: 0, estudiantes: 0, tareasPendientes: 0 });
  const [horarioHoy, setHorarioHoy] = useState([]);
  const [proximasEval, setProximasEval] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setCargando(true);
      try {
        const res = await api.get(`/cursos/docente/${user.id}`);
        const cursos = res.data;
        
        let totalEstudiantes = 0;
        for (const c of cursos) {
          try {
            const mRes = await api.get(`/matriculas/curso/${c.id}`);
            totalEstudiantes += mRes.data.length;
          } catch {}
        }

        setStats({ cursos: cursos.length, estudiantes: totalEstudiantes, tareasPendientes: 0 });

        if (cursos.length > 0) {
          try {
            const hRes = await api.get(`/horarios/docente/${user.id}`);
            const hoy = DIAS_LAB[new Date().getDay()].toUpperCase();
            const hoyData = hRes.data.filter(h => h.diaSemana === hoy || h.dia === hoy);
            setHorarioHoy(hoyData.length > 0 ? hoyData : []);
          } catch {}
        }

        try {
          const evRes = await api.get(`/evaluaciones/docente/${user.id}/proximas`);
          setProximasEval(evRes.data || []);
        } catch {}
      } catch (error) {
        console.error("Error fetching docente data", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, [user]);

  const hoy = new Date();

  return (
    <div className="w-full animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 relative rounded-[2.5rem] overflow-hidden bg-[#0f172a] shadow-2xl p-8 md:p-12 flex flex-col justify-center min-h-[220px]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-500/40 via-purple-500/20 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Espacio del Docente
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 leading-tight">
                Hola de nuevo, <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Profesor {user.apellido}</span>
              </h1>
            </div>
            <div className="hidden sm:block opacity-80">
              <BookOpen size={100} className="text-white/10 -rotate-12 transform scale-150" />
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-white border border-slate-200/60 shadow-lg p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-500">
            <Calendar size={28} strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight capitalize mb-1">
            {hoy.toLocaleDateString('es-ES', { weekday: 'long' })}
          </h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            {hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="w-12 h-1 bg-slate-100 rounded-full mb-4"></div>
          <p className="text-[13px] font-medium text-slate-500 italic">
            "La educación es el arma más poderosa para cambiar el mundo."
          </p>
        </div>
      </div>

      {cargando ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                <Skeleton className="h-5 w-40" />
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <Skeleton className="h-5 w-40" />
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard label="Cursos Asignados" value={stats.cursos} Icon={BookOpen} color="#6366f1" bg="#6366f115" />
            <StatCard label="Total Estudiantes" value={stats.estudiantes} Icon={Users} color="#10b981" bg="#10b98115" />
            <StatCard label="Tareas por Revisar" value={stats.tareasPendientes} Icon={ClipboardList} color="#f59e0b" bg="#f59e0b15" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
            <div className="flex flex-col gap-8">
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Tus Clases de Hoy</h2>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                  {horarioHoy.length === 0 ? (
                    <div className="text-center py-6 text-sm font-medium text-slate-400">No tienes clases programadas para hoy.</div>
                  ) : horarioHoy.map((clase, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold">
                          <Clock size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{clase.curso?.nombre || clase.nombre}</h4>
                          <p className="text-xs font-semibold text-slate-500">{clase.aula || ''}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold bg-white/50 px-3 py-1 rounded-lg text-indigo-700">
                        {clase.horaInicio?.slice(0, 5) || ''} - {clase.horaFin?.slice(0, 5) || ''}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Gestión Rápida</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <QuickAction label="Registrar Asistencia" desc="Tomar lista de hoy" Icon={Calendar} color="#f43f5e" bg="#f43f5e15" onClick={() => navigate('/dashboard/docente/asistencia')} />
                  <QuickAction label="Subir Calificaciones" desc="Evaluar alumnos" Icon={Award} color="#6366f1" bg="#6366f115" onClick={() => navigate('/dashboard/docente/calificaciones')} />
                  <QuickAction label="Ver Cursos" desc="Material y detalles" Icon={BookOpen} color="#10b981" bg="#10b98115" onClick={() => navigate('/dashboard/docente/cursos')} />
                </div>
              </section>
            </div>

            <div>
              <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Próximas Evaluaciones</h2>
                <div className="flex flex-col gap-4">
                  {proximasEval.length === 0 ? (
                    <div className="text-center py-6 text-sm font-medium text-slate-400">Sin evaluaciones programadas.</div>
                  ) : proximasEval.slice(0, 5).map(ev => {
                    const dia = ev.fecha ? new Date(ev.fecha).getDate() : '—';
                    return (
                      <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {dia}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{ev.nombre}</h4>
                          <p className="text-xs font-medium text-slate-500">{ev.curso?.nombre || ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
