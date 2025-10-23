import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import type { AuthUserRecord } from "./types";
import type { UserProfile } from "../../shared/types/domain";
import { buildSectionsFromSeed, saveTemplateSections } from "./template";
import { DEFAULT_TEMPLATE_SEED } from "../../shared/types/domain";

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
});

export const registerUser = async (payload: {
  id: string;
  password: string;
  goalDays: number;
}): Promise<UserProfile> => {
  const createdAt = new Date().toISOString();

  if (!isSupabaseConfigured) {
    // デモモード: Supabase が未設定の場合はローカル状態のみで完結
    return {
      id: payload.id,
      goalDays: payload.goalDays,
      createdAt,
    };
  }

  const supabase = getSupabaseClient();
  const password_hash = await hashPassword(payload.password);

  const { error } = await supabase.from("auth_users").insert({
    id: payload.id,
    password_hash,
    goal_days: payload.goalDays,
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
  };
};

export const authenticateUser = async (payload: {
  id: string;
  password: string;
}): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) {
    // デモモード: 任意のID/パスワードでログインを許可し、目標日数は30日で固定
    return {
      id: payload.id,
      goalDays: 30,
      createdAt: new Date().toISOString(),
    };
  }

  const supabase = getSupabaseClient();
  const password_hash = await hashPassword(payload.password);

  const { data, error } = await supabase
    .from("auth_users")
    .select("id, goal_days, created_at, password_hash")
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
