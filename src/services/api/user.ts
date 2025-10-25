import { getSupabaseClient, isSupabaseConfigured } from "../supabase/supabaseClient";
import type { AuthUserRecord } from "./types";
import type { UserProfile } from "../../types/domain";
import { buildSectionsFromSeed, saveTemplateSections } from "./template";
import { DEFAULT_TEMPLATE_SEED } from "../../types/domain";

const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const toProfile = (record: AuthUserRecord): UserProfile => ({
  id: record.id,
  goalDays: record.goal_days,
  createdAt: record.created_at,
  email: record.email,
  displayName: record.display_name,
  streakDays: record.streak_days,
  longestStreak: record.longest_streak,
  totalChecklists: record.total_checklists,
});

export const registerUser = async (payload: {
  id: string;
  password: string;
  goalDays: number;
  email?: string;
  displayName?: string;
}): Promise<UserProfile> => {
  const createdAt = new Date().toISOString();

  if (!isSupabaseConfigured) {
    // Supabaseが設定されていない場合は登録を拒否
    throw new Error("データベースが設定されていません。管理者にお問い合わせください。");
  }

  const supabase = getSupabaseClient();
  const password_hash = await hashPassword(payload.password);

  const { error } = await supabase.from("auth_users").insert({
    id: payload.id,
    password_hash,
    goal_days: payload.goalDays,
    email: payload.email || null,
    display_name: payload.displayName || null,
    streak_days: 0,
    longest_streak: 0,
    total_checklists: 0,
  });

  if (error) {
    throw error;
  }

  const seeded = buildSectionsFromSeed(DEFAULT_TEMPLATE_SEED);
  await saveTemplateSections(payload.id, seeded);

  return {
    id: payload.id,
    goalDays: payload.goalDays,
    createdAt,
    email: payload.email || null,
    displayName: payload.displayName || null,
    streakDays: 0,
    longestStreak: 0,
    totalChecklists: 0,
  };
};

export const authenticateUser = async (payload: {
  id: string;
  password: string;
}): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) {
    // Supabaseが設定されていない場合は認証を拒否
    throw new Error("データベースが設定されていません。管理者にお問い合わせください。");
  }

  const supabase = getSupabaseClient();
  const password_hash = await hashPassword(payload.password);

  const { data, error } = await supabase
    .from("auth_users")
    .select("*")
    .eq("id", payload.id)
    .maybeSingle<AuthUserRecord>();

  if (error) {
    throw error;
  }

  if (!data || data.password_hash !== password_hash) {
    return null;
  }

  return toProfile(data);
};
