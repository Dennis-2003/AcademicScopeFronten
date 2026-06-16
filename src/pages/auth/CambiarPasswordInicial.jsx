import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap');

.as-cp-root *, .as-cp-root *::before, .as-cp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

.as-cp-root {
  --bg-color: #F8FAFC;
  --panel-bg: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --input-bg: #F1F5F9;
  --error-bg: #FEF2F2;
  --error-text: #DC2626;

  font-family: 'Inter', sans-serif;
  background: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.as-cp-container {
  background: var(--panel-bg);
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.as-cp-title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
  color: var(--text-main);
}

.as-cp-sub {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 32px;
}

.as-form-group {
  margin-bottom: 24px;
}

.as-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
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
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  margin-top: 12px;
}

.as-btn-submit:hover:not(:disabled) { 
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
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
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(220, 38, 38, 0.2);
}
`;

export default function CambiarPasswordInicial() {
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, cambiarPassword, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const styleRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('as-cp-styles')) {
      const tag = document.createElement('style');
      tag.id = 'as-cp-styles';
      tag.innerHTML = styles;
      document.head.appendChild(tag);
      styleRef.current = tag;
    }
    return () => { document.getElementById('as-cp-styles')?.remove(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordNuevo !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (passwordNuevo.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const authItem = sessionStorage.getItem('auth');
      const auth = authItem ? JSON.parse(authItem) : null;
      const passwordActual = auth ? auth.password : user?.dni;
      
      await cambiarPassword(passwordActual, passwordNuevo);
      updateUser({ primerIngreso: false });
      navigate('/dashboard');
    } catch (err) {
      setError('Hubo un error al cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="as-cp-root">
      <div className="as-cp-container">
        <h1 className="as-cp-title">Actualiza tu contraseña</h1>
        <p className="as-cp-sub">
          Hola <strong>{user?.nombre}</strong>, por motivos de seguridad es obligatorio que cambies tu contraseña antes de continuar.
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
            <label className="as-label">Nueva Contraseña</label>
            <input 
              type="password" 
              className="as-input"
              placeholder="Ingresa una nueva contraseña segura" 
              value={passwordNuevo}
              onChange={e => setPasswordNuevo(e.target.value)} 
              required 
            />
          </div>
          
          <div className="as-form-group">
            <label className="as-label">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="as-input"
              placeholder="Vuelve a ingresar la contraseña" 
              value={confirmarPassword}
              onChange={e => setConfirmarPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="as-btn-submit">
            {loading ? 'Guardando...' : 'Cambiar y Continuar'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={logout} 
            style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: '500', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>
            Cancelar y cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
