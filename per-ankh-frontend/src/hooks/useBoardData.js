import { useCallback, useEffect, useState } from "react";
import { getColumnsByWorkspace } from "../services/columnService";
import { getTasksByWorkspace } from "../services/taskService";

export function useBoardData(workspaceId) {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const [cols, tks] = await Promise.all([
        getColumnsByWorkspace(workspaceId),
        getTasksByWorkspace(workspaceId),
      ]);
      setColumns(
        (Array.isArray(cols) ? cols : []).sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        )
      );
      setTasks(Array.isArray(tks) ? tks : []);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const columnTitle = (columnId) =>
    columns.find((c) => c.id === columnId)?.title || "—";

  return { columns, tasks, loading, reload: load, columnTitle };
}
