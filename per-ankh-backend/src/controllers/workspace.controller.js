import { supabaseAdmin } from "../config/supabase.js";
// CRÉER UN ESPACE DE TRAVAIL
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        message: "Le nom de l'espace de travail est obligatoire.",
      });
    }

    const { data: workspace, error } = await supabaseAdmin
      .from("workspaces")
      .insert([
        {
          name,
          description,
          owner_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Ajouter automatiquement le créateur comme owner dans workspace_members
    const { error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .insert([
        {
          workspace_id: workspace.id,
          user_id: userId,
          role: "owner",
        },
      ]);

    if (memberError) {
      return res.status(400).json({
        message: memberError.message,
      });
    }

    // Créer automatiquement les colonnes Kanban de base
    await supabaseAdmin.from("kanban_columns").insert([
      {
        workspace_id: workspace.id,
        title: "À faire",
        position: 1,
      },
      {
        workspace_id: workspace.id,
        title: "En cours",
        position: 2,
      },
      {
        workspace_id: workspace.id,
        title: "Terminé",
        position: 3,
      },
    ]);

    return res.status(201).json({
      message: "Espace de travail créé avec succès.",
      workspace,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER TOUS LES ESPACES DE L’UTILISATEUR
export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("workspace_members")
      .select(`
        role,
        workspaces (
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", userId);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Liste des espaces de travail.",
      workspaces: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// RÉCUPÉRER UN SEUL ESPACE
export const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est membre
    const { data: member, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", id)
      .eq("user_id", userId)
      .single();

    if (memberError || !member) {
      return res.status(403).json({
        message: "Accès refusé à cet espace de travail.",
      });
    }

    const { data: workspace, error } = await supabaseAdmin
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        message: "Espace de travail introuvable.",
      });
    }

    return res.status(200).json({
      message: "Détails de l'espace de travail.",
      workspace,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MODIFIER UN ESPACE
export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est owner ou admin
    const { data: member, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", id)
      .eq("user_id", userId)
      .single();

    if (memberError || !member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de modifier cet espace.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("workspaces")
      .update({
        name,
        description,
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
      message: "Espace de travail modifié avec succès.",
      workspace: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UN ESPACE
export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Seul le owner peut supprimer
    const { data: member, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", id)
      .eq("user_id", userId)
      .single();

    if (memberError || !member || member.role !== "owner") {
      return res.status(403).json({
        message: "Seul le propriétaire peut supprimer cet espace.",
      });
    }

    const { error } = await supabaseAdmin
      .from("workspaces")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Espace de travail supprimé avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};