import api from './api';

export const registrarComportamiento = async (comportamiento) => {
  const response = await api.post('/comportamientos', comportamiento);
  return response.data;
};

export const obtenerComportamientosPorEstudiante = async (estudianteId) => {
  const response = await api.get(`/comportamientos/estudiante/${estudianteId}`);
  return response.data;
};
