import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () =>
  Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("votre-projet") &&
      supabaseAnonKey !== "votre_cle_anon"
  );

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Authentifier le client Supabase avec le JWT token
export const authenticateSupabaseClient = async (token) => {
  if (!supabase || !token) return;
  
  try {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });
  } catch (err) {
    console.error('Erreur lors de l\'authentification Supabase:', err);
  }
};
