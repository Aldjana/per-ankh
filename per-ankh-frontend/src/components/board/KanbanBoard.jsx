import { useState } from "react";
import { FiPlus, FiLoader, FiMessageCircle, FiThumbsUp } from "react-icons/fi";
import { createTask, moveTask } from "../../services/taskService";
import TaskCardModal from "./TaskCardModal";

const columnStatus = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("cours") || t.includes("progress")) return "in_progress";
  if (t.includes("termin") || t.includes("approuv")) return "done";
  if (t.includes("assign")) return "assigned";
  return "todo";
};

const statusBadge = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("cours")) return { label: "En cours", cls: "bg-orange-100 text-orange-700" };
  if (t.includes("termin") || t.includes("approuv"))
    return { label: "Terminé", cls: "bg-violet-100 text-violet-700" };
  if (t.includes("assign")) return { label: "Assigné", cls: "bg-blue-100 text-blue-700" };
  return { label: "À faire", cls: "bg-slate-100 text-slate-600" };
};

const priorityBadge = (p) => {
  if (p === "high") return { label: "P1", cls: "bg-red-500 text-white" };
  if (p === "low") return { label: "P3", cls: "bg-emerald-500 text-white" };
  return { label: "P2", cls: "bg-amber-500 text-white" };
};

export default function KanbanBoard({
  workspaceId,
  columns,
  tasks,
  loading,
  onRefresh,
}) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [moving, setMoving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const tasksByColumn = (columnId) =>
    tasks.filter((t) => t.column_id === columnId);

  const handleDrop = async (columnId, columnTitle) => {
    if (!draggedTask) return;
    if (draggedTask.column_id === columnId) {
      setDraggedTask(null);
      return;
    }
    try {
      setMoving(true);
      await moveTask(draggedTask.id, {
        column_id: columnId,
        status: columnStatus(columnTitle),
        position: tasksByColumn(columnId).length,
      });
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Déplacement impossible.");
    } finally {
      setMoving(false);
      setDraggedTask(null);
    }
  };

  const handleAddCard = async (columnId) => {
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      setError("");
      await createTask({
        workspace_id: workspaceId,
        column_id: columnId,
        title: newTitle.trim(),
      });
      setNewTitle("");
      setAddingToColumn(null);
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Création impossible.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <FiLoader className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      {moving && (
        <div className="mb-4 text-sm text-blue-600 flex items-center gap-2">
          <FiLoader className="animate-spin" /> Déplacement…
        </div>
      )}

      <div className="flex gap-5 overflow-x-auto pb-6 min-h-[calc(100vh-14rem)]">
        {columns.map((column) => {
          const columnTasks = tasksByColumn(column.id);
          const isAdding = addingToColumn === column.id;
          const badge = statusBadge(column.title);

          return (
            <div
              key={column.id}
              className="w-[290px] shrink-0 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id, column.title)}
            >
              <div className="flex items-center justify-between mb-3 px-0.5">
                <h3 className="font-bold text-slate-800 text-sm">{column.title}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-400">
                    {columnTasks.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToColumn(column.id);
                      setNewTitle("");
                    }}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 flex items-center justify-center transition"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div
                className={`flex-1 rounded-2xl p-2 space-y-2.5 min-h-[200px] transition ${
                  draggedTask ? "bg-blue-50/60 ring-2 ring-blue-200/60" : "bg-slate-200/40"
                }`}
              >
                {columnTasks.map((task) => {
                  const prio = priorityBadge(task.priority);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      draggable
                      onDragStart={() => setDraggedTask(task)}
                      onDragEnd={() => setDraggedTask(null)}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left bg-white rounded-xl shadow-sm border border-slate-100/80 p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing ${
                        draggedTask?.id === task.id ? "opacity-50 rotate-1" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${prio.cls}`}
                        >
                          {prio.label.replace("P", "")}
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900 text-sm leading-snug">
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          {task.assigned_to_profile?.full_name ? (
                            <div
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-[9px] font-black text-white"
                              title={task.assigned_to_profile.full_name}
                            >
                              {task.assigned_to_profile.full_name.charAt(0)}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100" />
                          )}
                          {task.due_date && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              {new Date(task.due_date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="flex items-center gap-0.5 text-[10px]">
                            <FiMessageCircle /> 0
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px]">
                            <FiThumbsUp /> 0
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {isAdding ? (
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <textarea
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddCard(column.id);
                        }
                        if (e.key === "Escape") setAddingToColumn(null);
                      }}
                      placeholder="Titre de la carte…"
                      rows={2}
                      className="w-full text-sm outline-none resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleAddCard(column.id)}
                        disabled={creating}
                        className="btn-primary h-8 text-xs px-3"
                      >
                        {creating ? "…" : "Ajouter"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToColumn(null);
                          setNewTitle("");
                        }}
                        className="text-xs font-bold text-slate-500"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToColumn(column.id);
                      setNewTitle("");
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-slate-500 hover:bg-white/70 text-sm font-semibold transition"
                  >
                    <FiPlus />
                    Ajouter une carte
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskCardModal
          task={selectedTask}
          workspaceId={workspaceId}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onUpdated={onRefresh}
          onDeleted={onRefresh}
        />
      )}
    </>
  );
}
