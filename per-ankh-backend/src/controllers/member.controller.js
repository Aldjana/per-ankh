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

// RÉCUPÉRER LES MEMBRES D'UN WORKSPACE
export const getWorkspaceMembers = async (req, res) => {
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
      .from("workspace_members")
      .select(`
        id,
        role,
        created_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Liste des membres du workspace.",
      members: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// AJOUTER UN MEMBRE PAR USER_ID OU EMAIL
export const addWorkspaceMember = async (req, res) => {
  try {
    const { workspace_id, user_id, email, role } = req.body;
    const currentUserId = req.user.id;

    // Vérifier que soit user_id soit email est fourni
    if (!workspace_id || (!user_id && !email)) {
      return res.status(400).json({
        message: "workspace_id et (user_id ou email) sont obligatoires.",
      });
    }

    const currentMember = await checkWorkspaceMember(workspace_id, currentUserId);

    if (
      !currentMember ||
      !["owner", "admin"].includes(currentMember.role)
    ) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission d'ajouter un membre.",
      });
    }

    let targetUserId = user_id;

    // Si email est fourni, chercher le user_id correspondant
    if (email && !user_id) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          message: `Utilisateur avec l'email "${email}" introuvable.`,
        });
      }

      targetUserId = profile.id;
    }

    // Vérifier que l'utilisateur existe dans profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("id", targetUserId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    // Vérifier qu'il n'est pas déjà membre
    const { data: existingMember, error: existingError } = await supabaseAdmin
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspace_id)
      .eq("user_id", targetUserId)
      .single();

    if (existingMember) {
      return res.status(400).json({
        message: "Cet utilisateur est déjà membre du workspace.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("workspace_members")
      .insert([
        {
          workspace_id,
          user_id: targetUserId,
          role: role || "member",
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
      message: "Membre ajouté avec succès.",
      member: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MODIFIER LE RÔLE D'UN MEMBRE
export const updateWorkspaceMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    if (!role || !["owner", "admin", "member"].includes(role)) {
      return res.status(400).json({
        message: "Rôle invalide. Valeurs acceptées : owner, admin, member.",
      });
    }

    const { data: targetMember, error: targetError } = await supabaseAdmin
      .from("workspace_members")
      .select("id, workspace_id, user_id, role")
      .eq("id", memberId)
      .single();

    if (targetError || !targetMember) {
      return res.status(404).json({
        message: "Membre introuvable.",
      });
    }

    const currentMember = await checkWorkspaceMember(
      targetMember.workspace_id,
      currentUserId
    );

    if (!currentMember || currentMember.role !== "owner") {
      return res.status(403).json({
        message: "Seul le propriétaire peut modifier les rôles.",
      });
    }

    if (targetMember.role === "owner") {
      return res.status(400).json({
        message: "Le rôle du propriétaire ne peut pas être modifié ici.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Rôle du membre modifié avec succès.",
      member: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UN MEMBRE
export const removeWorkspaceMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const currentUserId = req.user.id;

    const { data: targetMember, error: targetError } = await supabaseAdmin
      .from("workspace_members")
      .select("id, workspace_id, user_id, role")
      .eq("id", memberId)
      .single();

    if (targetError || !targetMember) {
      return res.status(404).json({
        message: "Membre introuvable.",
      });
    }

    const currentMember = await checkWorkspaceMember(
      targetMember.workspace_id,
      currentUserId
    );

    if (!currentMember) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const isOwner = currentMember.role === "owner";
    const isSelf = targetMember.user_id === currentUserId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        message: "Vous n'avez pas la permission de supprimer ce membre.",
      });
    }

    if (targetMember.role === "owner") {
      return res.status(400).json({
        message: "Le propriétaire ne peut pas être supprimé du workspace.",
      });
    }

    const { error } = await supabaseAdmin
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Membre supprimé avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};