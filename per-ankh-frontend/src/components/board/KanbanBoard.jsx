import { useState } from "react";
import { FiPlus, FiLoader, FiMessageCircle, FiThumbsUp, FiFileText, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { createTask, moveTask } from "../../services/taskService";
import { createComment, deleteComment } from "../../services/commentService";
import { createNote, deleteNote } from "../../services/noteService";
import TaskCardModal from "./TaskCardModal";
import CommentSection from "../CommentSection";

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
  notes = [],
  loading,
  onRefresh,
}) {
  const { user } = useAuth();
  const [draggedTask, setDraggedTask] = useState(null);
  const [moving, setMoving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      setSavingNote(true);
      await createNote({
        workspace_id: workspaceId,
        title: noteTitle.trim(),
        content: noteContent.trim(),
      });
      setNoteTitle("");
      setNoteContent("");
      setSelectedNote(null);
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de la note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setSelectedNote(null);
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression de la note.");
    }
  };

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

  const [likingTaskId, setLikingTaskId] = useState(null);

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

  const getUserLikeComment = (task) =>
    task.comments?.find(
      (comment) => comment?.content === "👍" && comment?.author_id === user?.id
    );

  const handleLikeTask = async (task) => {
    if (!workspaceId && !task.workspace_id) return;
    const existingLike = getUserLikeComment(task);
    setLikingTaskId(task.id);

    try {
      setError("");
      if (existingLike) {
        await deleteComment(existingLike.id);
      } else {
        await createComment({
          workspace_id: workspaceId || task.workspace_id,
          content: "👍",
          task_id: task.id,
        });
      }
      await onRefresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de mettre à jour le like de cette tâche."
      );
    } finally {
      setLikingTaskId(null);
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

      <div className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pb-6 min-h-[calc(100vh-14rem)]">
        {columns.map((column) => {
          const columnTasks = tasksByColumn(column.id);
          const isAdding = addingToColumn === column.id;
          const badge = statusBadge(column.title);

          return (
            <div
              key={column.id}
              className="w-[calc(100vw-3.5rem)] xs:w-72 sm:w-80 md:w-96 lg:w-[290px] shrink-0 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id, column.title)}
            >
              <div className="flex items-center justify-between mb-3 px-0.5">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{column.title}</h3>
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

              <div
                className={`flex-1 rounded-xl sm:rounded-2xl p-2 sm:p-3 space-y-2 sm:space-y-2.5 min-h-[150px] sm:min-h-[200px] transition ${
                  draggedTask ? "bg-blue-50/60 ring-2 ring-blue-200/60" : "bg-slate-200/40"
                }`}
              >
                {columnTasks.map((task) => {
                  const prio = priorityBadge(task.priority);
                  const taskLikes = task.comments
                    ? task.comments.filter((comment) => comment?.content === "👍")
                    : [];
                  const taskVisibleComments = task.comments
                    ? task.comments.filter((comment) => comment?.content !== "👍")
                    : [];
                  const commentCount =
                    taskVisibleComments.length ?? task.comments_count ?? "—";
                  const likeCount =
                    typeof task.likes_count !== "undefined"
                      ? task.likes_count
                      : taskLikes.length;
                  const userLike = taskLikes.find(
                    (comment) => comment?.author_id === user?.id
                  );

                  return (
                    <button
                      key={task.id}
                      type="button"
                      draggable
                      onDragStart={() => setDraggedTask(task)}
                      onDragEnd={() => setDraggedTask(null)}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left bg-white rounded-xl shadow-sm border border-slate-100/80 overflow-hidden hover:shadow-md transition cursor-grab active:cursor-grabbing ${
                        draggedTask?.id === task.id ? "opacity-50 rotate-1" : ""
                      }`}
                    >
                      {task.files && task.files.length > 0 && (
                        <div className="w-full h-32 bg-slate-100 flex items-center justify-center overflow-hidden">
                          {task.files.find(f => f.file_type?.startsWith("image/")) ? (
                            <img
                              src={task.files.find(f => f.file_type?.startsWith("image/")).file_url}
                              alt={task.files.find(f => f.file_type?.startsWith("image/")).file_name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                      )}

                      <div className="p-2 sm:p-3">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 flex-wrap">
                          <span
                            className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                          <span
                            className={`text-[8px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${prio.cls}`}
                          >
                            {prio.label.replace("P", "")}
                          </span>
                        </div>

                        <p className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-1.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-1 mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            {task.assigned_to_profile?.full_name ? (
                              <div
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-[7px] sm:text-[9px] font-black text-white shrink-0"
                                title={task.assigned_to_profile.full_name}
                              >
                                {task.assigned_to_profile.full_name.charAt(0)}
                              </div>
                            ) : (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 shrink-0" />
                            )}
                            {task.due_date && (
                              <span className="text-[8px] sm:text-[10px] text-slate-500 font-medium truncate">
                                {new Date(task.due_date).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[8px] sm:text-[10px] shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskForComments(task);
                              }}
                              className="inline-flex items-center gap-0.5 sm:gap-1 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] hover:bg-blue-100 hover:text-blue-600 transition"
                            >
                              <FiMessageCircle />
                              {commentCount}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeTask(task);
                              }}
                              disabled={likingTaskId === task.id}
                              className="inline-flex items-center gap-0.5 sm:gap-1 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiThumbsUp />
                              {likeCount}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowNotesModal(true);
                              }}
                              className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold transition ${
                                notes.length > 0
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <FiFileText />
                              {notes.length > 0 ? notes.length : "0"}
                            </button>
                          </div>
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

      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FiFileText /> Notes du board
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedNote(null);
                }}
                className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center"
              >
                <FiX />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Liste des notes */}
              <div className="w-80 border-r border-slate-200 flex flex-col overflow-hidden">
                {/* Formulaire création */}
                <div className="p-4 border-b border-slate-200 overflow-y-auto flex-shrink-0">
                  <form onSubmit={handleCreateNote} className="space-y-2">
                    <input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Titre de la note"
                      className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                      required
                    />
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Contenu…"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none outline-none focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={savingNote || !noteTitle.trim()}
                      className="w-full h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1"
                    >
                      {savingNote ? <FiLoader className="animate-spin text-sm" /> : <FiPlus className="text-sm" />}
                      Ajouter
                    </button>
                  </form>
                </div>

                {/* Liste des notes */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Aucune note
                    </div>
                  ) : (
                    notes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => setSelectedNote(note)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedNote?.id === note.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{note.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{note.content}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Détail de la note et commentaires */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {!selectedNote ? (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    <p className="text-center">Sélectionnez une note pour voir les commentaires</p>
                  </div>
                ) : (
                  <div className="flex flex-col overflow-hidden h-full">
                    {/* Contenu de la note */}
                    <div className="p-6 border-b border-slate-200 overflow-y-auto flex-shrink-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900">{selectedNote.title}</h3>
                          <p className="text-slate-600 mt-2 whitespace-pre-wrap text-sm">{selectedNote.content}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteNote(selectedNote.id);
                            setSelectedNote(null);
                          }}
                          className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 shrink-0"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Commentaires */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <CommentSection 
                        workspaceId={workspaceId} 
                        noteId={selectedNote.id}
                        onCommentChange={onRefresh}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal commentaires uniquement */}
      {selectedTaskForComments && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedTaskForComments(null)}
            aria-label="Fermer"
          />
          <div className="relative w-full sm:max-w-md bg-white shadow-2xl flex flex-col animate-slide-in max-h-[80vh] sm:rounded-2xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <p className="text-sm font-bold text-slate-900">
                {selectedTaskForComments.title}
              </p>
              <button
                type="button"
                onClick={() => setSelectedTaskForComments(null)}
                className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
              >
                <FiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <CommentSection
                workspaceId={workspaceId}
                taskId={selectedTaskForComments.id}
                onCommentChange={onRefresh}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
