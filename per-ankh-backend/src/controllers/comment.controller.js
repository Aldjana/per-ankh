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

const normalizeUuid = (value) =>
  value === undefined || value === null || value === "null" ? null : value;

// CRÉER UN COMMENTAIRE
export const createComment = async (req, res) => {
  try {
    const { workspace_id, note_id, task_id, content, mentions } = req.body;
    const userId = req.user.id;
    const normalizedNoteId = normalizeUuid(note_id);
    const normalizedTaskId = normalizeUuid(task_id);

    if (!workspace_id || !content) {
      return res.status(400).json({
        message: "workspace_id et content sont obligatoires.",
      });
    }

    if (!normalizedNoteId && !normalizedTaskId) {
      return res.status(400).json({
        message: "Le commentaire doit être lié à une note ou à une tâche.",
      });
    }

    const member = await checkWorkspaceMember(workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    if (content.trim() === "👍") {
      const likeQuery = supabaseAdmin
        .from("comments")
        .select("id")
        .eq("author_id", userId)
        .eq("content", "👍");

      if (normalizedTaskId) {
        likeQuery.eq("task_id", normalizedTaskId);
      } else {
        likeQuery.is("task_id", null);
      }

      if (normalizedNoteId) {
        likeQuery.eq("note_id", normalizedNoteId);
      } else {
        likeQuery.is("note_id", null);
      }

      const { data: existingLikes, error: likeError } = await likeQuery;

      if (likeError) {
        return res.status(400).json({
          message: likeError.message,
        });
      }

      if (Array.isArray(existingLikes) && existingLikes.length > 0) {
        return res.status(409).json({
          message: "Vous avez déjà liké cette tâche.",
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .insert([
        {
          workspace_id,
          note_id: normalizedNoteId,
          task_id: normalizedTaskId,
          content,
          mentions: mentions || [],
          author_id: userId,
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
      message: "Commentaire ajouté avec succès.",
      comment: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER LES COMMENTAIRES D’UNE NOTE
export const getCommentsByNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const { data: note, error: noteError } = await supabaseAdmin
      .from("notes")
      .select("workspace_id")
      .eq("id", noteId)
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
      .from("comments")
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("note_id", noteId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Commentaires de la note.",
      comments: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER LES COMMENTAIRES D’UNE TÂCHE
export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("workspace_id")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        message: "Tâche introuvable.",
      });
    }

    const member = await checkWorkspaceMember(task.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Commentaires de la tâche.",
      comments: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MODIFIER UN COMMENTAIRE
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mentions } = req.body;
    const userId = req.user.id;

    const { data: comment, error: commentError } = await supabaseAdmin
      .from("comments")
      .select("workspace_id, author_id")
      .eq("id", id)
      .single();

    if (commentError || !comment) {
      return res.status(404).json({
        message: "Commentaire introuvable.",
      });
    }

    const member = await checkWorkspaceMember(comment.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (comment.author_id !== userId) {
      return res.status(403).json({
        message: "Vous pouvez modifier seulement vos propres commentaires.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({
        content,
        mentions,
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
      message: "Commentaire modifié avec succès.",
      comment: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UN COMMENTAIRE
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: comment, error: commentError } = await supabaseAdmin
      .from("comments")
      .select("workspace_id, author_id")
      .eq("id", id)
      .single();

    if (commentError || !comment) {
      return res.status(404).json({
        message: "Commentaire introuvable.",
      });
    }

    const member = await checkWorkspaceMember(comment.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (
      comment.author_id !== userId &&
      !["owner", "admin"].includes(member.role)
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de supprimer ce commentaire.",
      });
    }

    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Commentaire supprimé avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};