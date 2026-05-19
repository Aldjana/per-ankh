import { useEffect, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiCheckSquare,
  FiMoreVertical,
  FiCalendar,
  FiX,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiFlag,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { getWorkspaces } from "../services/workspaceService";
import { getColumnsByWorkspace } from "../services/columnService";
import {
  getTasksByWorkspace,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

export default function Tasks() {
  const [workspaces, setWorkspaces] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    workspace_id: "",
    column_id: "",
    title: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchColumnsAndTasks(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const result = safeTasks.filter((task) => {
      const title = getTaskTitle(task);
      return title.toLowerCase().includes(search.toLowerCase());
    });

    setFilteredTasks(result);
  }, [search, tasks]);

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
      item?.uuid ||
      workspace?.id ||
      workspace?.workspace_id ||
      workspace?.workspaceId ||
      ""
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

  const getRealColumn = (column) => {
    if (!column) return {};

    return column.column || column.data || column.item || column;
  };

  const getColumnId = (column) => {
    const item = getRealColumn(column);

    return (
      item?.id ||
      item?.column_id ||
      item?.columnId ||
      item?.uuid ||
      column?.id ||
      ""
    );
  };

  const getColumnName = (column) => {
    const item = getRealColumn(column);

    return (
      item?.name ||
      item?.title ||
      item?.nom ||
      item?.titre ||
      item?.column_name ||
      item?.columnName ||
      "Colonne sans nom"
    );
  };

  const getRealTask = (task) => {
    if (!task) return {};

    return task.task || task.data || task.tache || task.item || task;
  };

  const getTaskId = (task) => {
    const item = getRealTask(task);

    return (
      item?.id ||
      item?.task_id ||
      item?.taskId ||
      item?.uuid ||
      task?.id ||
      ""
    );
  };

  const getTaskTitle = (task) => {
    const item = getRealTask(task);

    return (
      item?.title ||
      item?.titre ||
      item?.name ||
      item?.nom ||
      item?.task_title ||
      item?.taskTitle ||
      "Sans titre"
    );
  };

  const getTaskDescription = (task) => {
    const item = getRealTask(task);

    return (
      item?.description ||
      item?.desc ||
      item?.details ||
      item?.task_description ||
      item?.taskDescription ||
      "Aucune description."
    );
  };

  const getTaskPriority = (task) => {
    const item = getRealTask(task);

    return item?.priority || item?.priorite || "medium";
  };

  const getTaskColumnId = (task) => {
    const item = getRealTask(task);

    return item?.column_id || item?.columnId || "";
  };

  const getTaskWorkspaceId = (task) => {
    const item = getRealTask(task);

    return item?.workspace_id || item?.workspaceId || selectedWorkspaceId;
  };

  const getTaskDate = (task) => {
    const item = getRealTask(task);

    return (
      item?.created_at ||
      item?.createdAt ||
      item?.created_date ||
      item?.date_creation ||
      item?.inserted_at ||
      null
    );
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const workspaceList = await getWorkspaces();

      console.log("WORKSPACES DANS TASKS :", workspaceList);

      const safeWorkspaces = Array.isArray(workspaceList) ? workspaceList : [];

      setWorkspaces(safeWorkspaces);

      if (safeWorkspaces.length > 0) {
        const firstWorkspaceId = getWorkspaceId(safeWorkspaces[0]);

        console.log("PREMIER WORKSPACE ID :", firstWorkspaceId);

        if (firstWorkspaceId) {
          setSelectedWorkspaceId(firstWorkspaceId);

          setFormData((prev) => ({
            ...prev,
            workspace_id: firstWorkspaceId,
          }));
        } else {
          setError("Workspace trouvé, mais son ID est introuvable.");
        }
      } else {
        setError("Aucun workspace trouvé. Créez d'abord un workspace.");
      }
    } catch (err) {
      console.log("ERREUR INIT TASKS :", err.response?.data || err.message);
      setError("Impossible de charger les workspaces.");
    } finally {
      setLoading(false);
    }
  };

  const fetchColumnsAndTasks = async (workspaceId) => {
    try {
      setLoading(true);
      setError("");

      const [columnList, taskList] = await Promise.all([
        getColumnsByWorkspace(workspaceId),
        getTasksByWorkspace(workspaceId),
      ]);

      console.log("COLUMNS DANS TASKS :", columnList);
      console.log("TASKS DANS TASKS :", taskList);

      const safeColumns = Array.isArray(columnList) ? columnList : [];
      const safeTasks = Array.isArray(taskList) ? taskList : [];

      setColumns(safeColumns);
      setTasks(safeTasks);
      setFilteredTasks(safeTasks);

      setFormData((prev) => ({
        ...prev,
        workspace_id: workspaceId,
        column_id: safeColumns.length > 0 ? getColumnId(safeColumns[0]) : "",
      }));
    } catch (err) {
      console.log(
        "ERREUR COLUMNS/TASKS :",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Impossible de charger les colonnes ou les tâches."
      );

      setColumns([]);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
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

  const formatPriority = (priority) => {
    if (priority === "high") return "Haute";
    if (priority === "low") return "Basse";
    return "Moyenne";
  };

  const priorityClass = (priority) => {
    if (priority === "high") return "bg-red-50 text-red-600";
    if (priority === "low") return "bg-emerald-50 text-emerald-600";
    return "bg-orange-50 text-orange-600";
  };

  const openCreateModal = () => {
    if (!selectedWorkspaceId) {
      setError("Veuillez d'abord créer ou choisir un workspace.");
      return;
    }

    if (columns.length === 0) {
      setError(
        "Aucune colonne Kanban trouvée pour ce workspace. Créez d'abord une colonne Kanban."
      );
      return;
    }

    setEditingTask(null);

    setFormData({
      workspace_id: selectedWorkspaceId,
      column_id: getColumnId(columns[0]),
      title: "",
      description: "",
      priority: "medium",
    });

    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setFormData({
      workspace_id: getTaskWorkspaceId(task),
      column_id: getTaskColumnId(task),
      title: getTaskTitle(task),
      description:
        getTaskDescription(task) === "Aucune description."
          ? ""
          : getTaskDescription(task),
      priority: getTaskPriority(task),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);

    setFormData({
      workspace_id: selectedWorkspaceId || "",
      column_id: columns.length > 0 ? getColumnId(columns[0]) : "",
      title: "",
      description: "",
      priority: "medium",
    });
  };

  const handleWorkspaceChange = (e) => {
    const workspaceId = e.target.value;

    setSelectedWorkspaceId(workspaceId);

    setFormData((prev) => ({
      ...prev,
      workspace_id: workspaceId,
      column_id: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "workspace_id") {
      setSelectedWorkspaceId(value);

      setFormData({
        ...formData,
        workspace_id: value,
        column_id: "",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.workspace_id) {
      setError("Le workspace est obligatoire.");
      return;
    }

    if (!formData.column_id) {
      setError("La colonne Kanban est obligatoire.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Le titre de la tâche est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        workspace_id: formData.workspace_id,
        column_id: formData.column_id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      };

      console.log("PAYLOAD TASK :", payload);

      if (editingTask) {
        await updateTask(getTaskId(editingTask), payload);
      } else {
        await createTask(payload);
      }

      closeModal();
      await fetchColumnsAndTasks(formData.workspace_id);
    } catch (err) {
      console.log("ERREUR SAVE TASK :", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          "Une erreur est survenue pendant l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer la tâche "${getTaskTitle(task)}" ?`
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await deleteTask(getTaskId(task));
      await fetchColumnsAndTasks(selectedWorkspaceId);
    } catch (err) {
      console.log("ERREUR DELETE TASK :", err.response?.data || err.message);

      setError(
        err.response?.data?.message || "Impossible de supprimer cette tâche."
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Tâches</h1>

              <p className="text-slate-500 mt-2">
                Gérez les tâches de vos workspaces et colonnes Kanban.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              <FiPlus />
              Nouvelle tâche
            </button>
          </div>

          <div className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-4 max-w-4xl">
            <div className="h-12 bg-slate-100 rounded-2xl px-4 flex items-center gap-3">
              <select
                value={selectedWorkspaceId}
                onChange={handleWorkspaceChange}
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-700"
              >
                <option value="">Choisir un workspace</option>

                {workspaces.map((workspace, index) => (
                  <option
                    key={getWorkspaceId(workspace) || index}
                    value={getWorkspaceId(workspace)}
                  >
                    {getWorkspaceName(workspace)}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-12 bg-slate-100 rounded-2xl px-4 flex items-center gap-3">
              <FiSearch className="text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une tâche..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-slate-500">
            <FiLoader className="text-3xl animate-spin mb-3" />
            Chargement des tâches...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-3xl mx-auto">
              <FiCheckSquare />
            </div>

            <h2 className="text-xl font-black text-slate-900 mt-4">
              Aucune tâche trouvée
            </h2>

            <p className="text-slate-500 mt-2">
              {columns.length === 0
                ? "Aucune colonne Kanban trouvée pour ce workspace."
                : "Créez votre première tâche pour commencer."}
            </p>

            <button
              onClick={openCreateModal}
              className="mt-5 h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black inline-flex items-center justify-center gap-2"
            >
              <FiPlus />
              Créer une tâche
            </button>
          </div>
        ) : (
          <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTasks.map((task, index) => (
              <div
                key={getTaskId(task) || index}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg">
                    <FiCheckSquare />
                  </div>

                  <div className="relative group">
                    <button className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
                      <FiMoreVertical />
                    </button>

                    <div className="hidden group-hover:block absolute right-0 top-11 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-20">
                      <button
                        onClick={() => openEditModal(task)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                      >
                        <FiEdit2 />
                        Modifier
                      </button>

                      <button
                        onClick={() => handleDelete(task)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-xl font-black text-slate-900">
                    {getTaskTitle(task)}
                  </h3>

                  <p className="text-sm text-slate-500 mt-3 leading-6">
                    {getTaskDescription(task)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${priorityClass(
                      getTaskPriority(task)
                    )}`}
                  >
                    <FiFlag />
                    {formatPriority(getTaskPriority(task))}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FiCalendar />
                    {formatDate(getTaskDate(task))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center px-4 py-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Workspace, colonne Kanban et informations de la tâche.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Workspace
                </label>

                <select
                  name="workspace_id"
                  value={formData.workspace_id}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-100 rounded-2xl px-4 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition"
                  required
                >
                  <option value="">Choisir un workspace</option>

                  {workspaces.map((workspace, index) => (
                    <option
                      key={getWorkspaceId(workspace) || index}
                      value={getWorkspaceId(workspace)}
                    >
                      {getWorkspaceName(workspace)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Colonne Kanban
                </label>

                <select
                  name="column_id"
                  value={formData.column_id}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-100 rounded-2xl px-4 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition"
                  required
                >
                  <option value="">Choisir une colonne</option>

                  {columns.map((column, index) => (
                    <option
                      key={getColumnId(column) || index}
                      value={getColumnId(column)}
                    >
                      {getColumnName(column)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Titre
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Créer la page dashboard"
                  className="w-full h-11 bg-slate-100 rounded-2xl px-4 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition"
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
                  placeholder="Décrivez la tâche..."
                  rows="2"
                  className="w-full bg-slate-100 rounded-2xl px-4 py-3 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Priorité
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-100 rounded-2xl px-4 outline-none border border-transparent focus:border-blue-500 focus:bg-white transition"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 px-5 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <FiLoader className="animate-spin" />}

                  {saving
                    ? "Enregistrement..."
                    : editingTask
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