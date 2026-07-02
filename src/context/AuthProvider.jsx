import { useState } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    let dni = username;

    if (username.includes('@')) {
      try {
        const userRes = await api.get(`/usuarios/by-email`, { params: { email: username } });
        dni = userRes.data.dni;
      } catch {
        dni = username;
      }
    }

    const res = await api.post('/auth/login', { username: dni, password });
    const loggedUser = res.data;
    sessionStorage.setItem('token', loggedUser.token);
    sessionStorage.setItem('auth', JSON.stringify({ dni, password }));
    sessionStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
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

  const updateUser = (updatedData) => {
    const newData = { ...user, ...updatedData };
    setUser(newData);
    sessionStorage.setItem('user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, cambiarPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
