import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  BellRing, 
  ShieldCheck, 
  Zap, 
  Wallet,
  GraduationCap,
  MessageCircle,
  Send,
  Phone
} from 'lucide-react';
import api from '../services/api';

export default function Landing() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', colegio: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email) return;
    setEnviando(true);
    try {
      await api.post('/contacto', form);
      setEnviado(true);
      setForm({ nombre: '', email: '', telefono: '', colegio: '' });
      setTimeout(() => setEnviado(false), 5000);
    } catch {
      alert('Error al enviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .opacity-0 { opacity: 0; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}} />

      {/* WHATSAPP FLOTANTE */}
      <a
        href="https://wa.me/51999999999?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20AcademicScope"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl hover:bg-emerald-600 hover:scale-110 transition-all flex items-center justify-center animate-bounce"
        style={{ animationDuration: '3s' }}
        aria-label="Chatea con nosotros por WhatsApp"
      >
        <MessageCircle size={28} strokeWidth={2} />
      </a>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              AS
            </div>
            <span className="font-extrabold text-xl text-slate-800 tracking-tight">Academic<span className="text-indigo-600">Scope</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#soluciones" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Soluciones</a>
            <a href="#contacto" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:inline-flex text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              Solicitar Demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-0 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 opacity-0 animate-slide-up">
              <Zap size={14} className="text-amber-500" /> Software de Gestión Educativa
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8 opacity-0 animate-slide-up delay-100">
              El control total de tu colegio, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">en una sola plataforma.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 font-medium mb-10 leading-relaxed opacity-0 animate-slide-up delay-200">
              Moderniza tu institución con el único ERP que incluye <strong className="text-slate-800">finanzas inteligentes</strong> y un <strong className="text-slate-800">Semáforo Académico Preventivo</strong> para reducir la deserción escolar.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 opacity-0 animate-slide-up delay-300">
              <Link to="/login" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center gap-2">
                Agendar Demostración <ArrowRight size={20} />
              </Link>
              <p className="text-sm font-medium text-slate-500 ml-2">Migración de datos en 48 hrs.</p>
            </div>
          </div>
          
          <div className="relative opacity-0 animate-slide-up delay-200 hidden lg:block">
            <div className="relative z-10 bg-white p-2 rounded-3xl shadow-2xl border border-slate-200/60 animate-float">
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-md h-7 flex items-center px-3 border border-slate-200">
                    <div className="w-4 h-4 rounded-full bg-slate-200 mr-2"></div>
                    <div className="w-32 h-2 rounded bg-slate-200"></div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-4">
                    <div className="h-20 bg-indigo-50 rounded-xl border border-indigo-100 p-4">
                      <div className="w-12 h-3 bg-indigo-200 rounded mb-2"></div>
                      <div className="w-20 h-6 bg-indigo-600 rounded"></div>
                    </div>
                    <div className="h-40 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                      <div className="flex justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100"></div>
                        <div className="w-20 h-4 bg-slate-200 rounded"></div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full mb-2"><div className="w-[80%] h-full bg-emerald-400 rounded-full"></div></div>
                      <div className="w-full h-2 bg-slate-100 rounded-full"><div className="w-[60%] h-full bg-amber-400 rounded-full"></div></div>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-4">
                    <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                      <div className="w-32 h-4 bg-slate-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-slate-100 rounded"></div>
                        <div className="w-[90%] h-3 bg-slate-100 rounded"></div>
                        <div className="w-[70%] h-3 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-28 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-4">
                      <div className="flex-1 bg-slate-50 rounded-lg"></div>
                      <div className="flex-1 bg-slate-50 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retención</p>
                <p className="text-xl font-black text-slate-800">+42%</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 glass-card p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-float" style={{ animationDelay: '2s' }}>
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Morosidad</p>
                <p className="text-xl font-black text-slate-800">-60%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 border-y border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            Confiado por instituciones de vanguardia en todo el país
          </p>
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><ShieldCheck/> San Juan</div>
            <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><GraduationCap/> Cristo Rey</div>
            <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><BookOpenIcon/> Santa Ana</div>
            <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Users/> Innova Edu</div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-32" id="soluciones">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-3">Módulos Principales</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Todo lo que necesitas, sin la complejidad.
            </h3>
            <p className="text-lg text-slate-600 font-medium">
              AcademicScope reemplaza a 5 herramientas diferentes. Centralizamos tu operación para que tu equipo directivo recupere su tiempo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Wallet size={32} />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-4">Finanzas Mixtas Inteligentes</h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                ¿Eres colegio público o privado? El sistema se adapta. Gestiona pensiones mensuales con control de morosidad, o configura cuotas únicas (APAFA) con un solo clic.
              </p>
            </div>
            
            <div className="bg-slate-900 p-10 rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <BarChart3 size={32} />
                </div>
                <h4 className="text-2xl font-extrabold text-white mb-4">Semáforo Preventivo Exclusivo</h4>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Nuestro algoritmo convierte notas y asistencia en colores visuales. Los padres reciben alertas en sus celulares si su hijo entra en "Rojo", evitando la deserción antes de que suceda.
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BellRing size={32} />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-4">Centro de Comunicaciones</h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Despídete de los grupos de WhatsApp y las circulares impresas. Envía notificaciones masivas a grados específicos, docentes o padres con niveles de urgencia.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800 mb-4">Matrículas Masivas con Wizard</h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Matricular a 500 alumnos a inicio de año ya no será un dolor de cabeza. Nuestro asistente paso a paso te permite asignar aulas completas en menos de 3 clics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / TIMELINE */}
      <section className="py-32 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">
                Operación simplificada para todo tu ecosistema.
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">1</div>
                    <div className="w-0.5 h-16 bg-indigo-100 mt-2"></div>
                  </div>
                  <div className="pt-2">
                    <h5 className="text-xl font-bold text-slate-800 mb-2">Administración Central</h5>
                    <p className="text-slate-600 font-medium">Aperturas el año, configuras los grados y matriculas en bloque.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">2</div>
                    <div className="w-0.5 h-16 bg-indigo-100 mt-2"></div>
                  </div>
                  <div className="pt-2">
                    <h5 className="text-xl font-bold text-slate-800 mb-2">Docentes empoderados</h5>
                    <p className="text-slate-600 font-medium">Ingresan notas y asistencia fácilmente desde su celular o laptop.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0"><CheckCircle2/></div>
                  </div>
                  <div className="pt-2">
                    <h5 className="text-xl font-bold text-slate-800 mb-2">Padres tranquilos</h5>
                    <p className="text-slate-600 font-medium">Ven el "Semáforo" de sus hijos en tiempo real y reciben comunicados oficiales.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200">
              <h4 className="text-2xl font-bold text-slate-800 mb-8">¿Por qué elegirnos?</h4>
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600"><Zap size={20}/></div>
                  <span className="text-slate-700 font-bold text-lg">Migración de datos rápida</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600"><ShieldCheck size={20}/></div>
                  <span className="text-slate-700 font-bold text-lg">Soporte directo vía WhatsApp</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600"><BarChart3 size={20}/></div>
                  <span className="text-slate-700 font-bold text-lg">Reportes gerenciales exportables</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE FORM */}
      <section className="py-24 bg-slate-900 relative overflow-hidden" id="contacto">
        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                ¿Listo para modernizar tu institución?
              </h2>
              <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8">
                Déjanos tus datos y te contactaremos en menos de 24 horas para una demostración personalizada sin compromiso.
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Llámanos</p>
                  <p className="text-white font-bold">(01) 999 9999</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-2xl">
              {enviado ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Mensaje enviado!</h3>
                  <p className="text-slate-500 font-medium">Te contactaremos pronto.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Solicitar Información</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nombre completo</label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                        placeholder="Ej: Juan Pérez"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Correo electrónico</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Ej: juan@colegio.edu.pe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Teléfono</label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                        placeholder="Ej: 987 654 321"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Nombre del colegio</label>
                      <input
                        type="text"
                        value={form.colegio}
                        onChange={e => setForm(f => ({ ...f, colegio: e.target.value }))}
                        placeholder="Ej: I.E.P. San José"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                      <Send size={16} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">AS</div>
              <span className="font-extrabold text-lg text-white tracking-tight">Academic<span className="text-indigo-500">Scope</span></span>
            </Link>
            <p className="font-medium text-sm max-w-xs">Software SaaS de gestión académica y financiera para instituciones educativas modernas.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Plataforma</h5>
            <ul className="space-y-2 text-sm font-medium">
              <li><a href="#soluciones" className="hover:text-white transition-colors">Soluciones</a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Contáctanos</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Contacto</h5>
            <ul className="space-y-2 text-sm font-medium">
              <li><a href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <MessageCircle size={14} /> WhatsApp
              </a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Formulario Web</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© {new Date().getFullYear()} AcademicScope. Todos los derechos reservados.</p>
          <p>Hecho con tecnología de vanguardia en Perú.</p>
        </div>
      </footer>

    </div>
  );
}

function BookOpenIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
