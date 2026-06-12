import api from './api';

export const obtenerCalificacionesPorEvaluacion = async (evaluacionId) => {
  const response = await api.get(`/calificaciones/evaluacion/${evaluacionId}`);
  return response.data;
};

export const registrarCalificacion = async (calificacion) => {
  const response = await api.post('/calificaciones', calificacion);
  return response.data;
};

export const actualizarCalificacion = async (id, calificacion) => {
  const response = await api.put(`/calificaciones/${id}`, calificacion);
  return response.data;
};
