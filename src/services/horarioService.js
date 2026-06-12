import api from './api';

export const crearHorario = async (horario) => {
  const response = await api.post('/horarios', horario);
  return response.data;
};

export const obtenerHorariosPorCurso = async (cursoId) => {
  const response = await api.get(`/horarios/curso/${cursoId}`);
  return response.data;
};

export const eliminarHorario = async (id) => {
  const response = await api.delete(`/horarios/${id}`);
  return response.data;
};
