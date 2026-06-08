import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
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
    setLoading(true);

    try {
      await login(formData);
      navigate("/boards");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#07152f_0%,#173b92_55%,#4b1392_100%)] flex items-center justify-center px-4 py-6 text-white">
      <div className="w-full max-w-[390px] rounded-[18px] border border-white/20 bg-white/[0.13] backdrop-blur-xl shadow-2xl px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] rounded-[14px] bg-gradient-to-br from-[#3b82f6] to-[#8b2cff] flex items-center justify-center text-[26px] font-semibold shadow-xl">
            P
          </div>

          <h1 className="text-[28px] font-bold tracking-wide leading-none">
            PER-ANKH
          </h1>
        </div>

        <div className="mt-7">
          <h2 className="text-[24px] font-bold leading-tight">
            Bienvenue sur PER-ANKH
          </h2>

          <p className="mt-3 text-[14px] leading-6 text-blue-100/75 font-semibold">
            Connectez-vous pour gérer vos projets et collaborer avec votre
            équipe.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7">
          <div>
            <label className="block text-xs font-bold mb-2.5">Email</label>

            <div className="h-[48px] rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
              <FiMail className="text-[17px] text-blue-200/75" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold mb-2.5">
              Mot de passe
            </label>

            <div className="h-[48px] rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
              <FiLock className="text-[17px] text-blue-200/75" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-blue-200/75 hover:text-white transition"
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>

            <div className="text-right mt-3">
              <button
                type="button"
                className="text-xs text-blue-200/80 hover:text-white transition"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full h-[48px] rounded-xl bg-gradient-to-r from-[#3185ff] to-[#8b2cff] font-bold text-sm shadow-xl shadow-blue-950/30 hover:scale-[1.01] transition disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {loading ? "Connexion..." : "Se connecter"}
            {!loading && <FiArrowRight className="text-lg" />}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-blue-100/70">
          Vous n'avez pas de compte ?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-blue-200 hover:text-white"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}