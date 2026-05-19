import {
    FiGrid,
    FiFolder,
    FiCheckSquare,
    FiColumns,
    FiFileText,
    FiBell,
    FiSettings,
    FiLogOut,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        {
            label: "Dashboard",
            icon: <FiGrid />,
            path: "/dashboard",
        },
        {
            label: "Workspaces",
            icon: <FiFolder />,
            path: "/workspaces",
        },
        {
            label: "Tâches",
            icon: <FiCheckSquare />,
            path: "/tasks",
        },
        {
            label: "Kanban",
            icon: <FiColumns />,
            path: "/kanban",
        },
        {
            label: "Notes",
            icon: <FiFileText />,
            path: "/notes",
        },
        {
            label: "Notifications",
            icon: <FiBell />,
            path: "/notifications",
        },
        {
            label: "Paramètres",
            icon: <FiSettings />,
            path: "/settings",
        },
    ];

    return (
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-[#07152f] text-white flex-col justify-between z-50">
            <div>
                {/* LOGO */}
                <div className="px-6 pt-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-2xl font-black shadow-lg">
                            P
                        </div>

                        <div>
                            <h1 className="text-2xl font-black leading-none">PER-ANKH</h1>
                            <p className="text-xs text-blue-200 mt-1">
                                Workspace Manager
                            </p>
                        </div>
                    </div>
                </div>

                {/* MENU */}
                <nav className="px-4 py-5 space-y-1.5">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition ${isActive
                                    ? "bg-white text-[#07152f]"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                }`
                            }
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* PROFIL + DÉCONNEXION */}
            <div className="px-4 pb-4">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-3 mb-3">
                    <p className="text-xs text-blue-100">Connecté avec</p>
                    <p className="text-sm font-black mt-1 truncate">
                        {user?.email || "Utilisateur"}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black px-4 py-3 rounded-2xl transition"
                >
                    <FiLogOut />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}