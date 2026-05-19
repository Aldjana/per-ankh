import { useEffect, useState } from "react";
import {
  FiFolder,
  FiCheckSquare,
  FiFileText,
  FiUsers,
  FiClock,
  FiActivity,
  FiLoader,
} from "react-icons/fi";
import Layout from "../components/Layout";
import { getDashboardData } from "../services/dashboardService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    workspaces: [],
    tasks: [],
    notes: [],
    members: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const data = await getDashboardData();

      console.log("DASHBOARD DATA :", data);

      setDashboardData({
        workspaces: Array.isArray(data.workspaces) ? data.workspaces : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        notes: Array.isArray(data.notes) ? data.notes : [],
        members: Array.isArray(data.members) ? data.members : [],
      });
    } catch (error) {
      console.log("ERREUR DASHBOARD :", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const getWorkspaceDescription = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.description ||
      item?.desc ||
      item?.details ||
      item?.workspace_description ||
      item?.workspaceDescription ||
      item?.workspace?.description ||
      "Aucune description."
    );
  };

  const getWorkspaceDate = (workspace) => {
    const item = getRealWorkspace(workspace);

    return (
      item?.created_at ||
      item?.createdAt ||
      item?.created_date ||
      item?.date_creation ||
      item?.inserted_at ||
      item?.workspace?.created_at ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stats = [
    {
      title: "Workspaces",
      value: dashboardData.workspaces.length,
      icon: <FiFolder />,
      color: "from-blue-500 to-cyan-500",
      text: "Espaces actifs",
    },
    {
      title: "Tâches",
      value: dashboardData.tasks.length,
      icon: <FiCheckSquare />,
      color: "from-violet-500 to-purple-500",
      text: "Tâches enregistrées",
    },
    {
      title: "Notes",
      value: dashboardData.notes.length,
      icon: <FiFileText />,
      color: "from-emerald-500 to-teal-500",
      text: "Notes créées",
    },
    {
      title: "Membres",
      value: dashboardData.members.length,
      icon: <FiUsers />,
      color: "from-orange-500 to-amber-500",
      text: "Collaborateurs",
    },
  ];

  const recentWorkspaces = dashboardData.workspaces.slice(0, 3);

  return (
    <Layout>
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-slate-500">
          <FiLoader className="text-3xl animate-spin mb-3" />
          Chargement du dashboard...
        </div>
      ) : (
        <>
          <section className="rounded-3xl bg-gradient-to-r from-[#07152f] via-blue-800 to-violet-700 text-white p-6 sm:p-8 shadow-xl overflow-hidden relative">
            <div className="absolute right-[-70px] top-[-70px] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute left-[-80px] bottom-[-80px] w-64 h-64 bg-blue-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 max-w-4xl">
              <p className="text-blue-100 font-semibold">
                Plateforme collaborative temps réel
              </p>

              <h1 className="text-3xl sm:text-4xl font-black mt-3 leading-tight">
                Organisez vos projets, vos tâches et votre équipe avec PER-ANKH.
              </h1>

              <p className="text-blue-100 mt-4 leading-7 max-w-3xl">
                Centralisez les workspaces, le Kanban, les notes, les fichiers
                et les notifications dans une interface moderne et professionnelle.
              </p>
            </div>
          </section>

          <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
            {stats.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-semibold">
                      {item.title}
                    </p>

                    <h3 className="text-4xl font-black mt-2 text-slate-950">
                      {String(item.value).padStart(2, "0")}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">{item.text}</p>
                  </div>

                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center text-3xl shadow-lg`}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="grid xl:grid-cols-[1.4fr_0.8fr] gap-6 mt-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Workspaces récents
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Vos derniers espaces de travail créés.
                  </p>
                </div>

                <button className="text-blue-600 font-bold text-sm hover:underline">
                  Voir tout
                </button>
              </div>

              {recentWorkspaces.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto">
                    <FiFolder />
                  </div>

                  <h4 className="font-black text-slate-900 mt-4">
                    Aucun workspace
                  </h4>

                  <p className="text-sm text-slate-500 mt-2">
                    Créez un workspace pour le voir ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentWorkspaces.map((workspace, index) => (
                    <div
                      key={getRealWorkspace(workspace)?.id || index}
                      className="border border-slate-100 rounded-2xl p-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-black text-slate-900">
                            {getWorkspaceName(workspace)}
                          </h4>

                          <p className="text-sm text-slate-500 mt-1">
                            {getWorkspaceDescription(workspace)}
                          </p>
                        </div>

                        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full whitespace-nowrap">
                          Actif
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <FiClock />
                        Créé le {formatDate(getWorkspaceDate(workspace))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-xl font-black text-slate-900">
                Résumé de l’activité
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                État actuel de votre espace PER-ANKH.
              </p>

              <div className="mt-6 space-y-5">
                <Activity
                  icon={<FiFolder />}
                  color="bg-blue-100 text-blue-600"
                  title={`${dashboardData.workspaces.length} workspace(s) créé(s)`}
                  time="Synchronisé avec le backend"
                />

                <Activity
                  icon={<FiCheckSquare />}
                  color="bg-violet-100 text-violet-600"
                  title={`${dashboardData.tasks.length} tâche(s) enregistrée(s)`}
                  time="Données backend"
                />

                <Activity
                  icon={<FiFileText />}
                  color="bg-emerald-100 text-emerald-600"
                  title={`${dashboardData.notes.length} note(s) ajoutée(s)`}
                  time="Données backend"
                />

                <Activity
                  icon={<FiUsers />}
                  color="bg-orange-100 text-orange-600"
                  title={`${dashboardData.members.length} membre(s)`}
                  time="Données backend"
                />
              </div>

              <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center">
                    <FiActivity />
                  </div>

                  <div>
                    <p className="font-black text-sm text-slate-900">
                      Statut du système
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Backend Express et Supabase connectés
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}

function Activity({ icon, color, title, time }) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>

      <div>
        <p className="font-bold text-sm text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
}