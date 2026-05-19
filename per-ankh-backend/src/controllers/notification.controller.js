import { supabaseAdmin } from "../config/supabase.js";

// RÉCUPÉRER MES NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Liste de vos notifications.",
      notifications: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MARQUER UNE NOTIFICATION COMME LUE
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Notification marquée comme lue.",
      notification: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// MARQUER TOUTES MES NOTIFICATIONS COMME LUES
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Toutes les notifications ont été marquées comme lues.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};

// SUPPRIMER UNE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(200).json({
      message: "Notification supprimée avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      error: error.message,
    });
  }
};