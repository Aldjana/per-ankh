import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured, authenticateSupabaseClient } from "../services/supabaseClient";
import { notificationEmitter } from "../services/eventEmitter";

export default function Layout({ children, fullWidth = false, hideNavbar = false }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const channelRef = useRef(null);
  const setupDoneRef = useRef(false);

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (err) {
      // Notification sound failed silently
    }
  }, []);

  // Authentifier Supabase avec le JWT token
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    const token = localStorage.getItem("per_ankh_token");
    if (token) {
      authenticateSupabaseClient(token);
    }
  }, []);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured() || !supabase) {
      return;
    }

    // Éviter les doubles setup
    if (setupDoneRef.current) {
      return;
    }
    setupDoneRef.current = true;

    const channel = supabase
      .channel(`notifications-${user.id}-global`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const eventType = payload.eventType; // INSERT
          const data = payload.new || payload.old;
          if (data) {
            // Toast et son UNIQUEMENT pour les INSERT (nouvelles notifications)
            if (eventType === "INSERT") {
              playNotificationSound();

              const title = data?.title || "Nouvelle notification";
              const message = data?.message || "Vous avez reçu une nouvelle notification";
              toast(
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{title}</p>
                  <p style={{ fontSize: "0.875rem", color: "#64748b" }}>{message}</p>
                </div>,
                {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  type: "success",
                }
              );
            }

            // Émettre l'événement pour que Notifications.jsx recharge la liste
            notificationEmitter.emit('notification-received', { data, eventType });
          }
        }
      )
      .subscribe((status) => {
        // Realtime channel status change (SUBSCRIBED, CLOSED, CHANNEL_ERROR)
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setupDoneRef.current = false;
      }
    };
  }, [user?.id, playNotificationSound]);

  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="min-h-screen lg:ml-[72px] flex flex-col">
        {!hideNavbar && (
          <Navbar onMenuOpen={() => setMobileNavOpen(true)} />
        )}

        <main
          className={`flex-1 ${
            hideNavbar ? "" : "px-4 sm:px-6 lg:px-8 py-5 sm:py-6"
          } ${fullWidth ? "max-w-none" : "max-w-[1600px]"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
