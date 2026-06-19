import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",

  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }



    setLoading(true);

    try {
      const result = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });

      if (result?.session?.access_token) {
        navigate("/boards");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#07152f_0%,#173b92_55%,#173b92_100%)] flex items-center justify-center px-4 py-6 text-white">      <div className="w-full max-w-[390px] rounded-xl sm:rounded-2xl border border-white/20 bg-white/[0.13] backdrop-blur-xl shadow-2xl px-4 sm:px-6 py-5 sm:py-6">
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
          Créer un compte PER-ANKH
        </h2>

        <p className="mt-2 sm:mt-3 text-[13px] sm:text-[14px] leading-6 text-blue-100/75 font-semibold">
          Rejoignez votre espace de travail et commencez à collaborer
          efficacement.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-3">
        <div>
          <label className="block text-[11px] sm:text-xs font-bold mb-2">
            Nom complet
          </label>

          <div className="h-[44px] rounded-lg sm:rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
            <FiUser className="text-[16px] sm:text-[17px] text-blue-200/75 shrink-0" />

            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Aldjana Seck"
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-bold mb-2">Email</label>

          <div className="h-[44px] rounded-lg sm:rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
            <FiMail className="text-[16px] sm:text-[17px] text-blue-200/75 shrink-0" />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@gmail.com"
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-bold mb-2">
            Mot de passe
          </label>

          <div className="h-[44px] rounded-lg sm:rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
            <FiLock className="text-[16px] sm:text-[17px] text-blue-200/75 shrink-0" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 caractères"
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
            />



          </div>
        </div>



        <button
          type="submit"
          disabled={loading}
          className="mt-3 sm:mt-4 w-full h-[44px] sm:h-[48px] rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs sm:text-sm shadow-xl shadow-slate-950/30 hover:scale-[1.01] transition disabled:opacity-60 flex items-center justify-center gap-2 sm:gap-3"
        >
          {loading ? "Création..." : "Créer mon compte"}
          {!loading && <FiArrowRight className="text-lg" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-blue-100/70">
        Vous avez déjà un compte ?{" "}
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