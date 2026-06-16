import { supabase, supabaseAdmin } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";

// Validation regex pour email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// INSCRIPTION
export const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({
                message: "Email, mot de passe et nom complet sont obligatoires.",
            });
        }

        // Valider le format de l'email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Adresse email invalide.",
            });
        }

        // Valider la longueur du mot de passe
        if (password.length < 8) {
            return res.status(400).json({
                message: "Le mot de passe doit avoir au moins 8 caractères.",
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                },
            },
        });

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        // Ajouter l'utilisateur dans la table profiles
        if (data.user) {
            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .upsert([
                    {
                        id: data.user.id,
                        full_name,
                    },
                ]);

            if (profileError) {
                return res.status(400).json({
                    message: profileError.message,
                });
            }
        }

        return res.status(201).json({
            message: "Utilisateur créé avec succès.",
            user: data.user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur serveur.",
            error: error.message,
        });
    }
};

// CONNEXION
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email et mot de passe sont obligatoires.",
            });
        }

        // Valider le format de l'email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Adresse email invalide",
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message === "Invalid login credentials") {
                return res.status(401).json({
                    message: "Email ou mot de passe incorrect.",
                });
            }

            return res.status(401).json({
                message: "Erreur lors de la connexion.",
            });
        }

        return res.status(200).json({
            message: "Connexion réussie.",
            session: data.session,
            user: data.user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur serveur.",
            error: error.message,
        });
    }
};

// DÉCONNEXION
export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(200).json({
            message: "Déconnexion réussie.",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur serveur.",
            error: error.message,
        });
    }
};

// DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email est obligatoire.",
            });
        }

        // Valider le format de l'email
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Adresse email invalide.",
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(200).json({
            message: "Si l'email existe, un lien de réinitialisation a été envoyé.",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur serveur.",
            error: error.message,
        });
    }
};

// CONFIRMATION DE RÉINITIALISATION DE MOT DE PASSE
export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Mot de passe est obligatoire.",
            });
        }

        // Valider la longueur du mot de passe
        if (password.length < 8) {
            return res.status(400).json({
                message: "Le mot de passe doit avoir au moins 8 caractères.",
            });
        }

        // Récupérer le token d'accès depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Token d'accès manquant.",
            });
        }

        const accessToken = authHeader.substring(7);

        // Récupérer le refresh token depuis l'en-tête X-Refresh-Token
        const refreshToken = req.headers['x-refresh-token'];
        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token manquant.",
            });
        }

        // Créer un client Supabase avec le token d'accès temporaire
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Définir la session avec le token de récupération
        const { data: sessionData, error: sessionError } = await supabaseWithToken.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (sessionError) {
            return res.status(400).json({
                message: sessionError.message,
            });
        }

        // Maintenant mettre à jour le mot de passe
        const { data, error } = await supabaseWithToken.auth.updateUser({
            password: password,
        });

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(200).json({
            message: "Mot de passe réinitialisé avec succès.",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur serveur.",
            error: error.message,
        });
    }
};