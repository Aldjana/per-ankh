import api from "./api";

export const getTasksByWorkspace = async (workspaceId) => {
  const response = await api.get(`/tasks/workspace/${workspaceId}`);

  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data.tasks)) return response.data.tasks;
  if (Array.isArray(response.data.taches)) return response.data.taches;
  if (Array.isArray(response.data.data)) return response.data.data;

  return [];
};

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const moveTask = async (id, moveData) => {
  const response = await api.patch(`/tasks/${id}/move`, moveData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};