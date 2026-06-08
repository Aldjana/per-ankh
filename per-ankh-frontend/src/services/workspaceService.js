import api from "./api";

export const getWorkspaceById = async (id) => {
  const response = await api.get(`/workspaces/${id}`);
  return response.data?.workspace || response.data;
};

export const getWorkspaces = async () => {
  const response = await api.get("/workspaces");

  console.log("REPONSE GET WORKSPACES :", response.data);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.workspaces)) {
    return response.data.workspaces;
  }

  if (Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data.workspace)) {
    return response.data.workspace;
  }

  if (response.data.workspace && typeof response.data.workspace === "object") {
    return [response.data.workspace];
  }

  return [];
};

export const createWorkspace = async (workspaceData) => {
  const response = await api.post("/workspaces", workspaceData);
  return response.data;
};

export const updateWorkspace = async (id, workspaceData) => {
  const response = await api.put(`/workspaces/${id}`, workspaceData);
  return response.data;
};

export const deleteWorkspace = async (id) => {
  const response = await api.delete(`/workspaces/${id}`);
  return response.data;
};