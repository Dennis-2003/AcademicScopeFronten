import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap');

.as-root-login *, .as-root-login *::before, .as-root-login *::after { box-sizing: border-box; margin: 0; padding: 0; }

.as-root-login {
  --bg-color: #F8FAFC;
  --panel-bg: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --border-color: #E2E8F0;
  --input-bg: #F1F5F9;
  --error-bg: #FEF2F2;
  --error-text: #DC2626;
  --dark-panel: #0F172A;
  --dark-text: #F8FAFC;
  --accent: #10B981;

  font-family: 'Inter', sans-serif;
  background: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.as-login-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.as-login-wordmark {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  text-decoration: none;
  letter-spacing: -0.5px;
}

.as-back-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.as-back-link:hover {
  color: var(--primary);
}

.as-login-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.as-login-l {
  padding: 80px 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--panel-bg);
  box-shadow: 20px 0 40px rgba(0,0,0,0.03);
  position: relative;
  z-index: 2;
}

.as-login-r {
  background: linear-gradient(135deg, var(--dark-panel) 0%, #1E293B 100%);
  color: var(--dark-text);
  padding: 80px 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
}

/* Decorative background elements on right panel */
.as-login-r::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(79,70,229,0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.as-login-r-content {
  position: relative;
  z-index: 1;
}

.as-login-title {
  font-family: 'Outfit', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.as-login-title span { 
  color: var(--primary); 
}

.as-login-sub {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 48px;
}

.as-form-group {
  margin-bottom: 24px;
  max-width: 400px;
}

.as-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.as-input-container {
  position: relative;
}

.as-input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--text-main);
  outline: none;
  transition: all 0.2s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.as-input::placeholder { 
  color: #94A3B8; 
}

.as-input:focus { 
  background: #FFFFFF;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.as-btn-submit {
  background: var(--primary);
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  cursor: pointer;
  margin-top: 8px;
  width: 100%;
  max-width: 400px;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.as-btn-submit:hover:not(:disabled) { 
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
}

.as-btn-submit:active:not(:disabled) { 
  transform: translateY(0);
}

.as-btn-submit:disabled { 
  opacity: 0.7; 
  cursor: not-allowed; 
}

.as-alert {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.as-r-title {
  font-family: 'Outfit', sans-serif;
  font-size: 64px;
  font-weight: 700;
  line-height: 1.1;
  color: #FFFFFF;
  margin-bottom: 24px;
  letter-spacing: -1.5px;
}

.as-r-title span {
  color: var(--accent);
}

.as-r-subtitle {
  font-size: 18px;
  color: #94A3B8;
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 48px;
}

.as-r-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #E2E8F0;
  backdrop-filter: blur(8px);
}

.as-pulse {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

@media (max-width: 992px) {
  .as-login-main { grid-template-columns: 1fr; }
  .as-login-r { display: none; }
  .as-login-l { padding: 40px 24px; justify-content: center; align-items: center; }
  .as-login-nav { position: relative; padding: 24px; justify-content: center; }
  .as-back-link { display: none; }
  .as-login-title, .as-login-sub, .as-form-group, .as-btn-submit, .as-alert { width: 100%; max-width: 100%; }
}
`;

export default function Login() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const styleRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('as-login-styles')) {
      const tag = document.createElement('style');
      tag.id = 'as-login-styles';
      tag.innerHTML = styles;
      document.head.appendChild(tag);
      styleRef.current = tag;
    }
    return () => { document.getElementById('as-login-styles')?.remove(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(dni, password);
      navigate('/dashboard');
    } catch {
      setError('DNI o contraseña incorrectos. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="as-root-login">
      <nav className="as-login-nav">
        <Link to="/" className="as-login-wordmark">AcademicScope</Link>
        <Link to="/" className="as-back-link">← Volver al inicio</Link>
      </nav>

      <main className="as-login-main">
        <div className="as-login-l">
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h1 className="as-login-title">
              Bienvenido de <br/><span>vuelta</span>
            </h1>
            <p className="as-login-sub">
              Ingresa tus credenciales para acceder a tu panel. Si es tu primera vez, tu contraseña es tu número de DNI.
            </p>

            {error && (
              <div className="as-alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="as-form-group">
                <label className="as-label">Correo o DNI</label>
                <div className="as-input-container">
                  <input 
                    type="text" 
                    className="as-input"
                    placeholder="Ej. correo@ejemplo.com o 12345678" 
                    value={dni}
                    onChange={e => setDni(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="as-form-group">
                <label className="as-label">Contraseña</label>
                <div className="as-input-container">
                  <input 
                    type="password" 
                    className="as-input"
                    placeholder="Ingresa tu contraseña" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="as-btn-submit">
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                {!loading && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="as-login-r">
          <div className="as-login-r-content">
            <h2 className="as-r-title">
              Tu hijo.<br/><span>Su progreso.</span>
            </h2>
            <p className="as-r-subtitle">
              Acompaña el desarrollo académico de tus hijos con la plataforma más avanzada para la gestión educativa. Todo en un solo lugar.
            </p>
            <div className="as-r-badge">
              <span className="as-pulse"></span>
              Sistema Activo — Cajamarca, Perú
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
