import api from "./api";

const normalizeComments = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getCommentsByNote = async (noteId) => {
  const response = await api.get(`/comments/note/${noteId}`);
  return normalizeComments(response.data);
};

export const getCommentsByTask = async (taskId) => {
  const response = await api.get(`/comments/task/${taskId}`);
  return normalizeComments(response.data);
};

export const createComment = async (payload) => {
  const response = await api.post("/comments", payload);
  return response.data;
};

export const updateComment = async (id, payload) => {
  const response = await api.put(`/comments/${id}`, payload);
  return response.data;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};
