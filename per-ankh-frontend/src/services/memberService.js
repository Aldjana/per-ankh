import api from "./api";

const normalizeMembers = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getWorkspaceMembers = async (workspaceId) => {
  const response = await api.get(`/members/workspace/${workspaceId}`);
  return normalizeMembers(response.data);
};

export const addWorkspaceMember = async (payload) => {
  const response = await api.post("/members", payload);
  return response.data;
};

export const updateMemberRole = async (memberId, role) => {
  const response = await api.patch(`/members/${memberId}/role`, { role });
  return response.data;
};

export const removeWorkspaceMember = async (memberId) => {
  const response = await api.delete(`/members/${memberId}`);
  return response.data;
};
