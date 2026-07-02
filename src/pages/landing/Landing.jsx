import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, BarChart3, Users, BellRing,
  ShieldCheck, Zap, Wallet, MessageCircle, Send, Phone,
  BookOpen, TrendingDown, Clock, AlertTriangle, ChevronDown,
  GraduationCap, Star,
} from 'lucide-react';
import api from '../../services/api';

/* ══════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════ */
const C = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  border: '#E2E8F0',
  indigo: '#2563EB',
  indigo2: '#1E3A8A',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  text: '#0F172A',
  muted: '#475569',
  muted2: '#64748B',
};

/* Canvas removed for clean aesthetic */

/* ══════════════════════════════════════════════
   COUNTER ANIMATE
══════════════════════════════════════════════ */
function AnimCounter({ target, suffix = '', prefix = '', dur = 1400 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = now => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          setVal(Math.round(target * ease));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: .5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, dur]);

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ══════════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════════ */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: .12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SEMÁFORO CARD (hero)
══════════════════════════════════════════════ */
const ALUMNOS = [
  { nombre: 'Ana García', asist: 97, prom: 16.4, estado: 'verde', badge: 'Óptimo', sub: 'Sin alertas' },
  { nombre: 'Carlos Mendoza', asist: 76, prom: 12.1, estado: 'amarillo', badge: 'En riesgo', sub: 'Baja asistencia' },
  { nombre: 'Lucía Torres', asist: 61, prom: 9.2, estado: 'rojo', badge: '⚠ Alerta', sub: 'Notif. a padre enviada' },
];
const DOT_C = {
  verde: { dot: '#22c55e', bg: 'rgba(34,197,94,.08)', txt: '#4ade80', border: 'rgba(34,197,94,.2)' },
  amarillo: { dot: '#f59e0b', bg: 'rgba(245,158,11,.08)', txt: '#fbbf24', border: 'rgba(245,158,11,.2)' },
  rojo: { dot: '#ef4444', bg: 'rgba(239,68,68,.08)', txt: '#f87171', border: 'rgba(239,68,68,.22)' },
};

