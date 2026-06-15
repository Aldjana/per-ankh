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

// CRÉER UNE TÂCHE
export const createTask = async (req, res) => {
  try {
    const {
      workspace_id,
      column_id,
      title,
      description,
      assigned_to,
      due_date,
      tags,
      priority,
    } = req.body;

    const userId = req.user.id;

    if (!workspace_id || !column_id || !title) {
      return res.status(400).json({
        message: "workspace_id, column_id et title sont obligatoires.",
      });
    }

    const member = await checkWorkspaceMember(workspace_id, userId);

    if (!member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    // Valider que l'utilisateur assigné est un membre du workspace
    if (assigned_to) {
      const assignedMember = await checkWorkspaceMember(workspace_id, assigned_to);
      if (!assignedMember) {
        return res.status(400).json({
          message: "L'utilisateur assigné n'est pas un membre de ce workspace.",
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert([
        {
          workspace_id,
          column_id,
          title,
          description,
          assigned_to: assigned_to || null,
          created_by: userId,
          due_date: due_date || null,
          tags: tags || [],
          priority: priority || "medium",
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Créer une notification si la tâche est assignée à quelqu'un
    if (assigned_to) {
      await supabaseAdmin.from("notifications").insert([
        {
          user_id: assigned_to,
          workspace_id,
          type: "assignment",
          title: "Nouvelle tâche assignée",
          message: `Une nouvelle tâche vous a été assignée : ${title}`,
        },
      ]);
    }

    return res.status(201).json({
      message: "Tâche créée avec succès.",
      task: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER LES TÂCHES D’UN WORKSPACE
export const getTasksByWorkspace = async (req, res) => {
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
        ),
        comments (
          id,
          content,
          author_id
        )
      `)
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Liste des tâches.",
      tasks: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MODIFIER UNE TÂCHE
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const {
      title,
      description,
      assigned_to,
      due_date,
      tags,
      priority,
      status,
    } = req.body;

    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("workspace_id, created_by, assigned_to")
      .eq("id", id)
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

    // Vérifier les permissions : seulement creator, assignee, ou admin peut modifier
    const isCreator = task.created_by === userId;
    const isAssignee = task.assigned_to === userId;
    const isAdmin = ["owner", "admin"].includes(member.role);

    if (!isCreator && !isAssignee && !isAdmin) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de modifier cette tâche.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update({
        title,
        description,
        assigned_to,
        due_date,
        tags,
        priority,
        status,
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

    // Notification seulement si c'est une NOUVELLE assignation
    if (assigned_to && assigned_to !== task.assigned_to) {
      await supabaseAdmin.from("notifications").insert([
        {
          user_id: assigned_to,
          workspace_id: task.workspace_id,
          type: "assignment",
          title: "Tâche assignée",
          message: `Une tâche vous a été assignée : ${data.title}`,
        },
      ]);
    }

    return res.status(200).json({
      message: "Tâche modifiée avec succès.",
      task: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// DÉPLACER UNE TÂCHE
export const moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { column_id, position, status } = req.body;
    const userId = req.user.id;

    if (!column_id) {
      return res.status(400).json({
        message: "column_id est obligatoire.",
      });
    }

    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("workspace_id")
      .eq("id", id)
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
      .from("tasks")
      .update({
        column_id,
        position: position || 0,
        status: status || "todo",
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

    // Notification si la tâche a un utilisateur assigné
    if (data.assigned_to) {
      await supabaseAdmin.from("notifications").insert([
        {
          user_id: data.assigned_to,
          workspace_id: data.workspace_id,
          type: "status_change",
          title: "Statut de tâche modifié",
          message: `Le statut de votre tâche "${data.title}" a été modifié.`,
        },
      ]);
    }

    return res.status(200).json({
      message: "Tâche déplacée avec succès.",
      task: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UNE TÂCHE
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("workspace_id, created_by")
      .eq("id", id)
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

    // Seulement le créateur ou un admin peut supprimer
    const isCreator = task.created_by === userId;
    const isAdmin = ["owner", "admin"].includes(member.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: "Seul le créateur ou un administrateur peut supprimer cette tâche.",
      });
    }

    const { error } = await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Tâche supprimée avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};