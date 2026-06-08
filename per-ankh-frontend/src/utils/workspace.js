/** Normalise une entrée API (workspace_members + workspaces imbriqué) */
export function unwrapWorkspace(entry) {
  if (!entry) return {};
  return entry.workspaces || entry.workspace || entry.data || entry;
}

export function getWorkspaceId(entry) {
  const w = unwrapWorkspace(entry);
  return w?.id || entry?.workspace_id || entry?.workspaceId || "";
}

export function getWorkspaceName(entry) {
  const w = unwrapWorkspace(entry);
  return w?.name || w?.title || w?.nom || "Sans nom";
}

export function getWorkspaceDescription(entry) {
  const w = unwrapWorkspace(entry);
  return w?.description || w?.desc || "";
}

export function getMemberRole(entry) {
  return entry?.role || "member";
}
