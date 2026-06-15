import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import KanbanBoard from "../../components/board/KanbanBoard";
import { getColumnsByWorkspace } from "../../services/columnService";
import { getTasksByWorkspace } from "../../services/taskService";
import { getFilesByTask } from "../../services/fileService";
import { getNotesByWorkspace } from "../../services/noteService";
import { useRealtimeRefresh } from "../../hooks/useRealtimeRefresh";
import { isSupabaseConfigured } from "../../services/supabaseClient";

export default function BoardKanbanTab() {
  const { workspaceId } = useOutletContext();
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBoard = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const [cols, tks, noteList] = await Promise.all([
        getColumnsByWorkspace(workspaceId),
        getTasksByWorkspace(workspaceId),
        getNotesByWorkspace(workspaceId).catch(() => []),
      ]);
      
      // Charger les fichiers pour chaque tâche
      const tasksWithFiles = await Promise.all(
        (Array.isArray(tks) ? tks : []).map(async (task) => {
          try {
            const files = await getFilesByTask(task.id);
            return { ...task, files: Array.isArray(files) ? files : [] };
          } catch {
            return { ...task, files: [] };
          }
        })
      );
      
      setColumns(
        (Array.isArray(cols) ? cols : []).sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        )
      );
      setTasks(Array.isArray(tasksWithFiles) ? tasksWithFiles : []);
      setNotes(Array.isArray(noteList) ? noteList : []);
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
      notes={notes}
      loading={loading}
      onRefresh={loadBoard}
    />
  );
}