function SemaforoCard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3200);
    return () => clearInterval(t);
  }, []);

  const liveAlumno = tick % 3;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 20, overflow: 'hidden',
      boxShadow: `0 12px 40px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.02)`,
    }}>
      {/* header */}
      <div style={{
        background: `linear-gradient(90deg, ${C.surface2} 0%, transparent 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.emerald, boxShadow: `0 0 8px ${C.emerald}` }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.indigo2 }}>Semáforo Académico — 3°B</span>
        </div>
        <span style={{ fontSize: 11, color: C.emerald, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>● En vivo</span>
      </div>

      {/* métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: `1px solid ${C.border}` }}>
        {[
          { l: 'Óptimo', v: 18, c: '#22c55e' },
          { l: 'En riesgo', v: 7, c: '#f59e0b' },
          { l: 'Alerta', v: 3, c: '#ef4444' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '16px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: m.c, lineHeight: 1 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* filas */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ALUMNOS.map((a, i) => {
          const c = DOT_C[a.estado];
          const isLive = i === liveAlumno;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12,
              background: c.bg, border: `1px solid ${c.border}`,
              transition: 'border-color .4s',
              boxShadow: isLive ? `0 0 0 1px ${c.dot}44` : 'none',
            }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50%', background: c.dot, flexShrink: 0,
                boxShadow: `0 0 ${isLive ? '8px' : '0px'} ${c.dot}88`,
                transition: 'box-shadow .4s',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Asistencia {a.asist}% · Prom. {a.prom}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.txt, background: `${c.dot}18`, border: `1px solid ${c.border}`, padding: '2px 9px', borderRadius: 99, marginBottom: 2 }}>{a.badge}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{a.sub}</div>
              </div>
            </div>
          );
        })}
        <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 4 }}>
          Los padres en alerta reciben un WhatsApp automático al instante.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FEATURE CARD con glow-border en hover
══════════════════════════════════════════════ */
function FeatureCard({ icon: Icon, color, title, desc, accent = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: accent ? `linear-gradient(145deg, ${C.indigo}18 0%, ${C.surface2} 100%)` : C.surface,
        border: `1px solid ${hov ? color + '55' : C.border}`,
        borderRadius: 20,
        padding: 36,
        transition: 'border-color .3s, transform .3s, box-shadow .3s',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hov ? `0 16px 40px rgba(0,0,0,.06), 0 0 20px ${color}11` : '0 4px 12px rgba(0,0,0,.02)',
        cursor: 'default',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {hov && (
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 160, height: 160,
          background: `radial-gradient(circle, ${color}11 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 22,
        background: color + '18', border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .3s',
        transform: hov ? 'scale(1.1)' : 'scale(1)',
      }}>
        <Icon size={24} color={color} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════ */
const FAQS = [
  { q: '¿Funciona para colegios públicos y privados?', r: 'Sí. El módulo de finanzas se adapta: pensiones mensuales para privados, cuotas APAFA para públicos. El semáforo y comunicaciones son iguales en ambos casos.' },
  { q: '¿Cuánto tiempo toma la migración?', r: 'El proceso estándar es 48 horas hábiles. Nuestro equipo migra tus datos existentes sin costo adicional y te acompaña en cada paso.' },
  { q: '¿Los docentes necesitan capacitación especial?', r: 'No. La plataforma está diseñada para usarse desde el primer día. Ofrecemos un video tutorial de 15 minutos y soporte directo por WhatsApp.' },
  { q: '¿Los padres necesitan instalar una app?', r: 'No. Las notificaciones llegan a su WhatsApp habitual. El semáforo se consulta desde cualquier navegador sin descargar nada.' },
];

/* ══════════════════════════════════════════════
   LANDING PRINCIPAL
══════════════════════════════════════════════ */
export default function Landing() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', alumnos: '', colegio: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [heroVis, setHeroVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.nombre || !form.email) return;
    
    setEnviando(true);
    
    // Construir mensaje para WhatsApp
    const numeroDestino = '51928552590'; // Número de ventas
    const mensaje = `Hola, mi nombre es *${form.nombre}*.\n\n` +
      `Me interesa una demostración de AcademicScope para mi institución.\n` +
      `🏫 *Colegio:* ${form.colegio || 'No especificado'}\n` +
      `🎓 *N° Alumnos:* ${form.alumnos || 'No especificado'}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📞 *Teléfono:* ${form.telefono || 'No especificado'}`;
      
    const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje)}`;
    
    // Pequeño timeout para feedback visual en el botón
    setTimeout(() => {
      window.open(url, '_blank');
      setEnviado(true);
      setForm({ nombre: '', email: '', telefono: '', alumnos: '', colegio: '' });
      setEnviando(false);
      
      setTimeout(() => setEnviado(false), 6000);
    }, 600);
  };

  const hero = (delay, extra = {}) => ({
    opacity: heroVis ? 1 : 0,
    transform: heroVis ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity .8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    ...extra,
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        html { scroll-behavior: smooth; }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; }

        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: .8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 4px 20px rgba(37,99,235,.15); }
          50%      { box-shadow: 0 4px 30px rgba(37,99,235,.3); }
        }
        @keyframes border-spin {
          from { --angle: 0deg; }
          to   { --angle: 360deg; }
        }

        .nav-link {
          font-size: 14px; font-weight: 600; color: ${C.muted2};
          transition: color .2s; position: relative; padding-bottom: 2px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 1px; background: ${C.indigo}; transform: scaleX(0);
          transition: transform .25s; transform-origin: left;
        }
        .nav-link:hover { color: ${C.text}; }
        .nav-link:hover::after { transform: scaleX(1); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${C.indigo}; color: #fff;
          padding: 13px 26px; border-radius: 99px;
          font-size: 15px; font-weight: 700; border: none;
          position: relative; overflow: hidden;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 4px 14px rgba(37,99,235,.25);
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.2) 50%, transparent 100%);
          background-size: 200% 100%;
          opacity: 0; transition: opacity .3s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,99,235,.4); }
        .btn-primary:hover::before { opacity: 1; animation: shimmer 1s ease; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          background: transparent; color: ${C.muted2};
          padding: 12px 22px; border-radius: 99px;
          font-size: 14px; font-weight: 600;
          border: 1px solid ${C.border};
          transition: all .2s;
        }
        .btn-ghost:hover { border-color: ${C.indigo}; color: ${C.indigo2}; background: rgba(37,99,235,.04); }

        .input-field {
          width: 100%; padding: 13px 16px;
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 12px; font-size: 14px;
          font-family: inherit; color: ${C.text};
          outline: none; transition: border-color .2s, box-shadow .2s;
        }
        .input-field::placeholder { color: ${C.muted}; }
        .input-field:focus { border-color: ${C.indigo}; box-shadow: 0 0 0 4px rgba(37,99,235,.1); }

        .faq-btn {
          width: 100%; text-align: left; background: none; border: none;
          padding: 20px 0; font-size: 15px; font-weight: 600; color: ${C.text};
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; padding: 5px 14px;
          border-radius: 99px; letter-spacing: .05em; text-transform: uppercase;
          background: rgba(37,99,235,.08); border: 1px solid rgba(37,99,235,.2); color: ${C.indigo2};
        }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .grid-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 72px; align-items: center; }

        @media (max-width: 900px) {
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr 1fr !important; }
          .grid-hero { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 600px) {
          .grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ──────────── WHATSAPP ──────────── */}
      <a
        href="https://wa.me/51928552590?text=Hola%2C%20quiero%20info%20sobre%20AcademicScope"
        target="_blank" rel="noopener noreferrer"
        aria-label="WhatsApp"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 60,
          width: 52, height: 52, borderRadius: '50%',
          background: '#25d366', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,.45)',
          transition: 'transform .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <MessageCircle size={24} />
      </a>

      {/* ──────────── NAVBAR ──────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'all .35s',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: C.indigo, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: `0 4px 12px rgba(37,99,235,.3)`,
            }}>AS</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Academic<span style={{ color: C.indigo2 }}>Scope</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <a href="#soluciones" className="nav-link hide-mobile">Soluciones</a>
            <a href="#como-funciona" className="nav-link hide-mobile">Cómo funciona</a>
            <a href="#contacto" className="nav-link hide-mobile">Contacto</a>
            <Link to="/login" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              Acceso Clientes <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80, paddingBottom: 80 }}>

        {/* glow central */}
        <div style={{
          position: 'absolute', top: '20%', left: '25%',
          width: 800, height: 800,
          background: `radial-gradient(circle, rgba(37,99,235,.08) 0%, transparent 60%)`,
          pointerEvents: 'none', transform: 'translate(-50%,-50%)',
        }} />
        <div style={{
          position: 'absolute', top: '60%', right: '10%',
          width: 600, height: 600,
          background: `radial-gradient(circle, rgba(16,185,129,.05) 0%, transparent 60%)`,
          pointerEvents: 'none', transform: 'translate(-50%,-50%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1440, margin: '0 auto', padding: '0 40px', width: '100%' }}>
          <div className="grid-hero">
            {/* texto */}
            <div>
              <div style={hero(0, { marginBottom: 24 })}>
                <span className="tag-pill">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.emerald, display: 'inline-block', boxShadow: `0 0 8px ${C.emerald}` }} />
                  Software de Gestión Educativa
                </span>
              </div>

              <h1 style={{
                ...hero(120),
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(36px, 5vw, 60px)',
                fontWeight: 800, lineHeight: 1.06, letterSpacing: '-.03em',
                marginBottom: 24,
                color: C.indigo2,
              }}>
                El control total<br />
                de tu colegio,<br />
                <span style={{
                  color: C.indigo,
                }}>en una pantalla.</span>
              </h1>

              <p style={{ ...hero(240), fontSize: 17, color: C.muted, lineHeight: 1.75, marginBottom: 36, maxWidth: 460 }}>
                Finanzas inteligentes y un <strong style={{ color: C.indigo2, fontWeight: 700 }}>Semáforo Académico Preventivo</strong> que detecta en tiempo real qué alumno está en riesgo de desertar, antes de que sea tarde.
              </p>

              <div style={{ ...hero(340), display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                <a href="#contacto" className="btn-primary">
                  Agendar demostración <ArrowRight size={17} />
                </a>
                <a href="#soluciones" className="btn-ghost">
                  Ver módulos <ChevronDown size={15} />
                </a>
              </div>

              <div style={{ ...hero(440), display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {['Migración en 48 h', 'Soporte por WhatsApp', 'Sin contrato largo plazo'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, fontWeight: 500 }}>
                    <CheckCircle2 size={14} color={C.emerald} /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* semáforo flotante */}
            <div className="hide-mobile" style={{
              ...hero(200),
              animation: heroVis ? 'float 6s ease-in-out infinite' : 'none',
              animationDelay: '1s',
            }}>
              <SemaforoCard />
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: scrolled ? 0 : .5, transition: 'opacity .4s',
        }}>
          <span style={{ fontSize: 11, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={16} color={C.muted} style={{ animation: 'float 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ──────────── STATS ──────────── */}
      <section style={{ padding: '90px 40px', background: '#F8FAFC', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <Reveal>
            <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: C.muted2, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 56 }}>
              Impacto comprobado frente a la gestión manual
            </p>
          </Reveal>
          <div className="grid-3">
            {[
              { icon: TrendingDown, color: C.emerald, val: 60, suf: '%', pre: '-', label: 'Menos morosidad', sub: 'vs. control manual' },
              { icon: AlertTriangle, color: C.amber, val: 3, suf: 'x', pre: '', label: 'Más rápido detectar deserción', sub: 'vs. reportes mensuales' },
              { icon: Clock, color: C.indigo2, val: 48, suf: 'h', pre: '', label: 'Para estar operativo', sub: 'incluye migración' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{
                  background: `linear-gradient(180deg, #ffffff 0%, ${s.color}08 100%)`, 
                  border: `1px solid ${s.color}20`,
                  borderTop: `4px solid ${s.color}`,
                  borderRadius: 24, padding: '40px 24px', textAlign: 'center',
                  boxShadow: `0 12px 32px ${s.color}15`,
                  transition: 'transform .3s, box-shadow .3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${s.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}15`; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <s.icon size={26} color={s.color} />
                  </div>
                  <div style={{ fontSize: 46, fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <AnimCounter target={s.val} prefix={s.pre} suffix={s.suf} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '12px 0 6px' }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── FEATURES ──────────── */}
      <section id="soluciones" style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px' }}>
            <span className="tag-pill" style={{ marginBottom: 16, display: 'inline-flex' }}>Módulos principales</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 14, lineHeight: 1.1 }}>
              Todo lo que necesitas,<br />sin la complejidad.
            </h2>
            <p style={{ fontSize: 16, color: C.muted2, lineHeight: 1.7 }}>
              AcademicScope reemplaza cinco herramientas distintas. Un solo sistema para todo tu equipo directivo.
            </p>
          </Reveal>

          <div className="grid-2">
            {[
              { icon: Wallet, color: C.indigo2, title: 'Finanzas mixtas inteligentes', desc: '¿Colegio público o privado? El sistema se adapta. Gestiona pensiones mensuales con control de morosidad, o cuotas únicas APAFA, con un solo clic.' },
              { icon: BarChart3, color: C.emerald, title: 'Semáforo Preventivo Exclusivo', desc: 'Nuestro algoritmo convierte notas y asistencia en colores visuales. Los padres reciben una alerta en WhatsApp si su hijo entra en rojo, antes de que sea tarde.', accent: true },
              { icon: BellRing, color: '#f43f5e', title: 'Centro de comunicaciones', desc: 'Despídete de los grupos de WhatsApp y las circulares impresas. Envía notificaciones masivas a grados específicos con niveles de urgencia.' },
              { icon: Users, color: C.amber, title: 'Matrículas masivas con wizard', desc: 'Matricula 500 alumnos a inicio de año en minutos. Nuestro asistente paso a paso asigna aulas completas en menos de 3 clics.' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <FeatureCard {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CTA INTERMEDIO ──────────── */}
      <section style={{ padding: '0 40px 96px' }}>
        <Reveal>
          <div style={{
            maxWidth: 1440, margin: '0 auto',
            background: `linear-gradient(135deg, ${C.indigo2} 0%, ${C.indigo} 100%)`,
            borderRadius: 24, padding: '56px 60px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
            position: 'relative', overflow: 'hidden',
            boxShadow: `0 24px 60px rgba(30,58,138,.15)`,
          }}>
            {/* fondo decorativo */}
            <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, background: 'rgba(255,255,255,.06)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, right: -40, width: 280, height: 280, background: 'rgba(255,255,255,.04)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>¿Ya convencido?</p>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#fff', letterSpacing: '-.02em', marginBottom: 8 }}>
                Agenda una demo sin compromiso.
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.9)' }}>
                30 minutos, personalizada para tu institución. Cero presión de venta.
              </p>
            </div>
            <a href="#contacto" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: C.indigo2,
              padding: '15px 30px', borderRadius: 99,
              fontSize: 15, fontWeight: 800, flexShrink: 0,
              transition: 'transform .2s, box-shadow .2s',
              boxShadow: '0 4px 14px rgba(0,0,0,.15)',
              position: 'relative', zIndex: 1,
              textDecoration: 'none'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.15)'; }}
            >
              Agendar ahora <ArrowRight size={17} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* ──────────── CÓMO FUNCIONA ──────────── */}
      <section id="como-funciona" style={{ padding: '80px 40px 100px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="grid-2" style={{ gap: 80, alignItems: 'start' }}>
            <div>
              <Reveal>
                <span className="tag-pill" style={{ marginBottom: 20, display: 'inline-flex' }}>Flujo de uso</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 48, lineHeight: 1.1 }}>
                  Un sistema para todo<br />tu ecosistema.
                </h2>
              </Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { titulo: 'Administración central', desc: 'Abre el año, configura grados y matricula en bloque desde un panel unificado.' },
                  { titulo: 'Docentes empoderados', desc: 'Ingresan notas y asistencia desde celular o laptop, sin capacitación extensa.' },
                  { titulo: 'Padres informados', desc: 'Consultan el semáforo de sus hijos en tiempo real y reciben comunicados oficiales.' },
                ].map((p, i) => (
                  <Reveal key={i} delay={i * 120}>
                    <div style={{ display: 'flex', gap: 20, paddingBottom: i < 2 ? 32 : 0, borderLeft: i < 2 ? `1px solid ${C.border}` : 'none', marginLeft: 19, paddingLeft: 28, position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: -19, top: 0,
                        width: 38, height: 38, borderRadius: '50%',
                        background: C.surface, border: `1px solid ${C.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: C.indigo2,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>{String(i + 1).padStart(2, '0')}</div>
                      <div style={{ paddingTop: 6 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{p.titulo}</h4>
                        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{p.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={100}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36, boxShadow: `0 12px 40px rgba(0,0,0,.04)` }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 28 }}>¿Por qué elegirnos?</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    { icon: Zap, color: C.amber, txt: 'Migración rápida sin costo adicional' },
                    { icon: ShieldCheck, color: C.indigo2, txt: 'Soporte directo por WhatsApp, sin tickets' },
                    { icon: BarChart3, color: C.emerald, txt: 'Reportes gerenciales exportables a Excel' },
                    { icon: GraduationCap, color: '#f43f5e', txt: 'Diseñado para la realidad del sistema educativo peruano' },
                  ].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: item.color + '15', border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={18} color={item.color} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>{item.txt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ──────────── FAQ ──────────── */}
      <section style={{ padding: '80px 40px 100px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="tag-pill" style={{ marginBottom: 16, display: 'inline-flex' }}>Preguntas frecuentes</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: '-.02em' }}>Dudas comunes</h2>
          </Reveal>
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div style={{ borderBottom: `1px solid ${C.border}` }}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <ChevronDown size={17} color={C.muted} style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .25s' }} />
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: 14, color: C.muted2, lineHeight: 1.75, paddingBottom: 18 }}>{f.r}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────── FORMULARIO ──────────── */}
      <section id="contacto" style={{ padding: '80px 40px 100px', borderTop: `1px solid ${C.border}`, background: C.surface, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, background: `radial-gradient(circle, ${C.indigo}0a 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 400, height: 400, background: `radial-gradient(circle, ${C.emerald}08 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1440, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="grid-2" style={{ gap: 72, alignItems: 'center' }}>
            <Reveal>
              <span className="tag-pill" style={{ marginBottom: 20, display: 'inline-flex' }}>Habla con nosotros</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: 20, lineHeight: 1.1 }}>
                ¿Listo para modernizar<br />tu institución?
              </h2>
              <p style={{ fontSize: 16, color: C.muted2, lineHeight: 1.7, marginBottom: 36 }}>
                Déjanos tus datos y te contactamos en menos de 24 horas para una demostración personalizada, sin compromiso.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={20} color={C.emerald} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Llámanos</div>
                  <div style={{ fontSize: 16, color: C.text, fontWeight: 700 }}>(01) 999 9999</div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36, boxShadow: `0 24px 80px rgba(0,0,0,.06)` }}>
                {enviado ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 0 30px ${C.emerald}44` }}>
                      <CheckCircle2 size={28} color={C.emerald} />
                    </div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>¡Mensaje enviado!</h3>
                    <p style={{ fontSize: 14, color: C.muted }}>Te contactamos en menos de 24 horas.</p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 24 }}>Solicitar información</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { key: 'nombre', label: 'Nombre completo *', type: 'text', ph: 'Ej: Juan Pérez', req: true },
                        { key: 'email', label: 'Correo electrónico *', type: 'email', ph: 'Ej: juan@colegio.edu.pe', req: true },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{f.label}</label>
                          <input className="input-field" type={f.type} placeholder={f.ph} required={f.req}
                            value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                        </div>
                      ))}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Teléfono</label>
                          <input className="input-field" type="tel" placeholder="987 654 321"
                            value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>N° de alumnos</label>
                          <input className="input-field" type="number" placeholder="Ej: 350"
                            value={form.alumnos} onChange={e => setForm(p => ({ ...p, alumnos: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Nombre del colegio</label>
                        <input className="input-field" type="text" placeholder="Ej: I.E.P. San José"
                          value={form.colegio} onChange={e => setForm(p => ({ ...p, colegio: e.target.value }))} />
                      </div>
                      <button type="submit" disabled={enviando} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '14px', borderRadius: 12, marginTop: 4,
                        background: enviando ? C.muted : C.indigo, color: '#fff',
                        fontSize: 15, fontWeight: 700, border: 'none',
                        boxShadow: enviando ? 'none' : `0 4px 14px rgba(37,99,235,.25)`,
                        transition: 'all .2s', cursor: enviando ? 'not-allowed' : 'pointer',
                      }}>
                        {enviando ? 'Enviando...' : 'Enviar solicitud'} <Send size={15} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer style={{ background: C.indigo2, padding: '56px 40px 28px', borderTop: `1px solid ${C.indigo2}` }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="grid-hero">
            <div>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: '#ffffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.indigo2, fontWeight: 900, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: `0 4px 12px rgba(0,0,0,.15)` }}>AS</div>
                <span style={{ fontWeight: 800, fontSize: 17, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#ffffff' }}>Academic<span style={{ color: '#93c5fd' }}>Scope</span></span>
              </Link>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, maxWidth: 280 }}>
                Software SaaS de gestión académica y financiera para instituciones educativas en Perú.
              </p>
            </div>
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.9)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.07em' }}>Plataforma</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['#soluciones', 'Soluciones'], ['#como-funciona', 'Cómo funciona'], ['#contacto', 'Contacto']].map(([h, t]) => (
                  <li key={t}><a href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', transition: 'color .2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}>{t}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.9)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.07em' }}>Contacto</h5>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="https://wa.me/51928552590" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: 'rgba(255,255,255,.6)', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}>
                  <MessageCircle size={13} /> WhatsApp</a></li>
                <li><a href="#contacto" style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}>Formulario web</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: `1px solid rgba(255,255,255,.1)`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>© {new Date().getFullYear()} AcademicScope. Todos los derechos reservados.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Hecho con tecnología de vanguardia en Perú 🇵🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
