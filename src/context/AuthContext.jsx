import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (dni, password) => {
    const res = await api.get('/usuarios/me', { auth: { username: dni, password } });
    const loggedUser = res.data;
    sessionStorage.setItem('auth', JSON.stringify({ dni, password }));
    sessionStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const cambiarPassword = async (passwordActual, passwordNuevo) => {
    await api.put('/usuarios/cambiar-password', {
      dni: user.dni, passwordActual, passwordNuevo
    });
    const auth = JSON.parse(sessionStorage.getItem('auth'));
    auth.password = passwordNuevo;
    sessionStorage.setItem('auth', JSON.stringify(auth));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, cambiarPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
