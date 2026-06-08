import api from "./api";

export const searchTasks = async (params) => {
  const response = await api.get("/search/tasks", { params });
  if (Array.isArray(response.data?.tasks)) return response.data.tasks;
  if (Array.isArray(response.data)) return response.data;
  return [];
};
