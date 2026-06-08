import api from "./api";

const normalizeFiles = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.files)) return data.files;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const uploadFile = async (formData) => {
  const response = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getFilesByTask = async (taskId) => {
  const response = await api.get(`/files/task/${taskId}`);
  return normalizeFiles(response.data);
};

export const getFilesByNote = async (noteId) => {
  const response = await api.get(`/files/note/${noteId}`);
  return normalizeFiles(response.data);
};

export const deleteFile = async (id) => {
  const response = await api.delete(`/files/${id}`);
  return response.data;
};
