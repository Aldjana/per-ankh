import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronDown,
  FiLoader,
  FiSearch,
  FiShare2,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { getWorkspaceById } from "../services/workspaceService";
import { getWorkspaceMembers } from "../services/memberService";
import { getWorkspaceName } from "../utils/workspace";
import { BOARD_TABS } from "../config/navigation";

export default function Board() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const [data, memberList] = await Promise.all([
        getWorkspaceById(workspaceId),
        getWorkspaceMembers(workspaceId).catch(() => []),
      ]);
      setWorkspace(data?.workspace || data);
      setMembers(Array.isArray(memberList) ? memberList : []);
    } catch {
      setWorkspace({ id: workspaceId, name: "Projet" });
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const name = workspace ? getWorkspaceName(workspace) : "Projet";

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("workspace_id", workspaceId);
    if (search.trim()) params.set("q", search.trim());
    navigate(`/search?${params}`);
  };

  return (
    <Layout fullWidth hideNavbar>
      <div className="flex flex-col min-h-screen bg-[#f0f2f8]">
        {/* En-tête projet — style capture */}
        <header className="shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 pt-4 pb-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/boards"
                className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center shrink-0"
                title="Retour"
              >
                <FiArrowLeft />
              </Link>
              <div className="min-w-0">
                {loading ? (
                  <FiLoader className="animate-spin text-slate-400" />
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-left group"
                  >
                    <h1 className="text-xl font-black text-slate-900 truncate group-hover:text-blue-700 transition">
                      {name}
                    </h1>
                    <FiChevronDown className="text-slate-400 shrink-0" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="h-10 bg-slate-100 rounded-xl px-3 flex items-center gap-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition">
                <FiSearch className="text-slate-400 shrink-0" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher des tâches…"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </form>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((m, i) => (
                  <div
                    key={m.id || i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-white"
                    title={m.profiles?.full_name || "Membre"}
                  >
                    {(m.profiles?.full_name || "M").charAt(0)}
                  </div>
                ))}
                {members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition"
              >
                <FiShare2 />
                Partager
              </button>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 pt-1 -mb-px">
            {BOARD_TABS.map((tab) => (
              <NavLink
                key={tab.id}
                to={
                  tab.path
                    ? `/board/${workspaceId}/${tab.path}`
                    : `/board/${workspaceId}`
                }
                end={tab.id === "board"}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition ${
                    isActive
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet
            context={{ workspaceId, workspace, refreshWorkspace: loadWorkspace }}
          />
        </div>
      </div>
    </Layout>
  );
}
