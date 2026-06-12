import api from './api';

export const obtenerMatriculasPorCurso = async (cursoId) => {
  const response = await api.get(`/matriculas/curso/${cursoId}`);
  return response.data;
};
