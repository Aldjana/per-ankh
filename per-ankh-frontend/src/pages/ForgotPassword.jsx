import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";


export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success("Lien de réinitialisation envoyé avec succès.");
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'email.");
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#07152f_0%,#173b92_55%,#173b92_100%)] flex items-center justify-center px-4 py-6 text-white">  
      <div className="w-full max-w-[390px] rounded-xl sm:rounded-2xl border border-white/20 bg-white/[0.13] backdrop-blur-xl shadow-2xl px-4 sm:px-6 py-5 sm:py-6">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-blue-200/80 hover:text-white transition text-xs sm:text-sm mb-4"
        >
          <FiArrowLeft size={16} />
          Retour
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] rounded-xl sm:rounded-[14px] bg-slate-800 flex items-center justify-center text-[22px] sm:text-[26px] font-semibold shadow-xl">
            P
          </div>

          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-wide leading-none">
            PER-ANKH
          </h1>
        </div>

        <div className="mt-5 sm:mt-7">
          <h2 className="text-[20px] sm:text-[24px] font-bold leading-tight">
            Mot de passe oublié ?
          </h2>

          <p className="mt-2 sm:mt-3 text-[13px] sm:text-[14px] leading-6 text-blue-100/75 font-semibold">
            Entrez votre adresse email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-5 sm:mt-7">
            {/* <div className="rounded-xl border border-green-300/30 bg-green-500/15 px-4 py-4 text-center">
              <FiCheckCircle className="mx-auto text-2xl text-green-300 mb-2" />
              <p className="text-xs text-green-100 font-semibold">
                Si l'email existe, un lien de réinitialisation a été envoyé à
                votre adresse email.
              </p>
            </div> */}
            <button
              onClick={() => navigate("/login")}
              className="mt-4 w-full h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs sm:text-sm shadow-xl shadow-slate-950/30 hover:scale-[1.01] transition flex items-center justify-center gap-2 sm:gap-3"
            >
              Retour à la connexion
              <FiArrowRight className="text-base sm:text-lg" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 sm:mt-7">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold mb-2">
                Email
              </label>

              <div className="h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
                <FiMail className="text-[16px] sm:text-[17px] text-blue-200/75 shrink-0" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 sm:mt-6 w-full h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs sm:text-sm shadow-xl shadow-slate-950/30 hover:scale-[1.01] transition disabled:opacity-60 flex items-center justify-center gap-2 sm:gap-3"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
              {!loading && <FiArrowRight className="text-base sm:text-lg" />}
            </button>
          </form>
        )}

        <p className="mt-5 sm:mt-7 text-center text-[11px] sm:text-xs text-blue-100/70">
          Vous vous souvenez de votre mot de passe ?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-blue-200 hover:text-white"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
