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
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
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
        navigate("/dashboard");
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
            Créer un compte PER-ANKH
          </h2>

          <p className="mt-3 text-[14px] leading-6 text-blue-100/75 font-semibold">
            Rejoignez votre espace de travail et commencez à collaborer
            efficacement.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-2">
              Nom complet
            </label>

            <div className="h-[44px] rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
              <FiUser className="text-[17px] text-blue-200/75" />

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                required
                className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">Email</label>

            <div className="h-[44px] rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
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

          <div>
            <label className="block text-xs font-bold mb-2">
              Mot de passe
            </label>

            <div className="h-[44px] rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
              <FiLock className="text-[17px] text-blue-200/75" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
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
          </div>

          <div>
            <label className="block text-xs font-bold mb-2">
              Confirmer le mot de passe
            </label>

            <div className="h-[44px] rounded-xl border border-white/20 bg-white/[0.13] px-3 flex items-center gap-3 focus-within:border-blue-300 transition">
              <FiCheckCircle className="text-[17px] text-blue-200/75" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le mot de passe"
                required
                className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-blue-200/75 hover:text-white transition"
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={17} />
                ) : (
                  <FiEye size={17} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[48px] rounded-xl bg-gradient-to-r from-[#3185ff] to-[#8b2cff] font-bold text-sm shadow-xl shadow-blue-950/30 hover:scale-[1.01] transition disabled:opacity-60 flex items-center justify-center gap-3"
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