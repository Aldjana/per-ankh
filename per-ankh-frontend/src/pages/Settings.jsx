import { FiUser, FiShield, FiZap } from "react-icons/fi";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../services/supabaseClient";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="max-w-2xl space-y-5">
        <PageHeader />

        <section className="card p-5 sm:p-6 space-y-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <FiUser />
            Mon compte
          </h2>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Email
            </p>
            <p className="font-bold text-slate-900 mt-1">
              {user?.email || "—"}
            </p>
            {user?.id && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-3">
                  ID utilisateur
                </p>
                <p className="text-sm font-mono text-slate-600 mt-1 break-all">
                  {user.id}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className="h-10 px-4 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition"
          >
            Se déconnecter
          </button>
        </section>
{/* 
        <section className="card p-5 sm:p-6 space-y-3">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <FiZap />
            Temps réel
          </h2>
          <p className="text-sm text-slate-600 leading-6">
            {isSupabaseConfigured()
              ? "Supabase Realtime est configuré. Le Kanban et les notifications se synchronisent automatiquement entre utilisateurs."
              : "Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env pour activer la synchronisation."}
          </p>
        </section> */}
{/* 
        <section className="card p-5 sm:p-6">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <FiShield />
            Sécurité
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-6">
            La réinitialisation  du mot de passe sera disponible lorsque la route
            API correspondante sera ajoutée au backend.
          </p>
        </section> */}
      </div>
    </Layout>
  );
}
