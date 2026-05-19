import { supabase, supabaseAdmin } from "../config/supabase.js";
// INSCRIPTION
export const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({
                message: "Email, mot de passe et nom complet sont obligatoires.",
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

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                message: error.message,
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