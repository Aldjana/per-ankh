import { useEffect, useState } from "react";
import {
  FiColumns,
  FiPlus,
  FiLoader,
  FiCheckSquare,
  FiFlag,
  FiMove,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { getWorkspaces } from "../services/workspaceService";
import { getColumnsByWorkspace, createColumn } from "../services/columnService";
import { getTasksByWorkspace, moveTask } from "../services/taskService";

export default function Kanban() {
  const [workspaces, setWorkspaces] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchKanbanData(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

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
      item?.workspace?.id ||
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
      workspace?.name ||
      workspace?.nom ||
      "Sans nom"
    );
  };

  const getRealColumn = (column) => {
    if (!column) return {};

    return (
      column.column ||
      column.data ||
      column.columns ||
      column.kanban_column ||
      column.item ||
      column
    );
  };

  const getColumnId = (column) => {
    const item = getRealColumn(column);

    return (
      item?.id ||
      item?.column_id ||
      item?.columnId ||
      item?.uuid ||
      item?.kanban_column_id ||
      column?.id ||
      ""
    );
  };

  const getColumnName = (column) => {
    const item = getRealColumn(column);

    return (
      item?.title ||
      item?.name ||
      item?.nom ||
      item?.titre ||
      item?.column_name ||
      item?.columnName ||
      "Colonne"
    );
  };

  const getColumnOrder = (column) => {
    const item = getRealColumn(column);

    return (
      item?.position ||
      item?.order_index ||
      item?.order ||
      item?.sort_order ||
      0
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

  const getTaskColumnId = (task) => {
    const item = getRealTask(task);

    return (
      item?.column_id ||
      item?.columnId ||
      item?.kanban_column_id ||
      item?.kanbanColumnId ||
      ""
    );
  };

  const getTaskPriority = (task) => {
    const item = getRealTask(task);

    return item?.priority || item?.priorite || "medium";
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const workspaceList = await getWorkspaces();
      const safeWorkspaces = Array.isArray(workspaceList) ? workspaceList : [];

      setWorkspaces(safeWorkspaces);

      if (safeWorkspaces.length > 0) {
        const firstId = getWorkspaceId(safeWorkspaces[0]);

        if (firstId) {
          setSelectedWorkspaceId(firstId);
        } else {
          setError("Workspace trouvé, mais son ID est introuvable.");
        }
      } else {
        setError("Aucun workspace trouvé. Créez d'abord un workspace.");
      }
    } catch (err) {
      console.log("ERREUR INIT KANBAN :", err.response?.data || err.message);
      setError("Impossible de charger les workspaces.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKanbanData = async (workspaceId) => {
    try {
      setLoading(true);
      setError("");

      const [columnList, taskList] = await Promise.all([
        getColumnsByWorkspace(workspaceId),
        getTasksByWorkspace(workspaceId),
      ]);

      const safeColumns = Array.isArray(columnList) ? columnList : [];
      const safeTasks = Array.isArray(taskList) ? taskList : [];

      const sortedColumns = [...safeColumns].sort(
        (a, b) => getColumnOrder(a) - getColumnOrder(b)
      );

      setColumns(sortedColumns);
      setTasks(safeTasks);
    } catch (err) {
      console.log("ERREUR KANBAN DATA :", err.response?.data || err.message);

      setError(
        err.response?.data?.message || "Impossible de charger le Kanban."
      );

      setColumns([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultColumns = async () => {
    if (!selectedWorkspaceId) {
      setError("Veuillez choisir un workspace.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const defaultColumns = [
        { title: "À faire", position: 1 },
        { title: "En cours", position: 2 },
        { title: "Terminé", position: 3 },
      ];

      for (const column of defaultColumns) {
        await createColumn({
          workspace_id: selectedWorkspaceId,
          title: column.title,
          position: column.position,
        });
      }

      await fetchKanbanData(selectedWorkspaceId);
    } catch (err) {
      console.log("ERREUR CREATE COLUMNS :", err.response?.data || err.message);

      setError(
        err.response?.data?.message || "Impossible d'initialiser le Kanban."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter((task) => getTaskColumnId(task) === columnId);
  };

  const handleWorkspaceChange = (e) => {
    const workspaceId = e.target.value;

    setSelectedWorkspaceId(workspaceId);
    setColumns([]);
    setTasks([]);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetColumnId) => {
    if (!draggedTask) return;

    const taskId = getTaskId(draggedTask);
    const currentColumnId = getTaskColumnId(draggedTask);

    if (!taskId || !targetColumnId) return;

    if (currentColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    try {
      setMoving(true);
      setError("");

      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (getTaskId(task) === taskId) {
            return {
              ...task,
              column_id: targetColumnId,
              columnId: targetColumnId,
            };
          }

          return task;
        })
      );

      await moveTask(taskId, {
        column_id: targetColumnId,
      });

      await fetchKanbanData(selectedWorkspaceId);
    } catch (err) {
      console.log("ERREUR MOVE TASK :", err.response?.data || err.message);

      setError(
        err.response?.data?.message || "Impossible de déplacer cette tâche."
      );

      await fetchKanbanData(selectedWorkspaceId);
    } finally {
      setMoving(false);
      setDraggedTask(null);
    }
  };

  const priorityClass = (priority) => {
    if (priority === "high") return "bg-red-50 text-red-600";
    if (priority === "low") return "bg-emerald-50 text-emerald-600";
    return "bg-orange-50 text-orange-600";
  };

  const priorityLabel = (priority) => {
    if (priority === "high") return "Haute";
    if (priority === "low") return "Basse";
    return "Moyenne";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Kanban</h1>

              <p className="text-slate-500 mt-2">
                Glissez une tâche et déposez-la dans une autre colonne pour
                changer son état.
              </p>
            </div>

            {columns.length === 0 && selectedWorkspaceId && !loading && (
              <button
                onClick={createDefaultColumns}
                className="h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                <FiPlus />
                Initialiser le Kanban
              </button>
            )}
          </div>

          <div className="mt-6 h-12 bg-slate-100 rounded-2xl px-4 flex items-center gap-3 max-w-xl">
            <FiColumns className="text-slate-400" />

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
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {moving && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <FiLoader className="animate-spin" />
            Déplacement de la tâche en cours...
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-slate-500">
            <FiLoader className="text-3xl animate-spin mb-3" />
            Chargement du Kanban...
          </div>
        ) : columns.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto">
              <FiColumns />
            </div>

            <h2 className="text-xl font-black text-slate-900 mt-4">
              Kanban non initialisé
            </h2>

            <p className="text-slate-500 mt-2">
              Ce workspace n’a pas encore de colonnes. Initialisez le Kanban
              pour commencer.
            </p>

            <button
              onClick={createDefaultColumns}
              className="mt-5 h-12 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black inline-flex items-center justify-center gap-2"
            >
              <FiPlus />
              Initialiser le Kanban
            </button>
          </div>
        ) : (
          <section className="grid xl:grid-cols-3 gap-5">
            {columns.map((column, columnIndex) => {
              const columnId = getColumnId(column);
              const columnTasks = getTasksByColumn(columnId);

              return (
                <div
                  key={columnId || columnIndex}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(columnId)}
                  className={`rounded-3xl border shadow-sm p-4 min-h-[420px] transition ${
                    draggedTask
                      ? "bg-blue-50/60 border-blue-200"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {getColumnName(column)}
                      </h2>

                      <p className="text-xs text-slate-500 mt-1">
                        {columnTasks.length} tâche(s)
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-700">
                      {columnTasks.length}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="border border-dashed border-slate-200 rounded-2xl p-5 text-center text-sm text-slate-400">
                        Déposez une tâche ici.
                      </div>
                    ) : (
                      columnTasks.map((task, taskIndex) => {
                        const isDragging =
                          draggedTask &&
                          getTaskId(draggedTask) === getTaskId(task);

                        return (
                          <div
                            key={getTaskId(task) || taskIndex}
                            draggable
                            onDragStart={() => handleDragStart(task)}
                            onDragEnd={handleDragEnd}
                            className={`cursor-grab active:cursor-grabbing bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:bg-white hover:shadow-md transition ${
                              isDragging ? "opacity-50 scale-[0.98]" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                                <FiCheckSquare />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="font-black text-slate-900">
                                    {getTaskTitle(task)}
                                  </h3>

                                  <FiMove className="text-slate-400 shrink-0 mt-1" />
                                </div>

                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                  {getTaskDescription(task)}
                                </p>

                                <div className="flex items-center justify-between gap-3 mt-4">
                                  <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${priorityClass(
                                      getTaskPriority(task)
                                    )}`}
                                  >
                                    <FiFlag />
                                    {priorityLabel(getTaskPriority(task))}
                                  </span>

                                  <span className="text-xs text-slate-400 font-semibold">
                                    Glisser
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </Layout>
  );
}