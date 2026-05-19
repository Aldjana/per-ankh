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

// RÉCUPÉRER LES COLONNES D’UN WORKSPACE
export const getColumnsByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const member = await checkWorkspaceMember(workspaceId, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("kanban_columns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Liste des colonnes Kanban.",
      columns: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// CRÉER UNE COLONNE
export const createColumn = async (req, res) => {
  try {
    const { workspace_id, title, position } = req.body;
    const userId = req.user.id;

    if (!workspace_id || !title) {
      return res.status(400).json({
        message: "workspace_id et title sont obligatoires.",
      });
    }

    const member = await checkWorkspaceMember(workspace_id, userId);

    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de créer une colonne.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("kanban_columns")
      .insert([
        {
          workspace_id,
          title,
          position: position || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(201).json({
      message: "Colonne créée avec succès.",
      column: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MODIFIER UNE COLONNE
export const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, position } = req.body;
    const userId = req.user.id;

    const { data: column, error: columnError } = await supabaseAdmin
      .from("kanban_columns")
      .select("workspace_id")
      .eq("id", id)
      .single();

    if (columnError || !column) {
      return res.status(404).json({
        message: "Colonne introuvable.",
      });
    }

    const member = await checkWorkspaceMember(column.workspace_id, userId);

    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de modifier cette colonne.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("kanban_columns")
      .update({
        title,
        position,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Colonne modifiée avec succès.",
      column: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UNE COLONNE
export const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: column, error: columnError } = await supabaseAdmin
      .from("kanban_columns")
      .select("workspace_id")
      .eq("id", id)
      .single();

    if (columnError || !column) {
      return res.status(404).json({
        message: "Colonne introuvable.",
      });
    }

    const member = await checkWorkspaceMember(column.workspace_id, userId);

    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de supprimer cette colonne.",
      });
    }

    const { error } = await supabaseAdmin
      .from("kanban_columns")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Colonne supprimée avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};