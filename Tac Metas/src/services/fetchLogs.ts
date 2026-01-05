import { supabase } from "../lib/supabaseClient";

export async function fetchLogsForPeriod(startISO: string, endISO: string) {
  const { data: userRes, error: uErr } = await supabase.auth.getUser();
  if (uErr) throw uErr;
  const user = userRes.user;
  if (!user) return [];

  // Fetch logs within range
  // We accept STRICT ISO strings now, so we don't append time manually if it's already full ISO.
  // The caller (AppProvider) is responsible for passing full ISO strings.
  const { data, error } = await supabase
    .from("logs")
    .select("client_uuid,type,cargo_id,points_awarded,payload,created_at")
    .eq("user_id", user.id)
    .gte("created_at", startISO)
    .lte("created_at", endISO)
    .order("created_at", { ascending: false }); // Latest first

  if (error) throw error;
  return data ?? [];
}
