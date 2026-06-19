import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiFolder,
  FiLoader,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../services/workspaceService";
import {
  getWorkspaceId,
  getWorkspaceName,
  getWorkspaceDescription,
} from "../utils/workspace";
import { toast } from "react-toastify";



export default function Boards() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    setFiltered(
      workspaces.filter((w) =>
        getWorkspaceName(w).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, workspaces]);

  const fetchList = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getWorkspaces();
      setWorkspaces(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de chargement.");
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const openBoard = (w) => {
    const id = getWorkspaceId(w);
    if (id) navigate(`/board/${id}`);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (w, e) => {
    e.stopPropagation();
    setEditing(w);
    setForm({
      name: getWorkspaceName(w),
      description: getWorkspaceDescription(w) || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      if (editing) {
        await updateWorkspace(getWorkspaceId(editing), form);
        setModalOpen(false);
        await fetchList();
      } else {
        const res = await createWorkspace(form);
        const created = res?.workspace || res;
        const id = created?.id;
        setModalOpen(false);
        if (id) navigate(`/board/${id}`);
        else await fetchList();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur.");
      
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (w, e) => {
    e.stopPropagation();
    setWorkspaceToDelete(w);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;
    try {
      setDeleting(true);
      setError("");
      await deleteWorkspace(getWorkspaceId(workspaceToDelete));
      await fetchList();
    } catch (err) {
      setError(err.response?.data?.message || "Suppression impossible.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setWorkspaceToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <PageHeader
          title="Mes tableaux"
          // description="Chaque board contient un Kanban (À faire → En cours → Terminé), des notes et des membres "
          actions={
            <button type="button" onClick={openCreate} className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2 disabled:opacity-50"
            >
              <FiPlus />
              Nouveau board
            </button>
          }
        />

        <div className="card p-4 flex items-center gap-3 max-w-md">
          <FiSearch className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un board…"
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <FiLoader className="animate-spin text-3xl text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <FiFolder className="text-5xl text-slate-300 mx-auto" />
            <h2 className="font-black text-xl mt-4">Aucun board</h2>

            <button type="button" onClick={openCreate} className="btn-primary mt-6">
              <FiPlus /> Créer mon premier board
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((w, i) => (
              <button
                key={getWorkspaceId(w) || i}
                type="button"
                onClick={() => openBoard(w)}
                className="group card p-5 text-left hover:ring-2 hover:ring-slate-300 hover:shadow-lg transition min-h-[140px] flex flex-col justify-between bg-slate-900 text-white border-0"
              >
                <div>
                  <h3 className="font-black text-lg leading-tight">
                    {getWorkspaceName(w)}
                  </h3>
                  <p className="text-blue-100/80 text-sm mt-2 line-clamp-2">
                    {getWorkspaceDescription(w) || "Ouvrir le tableau Kanban"}
                  </p>
                </div>
                <div className="flex justify-end gap-1 mt-4 opacity-0 group-hover:opacity-100 transition">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => openEdit(w, e)}
                    onKeyDown={() => { }}
                    className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
                  >
                    <FiEdit2 />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(w, e)}
                    onKeyDown={() => { }}
                    className="w-8 h-8 rounded-lg bg-red-500/40 flex items-center justify-center"
                  >
                    <FiTrash2 />
                  </span>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={openCreate}
              className="group card p-5 text-left hover:ring-2 hover:ring-slate-300 hover:shadow-lg transition min-h-[140px] flex flex-col justify-center items-center bg-slate-100 text-slate-900 border-0">
              <FiPlus className="text-2xl" />
              <span className="font-bold text-sm mt-2">Nouveau board</span>
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/50">
          <form
            onSubmit={handleSubmit}
            className="card w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black">
              {editing ? "Modifier le board" : "Nouveau board"}
            </h2>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nom du board"
              className="w-full h-11 rounded-xl border border-slate-200 px-4"
              required
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Description"
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 px-4 rounded-xl border font-bold text-sm"
              >
                Annuler
              </button>
              <button type="submit" disabled={saving} className="h-10 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2 disabled:opacity-50">
                {saving ? <FiLoader className="animate-spin" /> : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer le tableau"
        message={`Êtes-vous sûr de vouloir supprimer « ${workspaceToDelete ? getWorkspaceName(workspaceToDelete) : ""} » ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setWorkspaceToDelete(null);
        }}
      />
    </Layout>
  );
}
