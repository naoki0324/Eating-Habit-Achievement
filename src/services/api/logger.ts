import { getSupabaseClient, isSupabaseConfigured } from "../supabase/supabaseClient";
import type { SystemLogRecord } from "./types";
import type { LogLevel } from "../../types/domain";

export const appendLog = async (payload: {
  userId?: string | null;
  action: string;
  message: string;
  level?: LogLevel;
}): Promise<SystemLogRecord> => {
  if (!isSupabaseConfigured) {
    console.info("Supabase未設定のためログを保存しません:", payload.action, payload.message);
    return {
      id: Number.NaN,
      user_id: payload.userId ?? null,
      action: payload.action,
      message: payload.message,
      level: payload.level ?? "info",
      created_at: new Date().toISOString(),
    } satisfies SystemLogRecord;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("system_logs")
    .insert({
      user_id: payload.userId ?? null,
      action: payload.action,
      message: payload.message,
      level: payload.level ?? "info",
    })
    .select("*")
    .single<SystemLogRecord>();

  if (error) throw error;
  return data;
};

export const fetchLogs = async (userId?: string | null, limit = 80) => {
  if (!isSupabaseConfigured) {
    console.info("Supabase未設定のためログを読み込めません。空配列を返します。");
    return [];
  }

  const supabase = getSupabaseClient();
  const query = supabase
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<SystemLogRecord[]>();

  const finalQuery = userId ? query.eq("user_id", userId) : query;

  const { data, error } = await finalQuery;
  if (error) throw error;
  return data ?? [];
};
