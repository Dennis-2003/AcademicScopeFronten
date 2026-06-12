import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;700;800&family=Syne+Mono&display=swap');

.as-root-login *, .as-root-login *::before, .as-root-login *::after { box-sizing: border-box; margin: 0; padding: 0; }

.as-root-login {
  --ink: #08080A;
  --w: #FAFAF7;
  --accent: #C8FF00;
  --r: #FF3131;
  --b: #1400FF;
  --g1: #EAEAE5;
  --g2: #BFBFB8;
  --g3: #7A7A73;
  --border: 1px solid rgba(8,8,10,0.12);
  font-family: 'Syne', sans-serif;
  background: var(--w);
  color: var(--ink);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.as-login-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 40px;
  border-bottom: var(--border);
  background: var(--w);
}

.as-login-wordmark {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: 2px;
  color: var(--ink);
  line-height: 1;
  text-decoration: none;
}

.as-back-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--g3);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}
.as-back-link:hover { color: var(--ink); }

.as-login-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.as-login-l {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: var(--border);
}

.as-login-r {
  background: var(--ink);
  color: var(--w);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.as-login-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 80px;
  line-height: 0.9;
  margin-bottom: 16px;
}
.as-login-title span { color: var(--b); }

.as-login-sub {
  font-size: 14px;
  color: var(--g3);
  line-height: 1.6;
  max-width: 320px;
  margin-bottom: 40px;
}

.as-form-group {
  margin-bottom: 24px;
  max-width: 360px;
}

.as-label {
  display: block;
  font-family: 'Syne Mono', monospace;
  font-size: 11px;
  color: var(--g3);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.as-input {
  width: 100%;
  background: none;
  border: none;
  border-bottom: 2px solid var(--g2);
  padding: 12px 0;
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s;
}
.as-input::placeholder { color: var(--g2); font-weight: 400; }
.as-input:focus { border-color: var(--ink); }

.as-btn-submit {
  background: var(--ink);
  color: var(--w);
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  border: none;
  padding: 16px 32px;
  cursor: pointer;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-top: 16px;
  transition: transform 0.1s;
}
.as-btn-submit:active { transform: scale(0.98); }
.as-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.as-alert {
  background: var(--r);
  color: var(--w);
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 24px;
  max-width: 360px;
}

.as-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8,8,10,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.as-modal {
  background: var(--w);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--g2);
}

.as-modal h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 40px;
  line-height: 1;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .as-login-main { grid-template-columns: 1fr; }
  .as-login-r { display: none; }
  .as-login-l { border-right: none; padding: 40px 20px; }
  .as-login-title { font-size: 60px; }
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
      const user = await login(dni, password);
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
          <h1 className="as-login-title">
            Iniciar<br/><span>Sesión</span>
          </h1>
          <p className="as-login-sub">
            Ingresa tu DNI y contraseña para acceder a tu panel de AcademicScope. Si es tu primera vez, tu contraseña es tu DNI.
          </p>

          {error && <div className="as-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="as-form-group">
              <label className="as-label">Número de DNI</label>
              <input 
                type="text" 
                className="as-input"
                placeholder="Ej. 12345678" 
                value={dni}
                onChange={e => setDni(e.target.value)} 
                required 
              />
            </div>
            
            <div className="as-form-group">
              <label className="as-label">Contraseña</label>
              <input 
                type="password" 
                className="as-input"
                placeholder="Ingresa tu contraseña" 
                value={password}
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" disabled={loading} className="as-btn-submit">
              {loading ? 'Ingresando...' : 'Entrar ahora →'}
            </button>
          </form>
        </div>

        <div className="as-login-r">
          <div style={{fontFamily: 'Bebas Neue', fontSize: '100px', lineHeight: 0.9, color: 'var(--accent)', marginBottom: '24px'}}>
            TU HIJO.<br/>SU PROGRESO.
          </div>
          <div style={{fontFamily: 'Syne Mono', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px'}}>
            Sistema Activo — Cajamarca, Perú
          </div>
        </div>
      </main>

    </div>
  );
}
