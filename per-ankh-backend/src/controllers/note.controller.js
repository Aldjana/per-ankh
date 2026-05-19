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

// CRÉER UNE NOTE
export const createNote = async (req, res) => {
  try {
    const { workspace_id, title, content, mentions } = req.body;
    const userId = req.user.id;

    if (!workspace_id || !title) {
      return res.status(400).json({
        message: "workspace_id et title sont obligatoires.",
      });
    }

    const member = await checkWorkspaceMember(workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("notes")
      .insert([
        {
          workspace_id,
          title,
          content,
          mentions: mentions || [],
          created_by: userId,
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
      message: "Note créée avec succès.",
      note: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER LES NOTES D’UN WORKSPACE
export const getNotesByWorkspace = async (req, res) => {
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
      .from("notes")
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Liste des notes.",
      notes: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER UNE SEULE NOTE
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: note, error: noteError } = await supabaseAdmin
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (noteError || !note) {
      return res.status(404).json({
        message: "Note introuvable.",
      });
    }

    const member = await checkWorkspaceMember(note.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    return res.status(200).json({
      message: "Détails de la note.",
      note,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MODIFIER UNE NOTE
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mentions } = req.body;
    const userId = req.user.id;

    const { data: note, error: noteError } = await supabaseAdmin
      .from("notes")
      .select("workspace_id")
      .eq("id", id)
      .single();

    if (noteError || !note) {
      return res.status(404).json({
        message: "Note introuvable.",
      });
    }

    const member = await checkWorkspaceMember(note.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("notes")
      .update({
        title,
        content,
        mentions,
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
      message: "Note modifiée avec succès.",
      note: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UNE NOTE
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: note, error: noteError } = await supabaseAdmin
      .from("notes")
      .select("workspace_id, created_by")
      .eq("id", id)
      .single();

    if (noteError || !note) {
      return res.status(404).json({
        message: "Note introuvable.",
      });
    }

    const member = await checkWorkspaceMember(note.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    // Seul le créateur, owner ou admin peut supprimer
    if (
      note.created_by !== userId &&
      !["owner", "admin"].includes(member.role)
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de supprimer cette note.",
      });
    }

    const { error } = await supabaseAdmin
      .from("notes")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Note supprimée avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};