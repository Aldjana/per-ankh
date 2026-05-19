import { useEffect, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiUsers,
  FiFolder,
  FiMoreVertical,
  FiCalendar,
  FiX,
  FiEdit2,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";
import Layout from "../components/Layout";
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../services/workspaceService";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const safeWorkspaces = Array.isArray(workspaces) ? workspaces : [];

    const result = safeWorkspaces.filter((workspace) => {
      const workspaceName = getWorkspaceName(workspace);
      return workspaceName.toLowerCase().includes(search.toLowerCase());
    });

    setFilteredWorkspaces(result);
  }, [search, workspaces]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError("");

      const list = await getWorkspaces();

      console.log("LISTE FINALE FRONTEND :", list);

      const safeList = Array.isArray(list) ? list : [];

      setWorkspaces(safeList);
      setFilteredWorkspaces(safeList);
    } catch (err) {
      console.log("ERREUR GET WORKSPACES :", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les workspaces."
      );

      setWorkspaces([]);
      setFilteredWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

 
  const getRealWorkspace = (workspace) => {
    if (!workspace) return {};

    return (
      workspace.workspace ||
      workspace.data ||
      workspace.workspaces ||
      workspace.item ||
      workspace
    );
  };

  const getWorkspaceId = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.id ||
      item?.workspace_id ||
      item?.workspaceId ||
      workspace?.id ||
      workspace?.workspace_id ||
      workspace?.workspaceId
    );
  };

  const getWorkspaceName = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.name ||
      item?.nom ||
      item?.title ||
      item?.titre ||
      item?.workspace_name ||
      item?.workspaceName ||
      item?.workspace?.name ||
      "Sans nom"
    );
  };

  const getWorkspaceDescription = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.description ||
      item?.desc ||
      item?.details ||
      item?.workspace_description ||
      item?.workspaceDescription ||
      item?.workspace?.description ||
      "Aucune description."
    );
  };

  const getWorkspaceDate = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.created_at ||
      item?.createdAt ||
      item?.created_date ||
      item?.date_creation ||
      item?.inserted_at ||
      item?.workspace?.created_at ||
      null
    );
  };

  const getWorkspaceMembers = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.members_count ||
      item?.members ||
      item?.member_count ||
      item?.workspace_members_count ||
      1
    );
  };

  const getWorkspaceProjects = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.projects_count ||
      item?.projects ||
      item?.tasks_count ||
      item?.project_count ||
      0
    );
  };

  const openCreateModal = () => {
    setEditingWorkspace(null);
    setFormData({
      name: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (workspace) => {
    setEditingWorkspace(workspace);

    setFormData({
      name: getWorkspaceName(workspace),
      description:
        getWorkspaceDescription(workspace) === "Aucune description."
          ? ""
          : getWorkspaceDescription(workspace),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWorkspace(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Le nom du workspace est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingWorkspace) {
        const id = getWorkspaceId(editingWorkspace);

        await updateWorkspace(id, {
          name: formData.name,
          description: formData.description,
        });
      } else {
        await createWorkspace({
          name: formData.name,
          description: formData.description,
        });
      }

      closeModal();
      await fetchWorkspaces();
    } catch (err) {
      console.log(
        "ERREUR SAVE WORKSPACE :",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Une erreur est survenue pendant l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workspace) => {
    const id = getWorkspaceId(workspace);
    const workspaceName = getWorkspaceName(workspace);

    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer le workspace "${workspaceName}" ?`
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await deleteWorkspace(id);
      await fetchWorkspaces();
    } catch (err) {
      console.log(
        "ERREUR DELETE WORKSPACE :",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer ce workspace."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER PAGE */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                Workspaces
              </h1>

              <p className="text-slate-500 mt-2">
                Gérez vos espaces de travail, vos équipes et vos projets.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              <FiPlus />
              Nouveau workspace
            </button>
          </div>

          <div className="mt-6 h-12 bg-slate-100 rounded-2xl px-4 flex items-center gap-3 max-w-xl">
            <FiSearch className="text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un workspace..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </section>

        {/* ERREUR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* LOADING / EMPTY / LIST */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-slate-500">
            <FiLoader className="text-3xl animate-spin mb-3" />
            Chargement des workspaces...
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto">
              <FiFolder />
            </div>

            <h2 className="text-xl font-black text-slate-900 mt-4">
              Aucun workspace trouvé
            </h2>

            <p className="text-slate-500 mt-2">
              Créez votre premier espace de travail pour commencer.
            </p>

            <button
              onClick={openCreateModal}
              className="mt-5 h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black inline-flex items-center justify-center gap-2"
            >
              <FiPlus />
              Créer un workspace
            </button>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredWorkspaces.map((workspace, index) => (
              <div
                key={getWorkspaceId(workspace) || index}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center text-2xl shadow-lg">
                    <FiFolder />
                  </div>

                  <div className="relative group">
                    <button className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
                      <FiMoreVertical />
                    </button>

                    <div className="hidden group-hover:block absolute right-0 top-11 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-20">
                      <button
                        onClick={() => openEditModal(workspace)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                      >
                        <FiEdit2 />
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(workspace)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-slate-900">
                      {getWorkspaceName(workspace)}
                    </h3>

                    <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                      Actif
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-3 leading-6">
                    {getWorkspaceDescription(workspace)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-slate-50 rounded-2xl p-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <FiUsers />
                      Membres
                    </div>

                    <p className="text-2xl font-black mt-1">
                      {getWorkspaceMembers(workspace)}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <FiFolder />
                      Projets
                    </div>

                    <p className="text-2xl font-black mt-1">
                      {getWorkspaceProjects(workspace)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FiCalendar />
                    {formatDate(getWorkspaceDate(workspace))}
                  </div>

                  <button className="text-blue-600 font-black text-sm hover:underline">
                    Ouvrir
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editingWorkspace
                    ? "Modifier le workspace"
                    : "Nouveau workspace"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingWorkspace
                    ? "Mettez à jour les informations."
                    : "Créez un nouvel espace de travail."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Nom du workspace
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: PER-ANKH App"
                  className="w-full h-12 bg-slate-100 rounded-2xl px-4 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez le rôle de ce workspace..."
                  rows="4"
                  className="w-full bg-slate-100 rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-12 px-5 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <FiLoader className="animate-spin" />}

                  {saving
                    ? "Enregistrement..."
                    : editingWorkspace
                    ? "Modifier"
                    : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}