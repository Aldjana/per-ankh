import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiPlus, FiFileText, FiLoader } from "react-icons/fi";
import {
  getNotesByWorkspace,
  createNote,
  deleteNote,
} from "../../services/noteService";
import CommentSection from "../../components/CommentSection";

export default function BoardNotesTab() {
  const { workspaceId } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const list = await getNotesByWorkspace(workspaceId);
      setNotes(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSaving(true);
      await createNote({
        workspace_id: workspaceId,
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <FiLoader className="animate-spin text-3xl text-slate-400" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4 min-h-[400px]">
      <div className="card p-4 space-y-4">
        <h2 className="font-black text-slate-900">Notes du board</h2>
        <form onSubmit={handleCreate} className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu…"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full h-9">
            <FiPlus /> Nouvelle note
          </button>
        </form>
        <ul className="space-y-1 max-h-[50vh] overflow-y-auto">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setSelected(note)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${
                selected?.id === note.id
                  ? "bg-blue-100 text-blue-900"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {note.title}
            </button>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        {!selected ? (
          <div className="text-center py-16 text-slate-400">
            <FiFileText className="text-4xl mx-auto mb-2" />
            <p>Sélectionnez une note ou créez-en une.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-xl font-black text-slate-900">{selected.title}</h3>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm("Supprimer ?")) {
                    await deleteNote(selected.id);
                    setSelected(null);
                    load();
                  }
                }}
                className="text-xs font-bold text-red-600"
              >
                Supprimer
              </button>
            </div>
            <p className="text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed">
              {selected.content || "—"}
            </p>
            <CommentSection workspaceId={workspaceId} noteId={selected.id} />
          </>
        )}
      </div>
    </div>
  );
}
