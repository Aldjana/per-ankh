import { FiUser, FiMail, FiCheck, FiLogOut } from "react-icons/fi";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Settings() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/me");
        setProfile(response.data.user);
      } catch (err) {
        console.error("Erreur au chargement du profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fullName = profile?.user_metadata?.full_name || user?.email || "Utilisateur";
  const avatarInitial = fullName.charAt(0).toUpperCase();

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <PageHeader />

        <section className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-slate-500">Chargement...</div>
          ) : (
            <>
              {/* Header Background */}
              <div className="h-24 bg-white"></div>

              {/* Content */}
              <div className="px-6 sm:px-8 pb-8">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 relative z-10 mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-black text-4xl shadow-lg border-4 border-white">
                    {avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                      Profil Utilisateur
                    </p>
                    <p className="text-3xl font-black text-slate-900 mt-1">
                      {fullName}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Compte actif
                    </p>
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-4 border-t border-slate-100 pt-8">
                  {/* Email */}
                  <div className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FiMail className="text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Email
                      </p>
                      <p className="font-semibold text-slate-900 mt-1 break-all">
                        {user?.email || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={logout}
                    className="h-11 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition flex items-center gap-2"
                  >
                    <FiLogOut />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
