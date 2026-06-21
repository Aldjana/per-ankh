import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiLoader,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { notificationEmitter } from "../services/eventEmitter";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getRealNotification = (notification) => {
    if (!notification) return {};
    return (
      notification.notification ||
      notification.data ||
      notification.item ||
      notification
    );
  };

  const getNotificationId = (notification) => {
    const item = getRealNotification(notification);
    return item?.id || "";
  };

  const getNotificationTitle = (notification) => {
    const item = getRealNotification(notification);
    return (
      item?.title ||
      item?.titre ||
      item?.type ||
      item?.notification_type ||
      "Notification"
    );
  };

  const getNotificationMessage = (notification) => {
    const item = getRealNotification(notification);
    return (
      item?.message ||
      item?.content ||
      item?.body ||
      item?.description ||
      "Aucun détail disponible."
    );
  };

  const isRead = (notification) => {
    const item = getRealNotification(notification);
    return !!(item?.is_read || item?.isRead || item?.read);
  };

  const getNotificationDate = (notification) => {
    const item = getRealNotification(notification);
    return item?.created_at || item?.createdAt || null;
  };

  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const list = await getMyNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger les notifications."
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Écouter les notifications en temps réel depuis Layout.jsx
  useEffect(() => {
    // Créer une fonction qui sera appelée quand une notification arrive
    const handleNotificationEvent = (payload) => {
      // Recharger les notifications
      setLoading(true);
      getMyNotifications()
        .then(list => {
          setNotifications(Array.isArray(list) ? list : []);
          setError("");
        })
        .catch(err => {
          setError(err.response?.data?.message || "Impossible de charger les notifications.");
        })
        .finally(() => {
          setLoading(false);
        });
    };
    
    const unsubscribe = notificationEmitter.on('notification-received', handleNotificationEvent);
    return unsubscribe;
  }, []);

  const handleMarkAsRead = async (notification) => {
    if (isRead(notification)) return;

    try {
      setActionLoading(true);
      await markNotificationAsRead(getNotificationId(notification));
      toast.success("Notification marquée comme lue.");
      await fetchNotifications();
    } catch (err) {
      
      toast.error(err.response?.data?.message || "Impossible de marquer la notification comme lue.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      setError("");
      await markAllNotificationsAsRead();
      toast.success("Toutes les notifications ont été marquées comme lues.");
      await fetchNotifications();

    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de marquer toutes les notifications comme lues.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
      setDeleting(true);
      setError("");
      await deleteNotification(getNotificationId(notificationToDelete));
      await fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de supprimer cette notification.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setNotificationToDelete(null);
    }
  };

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  const displayedNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !isRead(notification);
    if (filter === "read") return isRead(notification);
    return true;
  });

  return (
    <Layout>
      <div className="space-y-5">
        <PageHeader
          actions={
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading || unreadCount === 0}
              className="h-10 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiCheckCircle />
              )}
              Tout lire
            </button>
          }
        />

        <section className="card p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Toutes" },
              { id: "unread", label: `Non lues (${unreadCount})` },
              { id: "read", label: "Lues" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-black transition ${
                  filter === item.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-slate-500">
            <FiLoader className="text-3xl animate-spin mb-3" />
            Chargement des notifications...
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-3xl mx-auto">
              <FiBell />
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-4">
              Aucune notification
            </h2>
            <p className="text-slate-500 mt-2">
              {filter === "unread"
                ? "Vous êtes à jour"
                : "Les alertes de votre activité apparaîtront ici."}
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {displayedNotifications.map((notification, index) => {
              const read = isRead(notification);

              return (
                <div
                  key={getNotificationId(notification) || index}
                  className={`bg-white rounded-3xl border shadow-sm p-5 transition ${
                    read
                      ? "border-slate-100 opacity-80"
                      : "border-blue-200 shadow-md"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                          read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        <FiBell />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900">
                            {getNotificationTitle(notification)}
                          </h3>
                          {!read && (
                            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 mt-2 leading-6">
                          {getNotificationMessage(notification)}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                          <FiClock />
                          {formatDate(getNotificationDate(notification))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      {!read && (
                        <button
                          onClick={() => handleMarkAsRead(notification)}
                          disabled={actionLoading}
                          className="h-10 px-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center gap-2 hover:bg-emerald-100 transition disabled:opacity-50"
                        >
                          <FiCheck />
                          Marquer lue
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notification)}
                        disabled={actionLoading}
                        className="h-10 px-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <FiTrash2 />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer la notification"
        message="Êtes-vous sûr de vouloir supprimer cette notification ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous={true}
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setNotificationToDelete(null);
        }}
      />
    </Layout>
  );
}
