import { FiLogOut, FiX } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS, FOOTER_NAV } from "../config/navigation";

const iconLinkClass = ({ isActive }) =>
  `w-11 h-11 rounded-xl flex items-center justify-center text-lg transition ${
    isActive
      ? "bg-white text-brand-950 shadow-md"
      : "text-slate-400 hover:bg-white/10 hover:text-white"
  }`;

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onMobileClose?.();
  };

  const initials = (user?.email || "U").charAt(0).toUpperCase();

  const panel = (
    <div className="flex flex-col h-full items-center py-4">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-black text-white shadow-lg mb-6 shrink-0">
        P
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1.5 w-full px-2">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.path}-${index}`}
              to={item.path}
              title={item.label}
              className={iconLinkClass}
              onClick={onMobileClose}
            >
              <Icon />
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2 shrink-0 px-2">
        {FOOTER_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={iconLinkClass}
              onClick={onMobileClose}
            >
              <Icon />
            </NavLink>
          );
        })}

        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-black text-white mt-2"
          title={user?.email}
        >
          {initials}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Déconnexion"
          className="w-9 h-9 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 z-50 h-screen w-[72px] bg-brand-950 border-r border-white/5">
        {panel}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[72px] bg-brand-950 shadow-2xl">
            {panel}
          </aside>
          <button
            type="button"
            onClick={onMobileClose}
            className="absolute top-4 left-20 w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow"
          >
            <FiX />
          </button>
        </div>
      )}
    </>
  );
}
