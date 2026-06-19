import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { useBoardData } from "../../hooks/useBoardData";

export default function BoardProgressTab() {
  const { workspaceId } = useOutletContext();
  const { columns, tasks, loading } = useBoardData(workspaceId);

  const stats = useMemo(() => {
    return columns.map((col) => {
      const count = tasks.filter((t) => t.column_id === col.id).length;
      const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
      return { ...col, count, pct };
    });
  }, [columns, tasks]);

  const doneCount = stats.find((s) =>
    (s.title || "").toLowerCase().includes("termin")
  )?.count || 0;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <FiLoader className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5 max-w-3xl">
      <div className="card p-6 text-center">
        <p className="text-sm font-bold text-slate-500">Progression globale</p>
        <p className="text-5xl font-black text-blue-600 mt-2">{progress}%</p>
        <p className="text-sm text-slate-400 mt-2">
          {doneCount} / {tasks.length} tâches terminées
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <p className="font-bold text-slate-900">Par colonne</p>
        {stats.map((s) => (
          <div key={s.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-slate-700">{s.title}</span>
              <span className="text-slate-500">{s.count}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full transition-all"
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
