import api from './api';

export const crearAsignacion = async (asignacion) => {
  const response = await api.post('/asignaciones', asignacion);
  return response.data;
};

export const actualizarAsignacion = async (id, asignacion) => {
  const response = await api.put(`/asignaciones/${id}`, asignacion);
  return response.data;
};

export const eliminarAsignacion = async (id) => {
  const response = await api.delete(`/asignaciones/${id}`);
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
