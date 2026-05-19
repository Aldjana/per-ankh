import api from "./api";

export const getColumnsByWorkspace = async (workspaceId) => {
  const response = await api.get(`/columns/workspace/${workspaceId}`);

  console.log("REPONSE GET COLUMNS BY WORKSPACE :", response.data);

  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data.columns)) return response.data.columns;
  if (Array.isArray(response.data.kanban_columns)) return response.data.kanban_columns;
  if (Array.isArray(response.data.data)) return response.data.data;

  return [];
};

export const createColumn = async (columnData) => {
  const response = await api.post("/columns", columnData);
  return response.data;
};

export const updateColumn = async (id, columnData) => {
  const response = await api.put(`/columns/${id}`, columnData);
  return response.data;
};

export const deleteColumn = async (id) => {
  const response = await api.delete(`/columns/${id}`);
  return response.data;
};