import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import api from "../services/api";
import { toast } from "react-toastify";


export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
   
    let token = searchParams.get("access_token");
    let refresh = searchParams.get("refresh_token");

    
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get("access_token");
      refresh = hashParams.get("refresh_token");
    }

    if (token) {
      setAccessToken(token);
      console.log("Access token extrait avec succès");
    }
    if (refresh) {
      setRefreshToken(refresh);
      console.log("Refresh token extrait avec succès");
    }

    if (!token || !refresh) {
      console.log("Token non trouvé dans l'URL");
      console.log("URL complète:", window.location.href);
      console.log("Query params:", Object.fromEntries(searchParams));
      console.log("Hash:", window.location.hash);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit avoir au moins 8 caractères.");
      return;
    }

    if (!accessToken || !refreshToken) {
      setError("Tokens d'accès manquants. Veuillez réessayer depuis le lien envoyé par email.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { password }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken,
        },
      });
      setSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation.");
      toast.error(err.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#07152f_0%,#173b92_55%,#173b92_100%)] flex items-center justify-center px-4 py-6 text-white">  
      <div className="w-full max-w-[390px] rounded-xl sm:rounded-2xl border border-white/20 bg-white/[0.13] backdrop-blur-xl shadow-2xl px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] rounded-xl sm:rounded-[14px] bg-gradient-to-br from-[#3b82f6] to-[#8b2cff] flex items-center justify-center text-[22px] sm:text-[26px] font-semibold shadow-xl">
            P
          </div>

          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-wide leading-none">
            PER-ANKH
          </h1>
        </div>

        <div className="mt-5 sm:mt-7">
          <h2 className="text-[20px] sm:text-[24px] font-bold leading-tight">
            Réinitialiser le mot de passe
          </h2>

          <p className="mt-2 sm:mt-3 text-[13px] sm:text-[14px] leading-6 text-blue-100/75 font-semibold">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-5 sm:mt-7">
            <div className="rounded-xl border border-green-300/30 bg-green-500/15 px-4 py-4 text-center">
              <FiCheckCircle className="mx-auto text-2xl text-green-300 mb-2" />
              <p className="text-xs text-green-100 font-semibold">
                Mot de passe réinitialisé avec succès !
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 w-full h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl bg-gradient-to-r from-[#3185ff] to-[#8b2cff] font-bold text-xs sm:text-sm shadow-xl shadow-blue-950/30 hover:scale-[1.01] transition"
            >
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 sm:mt-7">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold mb-2">
                Nouveau mot de passe
              </label>

              <div className="h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
                <FiLock className="text-[16px] sm:text-[17px] text-blue-200/75 shrink-0" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-200/75 hover:text-white transition shrink-0"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <label className="block text-[11px] sm:text-xs font-bold mb-2">
                Confirmer le mot de passe
              </label>

              <div className="h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
                <FiLock className="text-[16px] sm:text-[17px] text-blue-200/75 shrink-0" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-blue-200/75 hover:text-white transition shrink-0"
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 sm:mt-6 w-full h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl bg-gradient-to-r from-[#3185ff] to-[#8b2cff] font-bold text-xs sm:text-sm shadow-xl shadow-blue-950/30 hover:scale-[1.01] transition disabled:opacity-60"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
