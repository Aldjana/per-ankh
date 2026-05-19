import { supabaseAdmin } from "../config/supabase.js";

// Vérifier si l'utilisateur est membre du workspace
const checkWorkspaceMember = async (workspaceId, userId) => {
  const { data, error } = await supabaseAdmin
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};

// RECHERCHE ET FILTRES DES TÂCHES
export const searchTasks = async (req, res) => {
  try {
    const { workspace_id, q, status, assigned_to, tag, priority } = req.query;
    const userId = req.user.id;

    if (!workspace_id) {
      return res.status(400).json({
        message: "workspace_id est obligatoire.",
      });
    }

    const member = await checkWorkspaceMember(workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    let query = supabaseAdmin
      .from("tasks")
      .select(`
        *,
        assigned_to_profile:profiles!tasks_assigned_to_fkey (
          id,
          full_name,
          avatar_url
        ),
        created_by_profile:profiles!tasks_created_by_fkey (
          id,
          full_name,
          avatar_url
        ),
        kanban_columns (
          id,
          title
        )
      `)
      .eq("workspace_id", workspace_id);

    // Recherche par titre ou description
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Filtrer par statut
    if (status) {
      query = query.eq("status", status);
    }

    // Filtrer par utilisateur assigné
    if (assigned_to) {
      query = query.eq("assigned_to", assigned_to);
    }

    // Filtrer par priorité
    if (priority) {
      query = query.eq("priority", priority);
    }

    // Filtrer par tag
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Résultats de recherche.",
      count: data.length,
      tasks: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};