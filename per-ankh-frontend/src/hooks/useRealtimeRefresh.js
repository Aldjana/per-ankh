import { useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

// Écoute les changements Supabase Realtime et déclenche un rafraîchissement.
export function useRealtimeRefresh({
  channelName,
  table,
  filter,
  onRefresh,
  onData,
  enabled = true,
}) {
  const channelRef = useRef(null);
  const callbacksRef = useRef({ onRefresh, onData });
  const subscriptionStateRef = useRef(null);

  // Mettre à jour les callbacks sans re-subscribe
  useEffect(() => {
    callbacksRef.current = { onRefresh, onData };
  }, [onRefresh, onData]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured() || !supabase || !onRefresh) {
      return;
    }

   
    if (channelRef.current && subscriptionStateRef.current === "SUBSCRIBED") {
      return;
    }

    const channel = supabase
      .channel(channelName, {
        config: { 
          broadcast: { self: true }
        }
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          const eventType = payload.eventType; // INSERT
          const data = payload.new || payload.old;
          
          // Exécuter onData si fourni
          if (callbacksRef.current.onData) {
            callbacksRef.current.onData(data, eventType);
          }

          // Exécuter onRefresh pour recharger la liste
          if (callbacksRef.current.onRefresh) {
            callbacksRef.current.onRefresh();
          }
        }
      )
      .subscribe((status) => {
        subscriptionStateRef.current = status;
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      subscriptionStateRef.current = null;
    };
  }, [channelName, table, filter, enabled, onRefresh]);
}

