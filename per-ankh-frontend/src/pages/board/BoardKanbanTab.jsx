import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import KanbanBoard from "../../components/board/KanbanBoard";
import { getColumnsByWorkspace } from "../../services/columnService";
import { getTasksByWorkspace } from "../../services/taskService";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { isSupabaseConfigured } from "../../services/supabaseClient";

export default function BoardKanbanTab() {
  const { workspaceId } = useOutletContext();
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBoard = useCallback(async () => {
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
    loadBoard();
  }, [loadBoard]);

  useRealtimeRefresh({
    channelName: `kanban-${workspaceId}`,
    table: "tasks",
    filter: `workspace_id=eq.${workspaceId}`,
    enabled: Boolean(workspaceId) && isSupabaseConfigured(),
    onRefresh: loadBoard,
  });

  return (
    <KanbanBoard
      workspaceId={workspaceId}
      columns={columns}
      tasks={tasks}
      loading={loading}
      onRefresh={loadBoard}
    />
  );
}
