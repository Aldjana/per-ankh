import { supabase } from "../config/supabase.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Accès refusé. Token manquant.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        message: "Token invalide ou expiré.",
      });
    }

    req.user = data.user;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur dans le middleware.",
      error: error.message,
    });
  }
};