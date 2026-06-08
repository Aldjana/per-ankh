import api from "./api";

const normalizeNotes = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notes)) return data.notes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getNotesByWorkspace = async (workspaceId) => {
  const response = await api.get(`/notes/workspace/${workspaceId}`);
  return normalizeNotes(response.data);
};

export const getNoteById = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return response.data?.note || response.data;
};

export const createNote = async (noteData) => {
  const response = await api.post("/notes", noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.put(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};
