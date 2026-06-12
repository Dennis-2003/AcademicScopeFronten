import api from './api';

export const crearRecurso = async (recurso) => {
  const response = await api.post('/recursos', recurso);
  return response.data;
};

export const obtenerRecursosPorCurso = async (cursoId) => {
  const response = await api.get(`/recursos/curso/${cursoId}`);
  return response.data;
};

export const eliminarRecurso = async (id) => {
  const response = await api.delete(`/recursos/${id}`);
  return response.data;
};
