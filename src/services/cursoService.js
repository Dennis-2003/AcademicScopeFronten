import api from './api';

export const obtenerCursosPorDocente = async (docenteId) => {
  const response = await api.get(`/cursos/docente/${docenteId}`);
  return response.data;
};
