import api from "./api";

const normalizeArray = (responseData, possibleKeys = []) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(responseData?.[key])) {
      return responseData[key];
    }
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

const getRealWorkspace = (workspace) => {
  if (!workspace) return {};

  return (
    workspace.workspace ||
    workspace.data ||
    workspace.workspaces ||
    workspace.item ||
    workspace
  );
};

const getWorkspaceId = (workspace) => {
  const item = getRealWorkspace(workspace);

  return (
    item?.id ||
    item?.workspace_id ||
    item?.workspaceId ||
    item?.uuid ||
    workspace?.id ||
    workspace?.workspace_id ||
    workspace?.workspaceId ||
    ""
  );
};

export const getDashboardData = async () => {
  const workspacesResponse = await api.get("/workspaces");

  const workspaces = normalizeArray(workspacesResponse.data, [
    "workspaces",
    "workspace",
  ]);

  const taskRequests = workspaces.map((workspace) => {
    const workspaceId = getWorkspaceId(workspace);

    if (!workspaceId) {
      return Promise.resolve([]);
    }

    return api
      .get(`/tasks/workspace/${workspaceId}`)
      .then((response) =>
        normalizeArray(response.data, ["tasks", "taches"])
      )
      .catch((error) => {
        console.log(
          "Erreur récupération tâches workspace :",
          workspaceId,
          error.response?.data || error.message
        );

        return [];
      });
  });

  const taskResults = await Promise.all(taskRequests);

  const tasks = taskResults.flat();

  let notes = [];
  let members = [];

  try {
    const membersResponse = await api.get("/members");
    members = normalizeArray(membersResponse.data, [
      "members",
      "workspace_members",
      "workspaceMembers",
    ]);
  } catch (error) {
    console.log("Route members non disponible :", error.response?.data || error.message);
  }

  try {
    const notesResponse = await api.get("/notes");
    notes = normalizeArray(notesResponse.data, ["notes"]);
  } catch (error) {
    console.log("Route notes non disponible :", error.response?.data || error.message);
  }

 

  return {
    workspaces,
    tasks,
    notes,
    members,
  };
};