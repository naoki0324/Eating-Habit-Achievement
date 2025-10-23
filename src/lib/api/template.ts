import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import type {
  ChecklistTemplateRecord,
  ChecklistTemplateItemRecord,
} from "./types";
import type { ChecklistSection, ChecklistItem, TemplateSeedSection } from "../../shared/types/domain";
import { DEFAULT_TEMPLATE_SEED } from "../../shared/types/domain";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const ensureSectionIds = (sections: ChecklistSection[]): ChecklistSection[] =>
  sections.map((section) => ({
    id: section.id || generateId(),
    title: section.title,
    items: section.items.map((item) => ensureItemIds(item)),
  }));

const ensureItemIds = (item: ChecklistItem): ChecklistItem => ({
  id: item.id || generateId(),
  label: item.label,
  checked: Boolean(item.checked),
});

const recordsToSections = (
  templates: ChecklistTemplateRecord[],
  items: ChecklistTemplateItemRecord[],
): ChecklistSection[] => {
  const grouped = new Map<string, ChecklistTemplateItemRecord[]>();
  for (const item of items) {
    if (!grouped.has(item.template_id)) {
      grouped.set(item.template_id, []);
    }
    grouped.get(item.template_id)!.push(item);
  }

  return templates.map((template) => ({
    id: template.id,
    title: template.title ?? undefined,
    items: (grouped.get(template.id) ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
  }));
};

export const buildSectionsFromSeed = (seed: TemplateSeedSection[]): ChecklistSection[] =>
  seed.map((section) => ({
    id: generateId(),
    title: section.title,
    items: section.items.map((label) => ({
      id: generateId(),
      label,
      checked: false,
    })),
  }));

export const loadTemplateSections = async (userId: string): Promise<ChecklistSection[]> => {
  if (!isSupabaseConfigured) {
    return buildSectionsFromSeed(DEFAULT_TEMPLATE_SEED);
  }

  const supabase = getSupabaseClient();
  const { data: templates, error: templateError } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true })
    .returns<ChecklistTemplateRecord[]>();

  if (templateError) throw templateError;
  if (!templates || templates.length === 0) return [];

  const templateIds = templates.map((template) => template.id);
  const { data: items, error: itemsError } = await supabase
    .from("checklist_template_items")
    .select("*")
    .in("template_id", templateIds)
    .order("position", { ascending: true })
    .returns<ChecklistTemplateItemRecord[]>();

  if (itemsError) throw itemsError;

  return recordsToSections(templates, items ?? []);
};

export const saveTemplateSections = async (
  userId: string,
  sections: ChecklistSection[],
): Promise<ChecklistSection[]> => {
  if (!isSupabaseConfigured) {
    return ensureSectionIds(sections);
  }

  const supabase = getSupabaseClient();
  const normalized = ensureSectionIds(sections);

  const { error: deleteError } = await supabase
    .from("checklist_templates")
    .delete()
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  if (normalized.length === 0) {
    return normalized;
  }

  const templateRows = normalized.map((section, index) => ({
    id: section.id,
    user_id: userId,
    title: section.title ?? null,
    position: index,
  }));

  const { error: insertTemplatesError } = await supabase
    .from("checklist_templates")
    .insert(templateRows);
  if (insertTemplatesError) throw insertTemplatesError;

  const itemRows = normalized.flatMap((section) =>
    section.items.map((item, index) => ({
      id: item.id,
      template_id: section.id,
      label: item.label,
      position: index,
    })),
  );

  if (itemRows.length > 0) {
    const { error: insertItemsError } = await supabase
      .from("checklist_template_items")
      .insert(itemRows);
    if (insertItemsError) throw insertItemsError;
  }

  return normalized;
};

export const ensureTemplateSeed = async (userId: string): Promise<ChecklistSection[]> => {
  if (!isSupabaseConfigured) {
    return buildSectionsFromSeed(DEFAULT_TEMPLATE_SEED);
  }

  const existing = await loadTemplateSections(userId);
  if (existing.length > 0) {
    return existing;
  }

  const seeded = buildSectionsFromSeed(DEFAULT_TEMPLATE_SEED);
  await saveTemplateSections(userId, seeded);
  return seeded;
};
