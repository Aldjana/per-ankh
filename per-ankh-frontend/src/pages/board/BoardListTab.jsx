import { useOutletContext } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { useBoardData } from "../../hooks/useBoardData";

const priorityLabel = { high: "P1", medium: "P2", low: "P3" };
const priorityClass = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default function BoardListTab() {
  const { workspaceId } = useOutletContext();
  const { tasks, loading, columnTitle } = useBoardData(workspaceId);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <FiLoader className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Tâche</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Colonne</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Priorité</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Échéance</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Assigné</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                Aucune tâche pour le moment.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                <td className="px-4 py-3 font-semibold text-slate-900">{task.title}</td>
                <td className="px-4 py-3 text-slate-600">{columnTitle(task.column_id)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      priorityClass[task.priority] || priorityClass.medium
                    }`}
                  >
                    {priorityLabel[task.priority] || "P2"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {task.assigned_to_profile?.full_name || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
