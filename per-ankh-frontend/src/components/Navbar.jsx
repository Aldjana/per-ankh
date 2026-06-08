import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiSearch, FiBell } from "react-icons/fi";
import { useState } from "react";
import { getRouteMeta } from "../config/navigation";

export default function Navbar({ onMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const meta = getRouteMeta(location.pathname);
  const isSearchPage = location.pathname === "/search";

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/search${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="h-[4.25rem] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Ouvrir le menu"
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition shrink-0"
          >
            <FiMenu className="text-xl" />
          </button>

          <div className="min-w-0 hidden sm:block">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider truncate">
              {meta.section}
            </p>
            <h2 className="text-lg font-black text-slate-900 truncate leading-tight">
              {meta.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isSearchPage && (
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="h-10 w-56 lg:w-64 bg-slate-100/90 rounded-xl px-3 flex items-center gap-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition">
                <FiSearch className="text-slate-400 shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une tâche…"
                  className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </form>
          )}

          <button
            type="button"
            onClick={() => navigate("/search")}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
            aria-label="Recherche"
          >
            <FiSearch />
          </button>

          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              location.pathname === "/notifications"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-label="Notifications"
          >
            <FiBell />
          </button>
        </div>
      </div>
    </header>
  );
}
