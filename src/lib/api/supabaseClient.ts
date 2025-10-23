import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_MISSING_MESSAGE =
  "Supabaseの接続情報が見つかりません。VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。";

export class SupabaseConfigError extends Error {
  constructor(message = SUPABASE_MISSING_MESSAGE) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else if (import.meta.env.DEV) {
  console.warn(SUPABASE_MISSING_MESSAGE);
}

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    throw new SupabaseConfigError();
  }
  return supabaseClient;
};
