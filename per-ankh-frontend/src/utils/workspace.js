
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

// export function getAvatarColor(identifier) {
//   const colors = [
//     "from-violet-400 to-violet-600",
//     "from-blue-400 to-blue-600",
//     "from-cyan-400 to-cyan-600",
//     "from-teal-400 to-teal-600",
//     "from-emerald-400 to-emerald-600",
//     "from-green-400 to-green-600",
//     "from-amber-400 to-amber-600",
//     "from-orange-400 to-orange-600",
//     "from-red-400 to-red-600",
//     "from-pink-400 to-pink-600",
//   ];

  let hash = 0;
  const str = String(identifier || "");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];

