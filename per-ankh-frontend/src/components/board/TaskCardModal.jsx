import { useEffect, useState } from "react";
import {
  FiX,
  FiTrash2,
  FiLoader,
  FiFlag,
  FiCalendar,
  FiUser,
  FiTag,
  FiPaperclip,
  FiUpload,
  FiFileText,
} from "react-icons/fi";
import CommentSection from "../CommentSection";
import { updateTask, deleteTask, moveTask } from "../../services/taskService";
import { getWorkspaceMembers } from "../../services/memberService";
import { getNotesByWorkspace } from "../../services/noteService";
import {
  getFilesByTask,
  uploadFile,
  deleteFile,
} from "../../services/fileService";

export default function TaskCardModal({
  task,
  workspaceId,
  columns,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    column_id: "",
    assigned_to: "",
    due_date: "",
    priority: "medium",
    tags: "",
  });

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title || "",
      description: task.description || "",
      column_id: task.column_id || "",
      assigned_to: task.assigned_to || "",
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      priority: task.priority || "medium",
      tags: Array.isArray(task.tags) ? task.tags.join(", ") : "",
    });
    loadExtras();
  }, [task?.id]);

  const loadExtras = async () => {
    if (!workspaceId || !task?.id) return;
    try {
      const [memberList, fileList, noteList] = await Promise.all([
        getWorkspaceMembers(workspaceId),
        getFilesByTask(task.id),
        getNotesByWorkspace(workspaceId).catch(() => []),
      ]);
      setMembers(Array.isArray(memberList) ? memberList : []);
      setFiles(Array.isArray(fileList) ? fileList : []);
      setNotes(Array.isArray(noteList) ? noteList : []);
    } catch {
      setMembers([]);
      setFiles([]);
      setNotes([]);
    }
  };

  const parseTags = (s) =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await updateTask(task.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        priority: form.priority,
        tags: parseTags(form.tags),
      });
      if (form.column_id !== task.column_id) {
        const col = columns.find((c) => c.id === form.column_id);
        const t = (col?.title || "").toLowerCase();
        let status = "todo";
        if (t.includes("cours")) status = "in_progress";
        if (t.includes("termin")) status = "done";
        await moveTask(task.id, { column_id: form.column_id, status });
      }
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette carte ?")) return;
    try {
      await deleteTask(task.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de supprimer.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("workspace_id", workspaceId);
      fd.append("task_id", task.id);
      await uploadFile(fd);
      await loadExtras();
    } catch (err) {
      setError(err.response?.data?.message || "Upload impossible.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Carte
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          )}

          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full text-xl font-black text-slate-900 outline-none border-b border-transparent focus:border-blue-400 pb-1"
            placeholder="Titre de la carte"
          />

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="Décrivez la carte…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500">Colonne</label>
              <select
                value={form.column_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, column_id: e.target.value }))
                }
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Priorité</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <FiUser /> Assigné
              </label>
              <select
                value={form.assigned_to}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assigned_to: e.target.value }))
                }
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="">—</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id || m.profiles?.id}>
                    {m.profiles?.full_name || m.user_id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <FiCalendar /> Échéance
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value }))
                }
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <FiTag /> Tags
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="urgent, design"
              className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black flex items-center gap-2">
                <FiPaperclip /> Pièces jointes
              </span>
              <label className="text-xs font-bold text-blue-600 cursor-pointer flex items-center gap-1">
                {uploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
                Ajouter
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </div>
            {files.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun fichier.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((f) => {
                  const isImage = f.file_type?.startsWith("image/");
                  return (
                    <li
                      key={f.id}
                      className="flex flex-col gap-2 bg-slate-50 rounded-lg p-2"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={f.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 truncate text-xs"
                        >
                          {f.file_name}
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteFile(f.id);
                            loadExtras();
                          }}
                          className="text-red-500 shrink-0 ml-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      {isImage && (
                        <img
                          src={f.file_url}
                          alt={f.file_name}
                          className="max-h-32 max-w-full rounded-lg object-cover"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <span className="text-sm font-black flex items-center gap-2">
              <FiFileText /> Notes du board
            </span>
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 mt-2">Aucune note.</p>
            ) : (
              <ul className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {notes.slice(0, 3).map((note) => (
                  <li
                    key={note.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                  >
                    <p className="text-xs font-bold text-yellow-900">{note.title}</p>
                    <p className="text-xs text-yellow-800 line-clamp-2 mt-1">
                      {note.content || "Pas de contenu"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <CommentSection
            workspaceId={workspaceId}
            taskId={task.id}
            onCommentChange={onUpdated}
          />
        </div>

        <div className="shrink-0 p-4 border-t border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-bold text-red-600 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <FiTrash2 /> Supprimer
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary h-10"
            >
              {saving ? <FiLoader className="animate-spin" /> : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
