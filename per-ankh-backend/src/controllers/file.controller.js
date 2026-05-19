import { supabaseAdmin } from "../config/supabase.js";

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "per-ankh-files";

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

// UPLOAD D'UN FICHIER
export const uploadFile = async (req, res) => {
  try {
    const { workspace_id, task_id, note_id } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!workspace_id) {
      return res.status(400).json({
        message: "workspace_id est obligatoire.",
      });
    }

    if (!task_id && !note_id) {
      return res.status(400).json({
        message: "Le fichier doit être lié à une tâche ou à une note.",
      });
    }

    if (!file) {
      return res.status(400).json({
        message: "Aucun fichier envoyé.",
      });
    }

    const member = await checkWorkspaceMember(workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    const filePath = `${workspace_id}/${Date.now()}-${file.originalname}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(400).json({
        message: uploadError.message,
      });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    const { data, error } = await supabaseAdmin
      .from("files")
      .insert([
        {
          workspace_id,
          task_id: task_id || null,
          note_id: note_id || null,
          uploaded_by: userId,
          file_name: file.originalname,
          file_url: fileUrl,
          file_type: file.mimetype,
          file_size: file.size,
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
      message: "Fichier uploadé avec succès.",
      file: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER LES FICHIERS D'UNE TÂCHE
export const getFilesByTask = async (req, res) => {
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
      .from("files")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Fichiers de la tâche.",
      files: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER LES FICHIERS D'UNE NOTE
export const getFilesByNote = async (req, res) => {
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
      .from("files")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Fichiers de la note.",
      files: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UN FICHIER
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: fileData, error: fileError } = await supabaseAdmin
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({
        message: "Fichier introuvable.",
      });
    }

    const member = await checkWorkspaceMember(fileData.workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const isUploader = fileData.uploaded_by === userId;
    const isAdminOrOwner = ["owner", "admin"].includes(member.role);

    if (!isUploader && !isAdminOrOwner) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de supprimer ce fichier.",
      });
    }

    const urlParts = fileData.file_url.split(`${bucketName}/`);
    const filePath = urlParts[1];

    if (filePath) {
      await supabaseAdmin.storage.from(bucketName).remove([filePath]);
    }

    const { error } = await supabaseAdmin
      .from("files")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Fichier supprimé avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};