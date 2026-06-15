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

// Extraire les mentions (@username ou @nom complet) du contenu
const extractMentions = (content) => {
  const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
  const matches = content.matchAll(mentionRegex);
  const mentions = [];
  for (const match of matches) {
    mentions.push(match[1].trim());
  }
  return [...new Set(mentions)]; // Déduplique les mentions
};

// Créer des notifications pour les mentions
const createMentionNotifications = async (
  workspaceId,
  mentionedUsernames,
  authorId,
  noteId
) => {
  if (!Array.isArray(mentionedUsernames) || mentionedUsernames.length === 0) {
    return;
  }

  try {
    // Chercher les profils avec ces usernames
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("full_name", mentionedUsernames);

    if (profileError || !profiles) {
      return;
    }

    // Créer les notifications
    const notifications = profiles
      .filter((p) => p.id !== authorId) // Ne pas notifier l'auteur
      .map((p) => ({
        user_id: p.id,
        workspace_id: workspaceId,
        type: "mention",
        title: "Vous avez été mentionné",
        message: `Vous avez été mentionné dans une note`,
        is_read: false,
      }));

    if (notifications.length > 0) {
      await supabaseAdmin.from("notifications").insert(notifications);
    }
  } catch (err) {
    console.error("Erreur lors de la création des notifications de mention:", err);
  }
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

    // Créer des notifications pour les mentions
    const extractedMentions = extractMentions(content || "");
    if (extractedMentions.length > 0) {
      await createMentionNotifications(
        workspace_id,
        extractedMentions,
        userId,
        data.id
      );
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

    // Créer des notifications pour les mentions
    const extractedMentions = extractMentions(content || "");
    if (extractedMentions.length > 0) {
      await createMentionNotifications(
        note.workspace_id,
        extractedMentions,
        note.created_by,
        id
      );
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