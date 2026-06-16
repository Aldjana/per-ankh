import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiPlus, FiLoader, FiTrash2, FiShield } from "react-icons/fi";
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember,
} from "../../services/memberService";

export default function BoardMembersTab() {
  const { workspaceId } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const list = await getWorkspaceMembers(workspaceId);
      setMembers(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await addWorkspaceMember({
        workspace_id: workspaceId,
        user_id: userId.trim(),
        role,
      });
      setUserId("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <FiLoader className="animate-spin text-3xl" />
      </div>
    );
  }

  return (
    <div className="card p-5 max-w-3xl space-y-6">
     
      {error && (
        <p className="text-sm text-red-600 font-semibold">{error}</p>
      )}
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="ID utilisateur "
          className="flex-1 min-w-[200px] h-10 rounded-lg border border-slate-200 px-3 text-sm"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-primary h-10">
          <FiPlus /> Ajouter
        </button>
      </form>
      <ul className="divide-y divide-slate-100">
        {members.map((m) => (
          <li
            key={m.id}
            className="py-3 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-bold text-slate-900">
                {m.profiles?.full_name || "Membre"}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {m.user_id || m.profiles?.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {m.role === "owner" ? (
                <span className="text-xs font-bold text-violet-700 flex items-center gap-1">
                  <FiShield /> Owner
                </span>
              ) : (
                <>
                  <select
                    value={m.role}
                    onChange={(e) =>
                      updateMemberRole(m.id, e.target.value).then(load)
                    }
                    className="h-9 rounded-lg border border-slate-200 text-sm px-2"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeWorkspaceMember(m.id).then(load)}
                    className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"
                  >
                    <FiTrash2 />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
