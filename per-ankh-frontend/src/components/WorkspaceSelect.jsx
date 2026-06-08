/** Sélecteur de workspace réutilisable dans les pages métier */
export default function WorkspaceSelect({
  workspaces,
  value,
  onChange,
  getId,
  getName,
  className = "",
}) {
  return (
    <div
      className={`h-11 bg-slate-50 rounded-xl px-4 flex items-center border border-slate-200/80 ${className}`}
    >
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none text-sm font-semibold text-slate-700"
      >
        <option value="">Choisir un workspace</option>
        {workspaces.map((workspace, index) => (
          <option key={getId(workspace) || index} value={getId(workspace)}>
            {getName(workspace)}
          </option>
        ))}
      </select>
    </div>
  );
}
