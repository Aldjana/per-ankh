import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { useBoardData } from "../../hooks/useBoardData";

export default function BoardCalendarTab() {
  const { workspaceId } = useOutletContext();
  const { tasks, loading } = useBoardData(workspaceId);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.due_date) return;
      const d = new Date(task.due_date);
      if (d.getMonth() !== month || d.getFullYear() !== year) return;
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(task);
    });
    return map;
  }, [tasks, month, year]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <FiLoader className="animate-spin text-3xl" />
      </div>
    );
  }

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = today.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card p-4 sm:p-6">
      <h3 className="font-black text-slate-900 capitalize mb-4">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`min-h-[72px] rounded-lg border p-1.5 text-left ${
              day === today.getDate()
                ? "border-blue-400 bg-blue-50/50"
                : "border-slate-100 bg-slate-50/50"
            }`}
          >
            {day && (
              <>
                <span className="text-xs font-bold text-slate-600">{day}</span>
                <div className="mt-1 space-y-0.5">
                  {(tasksByDay[day] || []).slice(0, 2).map((t) => (
                    <p
                      key={t.id}
                      className="text-[10px] font-semibold text-blue-700 truncate bg-blue-100 rounded px-1"
                    >
                      {t.title}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
