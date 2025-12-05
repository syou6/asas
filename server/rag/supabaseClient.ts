import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseConfig } from "./config.js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { supabaseUrl, supabaseServiceRoleKey } = assertSupabaseConfig();
  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "mulmochat-rag" } },
  });

  return cachedClient;
}
