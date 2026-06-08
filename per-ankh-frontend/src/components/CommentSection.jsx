import { useCallback, useEffect, useState } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiLoader,
  FiEdit2,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  getCommentsByNote,
  getCommentsByTask,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";

export default function CommentSection({
  workspaceId,
  noteId = null,
  taskId = null,
  onCommentChange = null,
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = useCallback(async () => {
    if (!noteId && !taskId) return;

    try {
      setLoading(true);
      setError("");

      const list = noteId
        ? await getCommentsByNote(noteId)
        : await getCommentsByTask(taskId);

      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger les commentaires."
      );
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [noteId, taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const getCommentId = (comment) => comment?.id || "";
  const getCommentContent = (comment) => comment?.content || "";
  const getAuthorName = (comment) =>
    comment?.profiles?.full_name || comment?.author_name || "Utilisateur";
  const getAuthorId = (comment) =>
    comment?.author_id || comment?.profiles?.id || "";

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !workspaceId) return;

    try {
      setSaving(true);
      setError("");

      await createComment({
        workspace_id: workspaceId,
        content: content.trim(),
        note_id: noteId || undefined,
        task_id: taskId || undefined,
      });

      setContent("");
      await fetchComments();
      onCommentChange?.();
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible d'ajouter le commentaire."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(getCommentId(comment));
    setEditContent(getCommentContent(comment));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      setSaving(true);
      await updateComment(commentId, { content: editContent.trim() });
      cancelEdit();
      await fetchComments();
      onCommentChange?.();
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de modifier le commentaire."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;

    try {
      await deleteComment(commentId);
      await fetchComments();
      onCommentChange?.();
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de supprimer le commentaire."
      );
    }
  };

  const visibleComments = comments.filter((comment) => comment?.content !== "👍");
  const likeCount = comments.filter((comment) => comment?.content === "👍").length;

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <h4 className="font-black text-slate-900 flex items-center gap-2">
        <FiMessageCircle />
        Commentaires ({visibleComments.length})
      </h4>
      {likeCount > 0 && (
        <p className="text-xs text-slate-500 mt-1">
          {likeCount} like{likeCount > 1 ? "s" : ""}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-3 font-semibold">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 mt-4 text-sm">
          <FiLoader className="animate-spin" />
          Chargement...
        </div>
      ) : (
        <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
          {visibleComments.length === 0 ? (
            <p className="text-sm text-slate-400">Aucun commentaire pour l'instant.</p>
          ) : (
            visibleComments.map((comment) => {
              const id = getCommentId(comment);
              const isOwner = getAuthorId(comment) === user?.id;

              return (
                <div
                  key={id}
                  className="bg-slate-50 rounded-2xl p-3 border border-slate-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {getAuthorName(comment)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>

                    {isOwner && editingId !== id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(comment)}
                          className="w-8 h-8 rounded-xl bg-white text-slate-500 flex items-center justify-center hover:bg-slate-100"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="w-8 h-8 rounded-xl bg-white text-red-500 flex items-center justify-center hover:bg-red-50"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="2"
                        className="w-full bg-white rounded-xl px-3 py-2 text-sm outline-none border border-slate-200 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(id)}
                          disabled={saving}
                          className="text-xs font-bold text-blue-600"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs font-bold text-slate-500"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 mt-2 leading-6">
                      {getCommentContent(comment)}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un commentaire... Utilisez @ pour mentionner"
          className="flex-1 h-11 bg-slate-100 rounded-2xl px-4 outline-none text-sm border border-transparent focus:border-blue-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="h-11 px-4 rounded-2xl bg-blue-600 text-white font-black flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <FiLoader className="animate-spin" /> : <FiSend />}
        </button>
      </form>
    </div>
  );
}
