import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

/**
 * Écoute les changements Supabase Realtime et déclenche un rafraîchissement.
 * Ne fait rien si VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY sont absents.
 */
export function useRealtimeRefresh({
  channelName,
  table,
  filter,
  onRefresh,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled || !isSupabaseConfigured() || !supabase || !onRefresh) return;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          onRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, table, filter, enabled, onRefresh]);
}
