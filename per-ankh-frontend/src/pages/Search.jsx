import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiCheckSquare,
  FiLoader,
  FiFlag,
  FiTag,
  FiUser,
} from "react-icons/fi";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { getWorkspaces } from "../services/workspaceService";
import { getWorkspaceMembers } from "../services/memberService";
import { searchTasks } from "../services/searchService";
import { getWorkspaceId, getWorkspaceName } from "../utils/workspace";

export default function Search() {
  const [searchParams] = useSearchParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [members, setMembers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    workspace_id: "",
    q: "",
    priority: "",
    assigned_to: "",
    tag: "",
    status: "",
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setFilters((f) => ({ ...f, q }));
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const list = await getWorkspaces();
      const safe = Array.isArray(list) ? list : [];
      setWorkspaces(safe);
      if (safe.length > 0) {
        setFilters((f) => ({ ...f, workspace_id: getWorkspaceId(safe[0]) }));
      }
    })();
  }, []);

  useEffect(() => {
    if (!filters.workspace_id) return;

    (async () => {
      try {
        const list = await getWorkspaceMembers(filters.workspace_id);
        setMembers(Array.isArray(list) ? list : []);
      } catch {
        setMembers([]);
      }
    })();
  }, [filters.workspace_id]);

  const handleSearch = async (e) => {
    e?.preventDefault();

    if (!filters.workspace_id) {
      setError("Choisissez un workspace.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = { workspace_id: filters.workspace_id };
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.priority) params.priority = filters.priority;
      if (filters.assigned_to) params.assigned_to = filters.assigned_to;
      if (filters.tag.trim()) params.tag = filters.tag.trim();
      if (filters.status) params.status = filters.status;

      const tasks = await searchTasks(params);
      setResults(tasks);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la recherche.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const priorityLabel = (p) => {
    if (p === "high") return "Haute";
    if (p === "low") return "Basse";
    return "Moyenne";
  };

  return (
    <Layout>
      <div className="space-y-5">
        <PageHeader />

        <section className="card p-4 sm:p-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <select
                value={filters.workspace_id}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, workspace_id: e.target.value }))
                }
                className="h-12 bg-slate-100 rounded-2xl px-4 outline-none text-sm font-semibold"
              >
                <option value="">Workspace</option>
                {workspaces.map((w, i) => (
                  <option key={getWorkspaceId(w) || i} value={getWorkspaceId(w)}>
                    {getWorkspaceName(w)}
                  </option>
                ))}
              </select>

              <div className="h-12 bg-slate-100 rounded-2xl px-4 flex items-center gap-3">
                <FiSearch className="text-slate-400" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, q: e.target.value }))
                  }
                  placeholder="Titre ou description..."
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priority: e.target.value }))
                }
                className="h-11 bg-slate-100 rounded-2xl px-4 text-sm font-semibold outline-none"
              >
                <option value="">Priorité</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>

              <select
                value={filters.assigned_to}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, assigned_to: e.target.value }))
                }
                className="h-11 bg-slate-100 rounded-2xl px-4 text-sm font-semibold outline-none"
              >
                <option value="">Assigné à</option>
                {members.map((m, i) => (
                  <option
                    key={m.id || i}
                    value={m.user_id || m.profiles?.id}
                  >
                    {m.profiles?.full_name || m.user_id}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={filters.tag}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tag: e.target.value }))
                }
                placeholder="Tag"
                className="h-11 bg-slate-100 rounded-2xl px-4 text-sm outline-none"
              />

              <input
                type="text"
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                placeholder="Statut"
                className="h-11 bg-slate-100 rounded-2xl px-4 text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiSearch />}
              Rechercher
            </button>
          </form>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        <section className="space-y-3">
          <p className="text-sm font-bold text-slate-500">
            {results.length} résultat(s)
          </p>

          {loading ? (
            <div className="bg-white rounded-3xl border p-10 flex justify-center">
              <FiLoader className="animate-spin text-3xl text-slate-400" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-3xl border p-10 text-center text-slate-500">
              Lancez une recherche pour afficher les tâches.
            </div>
          ) : (
            results.map((task, index) => (
              <div
                key={task.id || index}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center text-xl">
                    <FiCheckSquare />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900">{task.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {task.description || "—"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <FiFlag />
                        {priorityLabel(task.priority)}
                      </span>
                      {task.assigned_to_profile?.full_name && (
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full inline-flex items-center gap-1">
                          <FiUser />
                          {task.assigned_to_profile.full_name}
                        </span>
                      )}
                      {Array.isArray(task.tags) &&
                        task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full inline-flex items-center gap-1"
                          >
                            <FiTag />
                            {tag}
                          </span>
                        ))}
                      {task.kanban_columns?.title && (
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                          {task.kanban_columns.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
}
