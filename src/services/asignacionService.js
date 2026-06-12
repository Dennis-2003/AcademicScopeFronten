import api from './api';

export const crearAsignacion = async (asignacion) => {
  const response = await api.post('/asignaciones', asignacion);
  return response.data;
};

export const obtenerAsignacionesPorCurso = async (cursoId) => {
  const response = await api.get(`/asignaciones/curso/${cursoId}`);
  return response.data;
};

export const obtenerEntregasPorAsignacion = async (asignacionId) => {
  const response = await api.get(`/asignaciones/${asignacionId}/entregas`);
  return response.data;
};
