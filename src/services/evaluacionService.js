import api from './api';

export const obtenerEvaluacionesPorCurso = async (cursoId) => {
  const response = await api.get(`/evaluaciones/curso/${cursoId}`);
  return response.data;
};
