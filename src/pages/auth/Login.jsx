import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Loader2, Mail, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

.login-root {
  display: flex;
  flex-direction: row-reverse;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #ffffff;
}

/* Animations */
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes aurora-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes aurora-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 50px) scale(1.2); }
  66% { transform: translate(20px, -20px) scale(0.8); }
}

/* Form Panel */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.login-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.logo-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.5px;
  text-decoration: none;
}
.logo-accent {
  color: #2563EB;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #64748B;
  text-decoration: none;
  transition: color 0.2s;
}
.back-btn:hover { color: #0F172A; }

.login-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.stagger-1 { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
.stagger-2 { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
.stagger-3 { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
.stagger-4 { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

.title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.1;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.subtitle {
  color: #64748B;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 40px;
}

.input-group {
  margin-bottom: 20px;
}
.input-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 16px;
  color: #94A3B8;
  transition: color 0.2s;
}
.input-field {
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px 16px 14px 44px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #0F172A;
  transition: all 0.2s;
  outline: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.input-field::placeholder { color: #94A3B8; }
.input-field:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
.input-field:focus + .input-icon, .input-wrapper:focus-within .input-icon {
  color: #2563EB;
}

.pwd-toggle-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}
.pwd-toggle-btn:hover {
  color: #475569;
  background: #F1F5F9;
}

.submit-btn {
  width: 100%;
  background: #2563EB;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  margin-top: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  position: relative;
  overflow: hidden;
}
.submit-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s;
}
.submit-btn:hover:not(:disabled) {
  background: #1D4ED8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
}
.submit-btn:hover:not(:disabled)::after {
  transform: translateX(100%);
}
.submit-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.error-alert {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  animation: fade-in-up 0.3s ease-out;
}

/* Right Panel (Visuals) */
.login-right {
  flex: 1.2;
  background: #0F172A;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
@media (max-width: 992px) {
  .login-right { display: none; }
  .login-left { max-width: 100%; }
}

.aurora-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.aurora-1 {
  position: absolute;
  top: -10%; right: -10%; width: 60%; height: 60%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 60%);
  border-radius: 50%;
  filter: blur(60px);
  animation: aurora-1 15s ease-in-out infinite;
}
.aurora-2 {
  position: absolute;
  bottom: -10%; left: -10%; width: 60%; height: 60%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 60%);
  border-radius: 50%;
  filter: blur(60px);
  animation: aurora-2 15s ease-in-out infinite reverse;
}

.visual-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
}

.hero-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #FFFFFF;
  margin-bottom: 40px;
}
.hero-text h2 {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-bottom: 16px;
}
.hero-text h2 span {
  color: #3B82F6;
}
.hero-text p {
  font-size: 16px;
  color: #94A3B8;
  line-height: 1.6;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 24px 40px rgba(0,0,0,0.2);
  animation: float 6s ease-in-out infinite;
}

.glass-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.glass-title {
  color: #FFFFFF;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.pulse-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 0 rgba(16,185,129,0.7);
  animation: pulse-ring 2s infinite;
}
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}

.student-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.03);
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 12px;
  transition: background 0.3s;
}
.student-row:hover {
  background: rgba(255,255,255,0.06);
}
.student-avatar {
  width: 40px; height: 40px;
  border-radius: 50%; background: rgba(37,99,235,0.2);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #60A5FA; font-size: 14px;
}
.student-avatar.amber {
  background: rgba(245,158,11,0.2); color: #FBBF24;
}
.student-info { flex: 1; }
.student-name { color: #FFFFFF; font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.student-stat { color: #94A3B8; font-size: 12px; }
.status-badge {
  padding: 4px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 700;
  background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3);
}
.status-badge.warning {
  background: rgba(245,158,11,0.15); color: #FBBF24; border: 1px solid rgba(245,158,11,0.3);
}

`;

export default function Login() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById('as-login-new-styles')) {
      const tag = document.createElement('style');
      tag.id = 'as-login-new-styles';
      tag.innerHTML = styles;
      document.head.appendChild(tag);
    }
    return () => document.getElementById('as-login-new-styles')?.remove();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(dni, password);
      navigate('/dashboard');
    } catch {
      setError('DNI o contraseña incorrectos. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      
      {/* LEFT PANEL: FORM */}
      <div className="login-left">
        <nav className="login-nav">
          <Link to="/" className="logo-text">Academic<span className="logo-accent">Scope</span></Link>
          <Link to="/" className="back-btn"><ArrowLeft size={16}/> Volver al inicio</Link>
        </nav>

        <div className="login-form-container">
          <div className="stagger-1">
            <h1 className="title">Bienvenido de vuelta.</h1>
            <p className="subtitle">
              Ingresa tus credenciales para acceder a tu panel. Si es tu primera vez, tu contraseña es tu número de DNI.
            </p>
          </div>

          {error && (
            <div className="error-alert stagger-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group stagger-2">
              <label className="input-label">Correo o DNI</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="Ej. correo@ejemplo.com o 12345678" 
                  value={dni}
                  onChange={e => setDni(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div className="input-group stagger-3">
              <label className="input-label">Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field"
                  placeholder="Ingresa tu contraseña" 
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  style={{ paddingRight: '48px' }}
                />
                <button 
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="stagger-4">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: VISUALS */}
      <div className="login-right">
        <div className="aurora-bg">
          <div className="aurora-1"></div>
          <div className="aurora-2"></div>
        </div>

        <div className="visual-content">
          <div className="hero-text">
            <h2>El progreso de tu hijo, <span>en tiempo real.</span></h2>
            <p>Acompaña su desarrollo académico con la plataforma de gestión más avanzada. Notificaciones directas, reportes y semáforo preventivo.</p>
          </div>

          <div className="glass-card">
            <div className="glass-header">
              <div className="glass-title">
                <ShieldCheck size={18} className="text-emerald-400" />
                Semáforo Académico
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span className="pulse-dot"></span>
                <span style={{color: '#94A3B8', fontSize: '12px', fontWeight: 600}}>En vivo</span>
              </div>
            </div>

            <div className="student-row">
              <div className="student-avatar">AG</div>
              <div className="student-info">
                <div className="student-name">Ana García</div>
                <div className="student-stat">Asistencia 97% • Promedio 16.4</div>
              </div>
              <div className="status-badge">Óptimo</div>
            </div>

            <div className="student-row" style={{marginBottom: 0}}>
              <div className="student-avatar amber">CM</div>
              <div className="student-info">
                <div className="student-name">Carlos Mendoza</div>
                <div className="student-stat">Asistencia 76% • Promedio 12.1</div>
              </div>
              <div className="status-badge warning">En riesgo</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
