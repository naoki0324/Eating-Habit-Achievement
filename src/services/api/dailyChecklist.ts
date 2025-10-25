import { getSupabaseClient, isSupabaseConfigured } from "../supabase/supabaseClient";
import type { DailyChecklistRecord } from "./types";
import type { ChecklistSection } from "../../types/domain";

const serializeSections = (sections: ChecklistSection[]): DailyChecklistRecord["sections"] => {
  return sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id,
      label: item.label,
      checked: item.checked,
    })),
  }));
};

const deserializeSections = (payload: DailyChecklistRecord["sections"]): ChecklistSection[] => {
  if (!Array.isArray(payload)) return [];
  return payload.map((section: any) => ({
    id: section.id,
    title: section.title ?? undefined,
    items: Array.isArray(section.items)
      ? section.items.map((item: any) => ({
          id: item.id,
          label: item.label,
          checked: Boolean(item.checked),
        }))
      : [],
  }));
};

export const fetchDailyChecklist = async (userId: string, recordDate: string) => {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_checklists")
    .select("*")
    .eq("user_id", userId)
    .eq("record_date", recordDate)
    .maybeSingle<DailyChecklistRecord>();

  if (error) throw error;

  if (!data) {
    return null;
  }

  return {
    ...data,
    sections: deserializeSections(data.sections),
  };
};

export const upsertDailyChecklist = async (payload: {
  userId: string;
  recordDate: string;
  sections: ChecklistSection[];
}) => {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("daily_checklists").upsert(
    {
      user_id: payload.userId,
      record_date: payload.recordDate,
      sections: serializeSections(payload.sections),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,record_date",
    },
  );

  if (error) throw error;
};
