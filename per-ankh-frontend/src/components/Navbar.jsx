import { FiMenu, FiSearch, FiPlus } from "react-icons/fi";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200">
      <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="lg:hidden w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FiMenu />
          </button>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Tableau de bord
            </h2>
            <p className="text-sm text-slate-500">
              Bienvenue dans votre espace collaboratif.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="h-12 w-80 bg-slate-100 rounded-2xl px-4 flex items-center gap-3">
            <FiSearch className="text-slate-400 text-xl" />

            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          <button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black flex items-center gap-2 shadow-lg shadow-blue-100">
            <FiPlus />
            Nouveau
          </button>
        </div>
      </div>
    </header>
  );
}