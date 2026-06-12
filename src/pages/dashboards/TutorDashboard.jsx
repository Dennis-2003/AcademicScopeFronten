import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Bell, 
  ChevronRight,
  User,
  AlertTriangle
} from 'lucide-react';

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

export default function TutorDashboard({ user }) {
  const navigate = useNavigate();
  const [stats] = useState({ hijos: 2, notificaciones: 5 });

  const hoy = new Date();
  const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = hoy.toLocaleDateString('es-ES', opcionesFecha);

  const HIJOS_MOCK = [
    { nombre: 'Carlos Condori', grado: '3ro Secundaria', semaforo: 'VERDE', asistencia: 98 },
    { nombre: 'Ana Condori', grado: '1ro Secundaria', semaforo: 'AMBAR', asistencia: 85 },
  ];

  const getSemaforoColorText = (color) => {
    switch (color) {
      case 'VERDE': return 'text-emerald-500';
      case 'AMBAR': return 'text-amber-500';
      case 'ROJO': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Banner de Bienvenida Tutor */}
      <div className="relative w-full rounded-[2rem] overflow-hidden mb-8 shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 border border-indigo-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-10"></div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between z-10">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse"></span>
              Panel de Apoderado
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Bienvenido(a), {user.nombre} <span className="inline-block hover:rotate-12 transition-transform cursor-default text-white origin-[70%_70%]">👋</span>
            </h1>
            <p className="text-purple-100 font-medium">
              {fechaStr} — Mantente al tanto del progreso de tus hijos.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <StatCard label="Hijos Matriculados" value={stats.hijos} Icon={User} color="#8b5cf6" bg="#8b5cf615" />
        <StatCard label="Notificaciones Nuevas" value={stats.notificaciones} Icon={Bell} color="#f43f5e" bg="#f43f5e15" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
        {/* Columna Izquierda */}
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Resumen de tus Hijos</h2>
            <div className="flex flex-col gap-4">
              {HIJOS_MOCK.map((hijo, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/dashboard/tutor/hijos')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {hijo.nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{hijo.nombre}</h4>
                      <p className="text-sm font-medium text-slate-500">{hijo.grado}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">Asistencia</div>
                      <div className="text-lg font-black text-slate-700">{hijo.asistencia}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">Semáforo</div>
                      <div className={`text-lg font-black uppercase ${getSemaforoColorText(hijo.semaforo)}`}>{hijo.semaforo}</div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Accesos Directos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction label="Ver Semáforo Detallado" desc="Calificaciones por curso" Icon={HeartHandshake} color="#8b5cf6" bg="#8b5cf615" onClick={() => navigate('/dashboard/tutor/hijos')} />
              <QuickAction label="Bandeja de Entrada" desc="Mensajes y comunicados" Icon={Bell} color="#f59e0b" bg="#f59e0b15" onClick={() => navigate('/dashboard/tutor/notificaciones')} />
            </div>
          </section>
        </div>

        {/* Columna Derecha */}
        <div>
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Alertas Recientes</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Baja en Matemáticas</h4>
                  <p className="text-xs text-amber-700 mt-1">Ana Condori ha bajado su rendimiento a ÁMBAR en el curso de Matemáticas.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
