import { useOutletContext } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { useBoardData } from "../../hooks/useBoardData";

export default function BoardTimelineTab() {
  const { workspaceId } = useOutletContext();
  const { tasks, loading, columnTitle } = useBoardData(workspaceId);

  const sorted = [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <FiLoader className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-3xl">
      {sorted.length === 0 ? (
        <p className="text-slate-400 text-center py-12">Aucune tâche planifiée.</p>
      ) : (
        sorted.map((task) => (
          <div key={task.id} className="card p-4 flex gap-4 items-start">
            <div className="w-24 shrink-0 text-center">
              <p className="text-xs font-bold text-blue-600 uppercase">
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString("fr-FR", {
                      month: "short",
                    })
                  : "Sans date"}
              </p>
              <p className="text-2xl font-black text-slate-900">
                {task.due_date
                  ? new Date(task.due_date).getDate()
                  : "—"}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900">{task.title}</p>
              <p className="text-sm text-slate-500 mt-1">{columnTitle(task.column_id)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
