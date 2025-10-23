import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Trash2, Save, RotateCcw, Loader2 } from "lucide-react";
import { useAppStore } from "../../lib/store/appStore";
import type { ChecklistSection } from "../../shared/types/domain";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const cloneSections = (sections: ChecklistSection[]): ChecklistSection[] =>
  sections.map((section) => ({
    id: section.id || generateId(),
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id || generateId(),
      label: item.label,
      checked: false,
    })),
  }));

export const ChecklistTemplateEditor = () => {
  const template = useAppStore((state) => state.template);
  const saveTemplate = useAppStore((state) => state.saveTemplate);
  const refreshTemplate = useAppStore((state) => state.refreshTemplate);
  const templateLoading = useAppStore((state) => state.templateLoading);

  const [draft, setDraft] = useState<ChecklistSection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template.length === 0) {
      refreshTemplate();
    }
  }, [template.length, refreshTemplate]);

  useEffect(() => {
    setDraft(cloneSections(template));
  }, [template]);

  const dirty = useMemo(() => {
    if (draft.length !== template.length) return true;
    return draft.some((section, index) => {
      const base = template[index];
      if (!base) return true;
      if ((section.title ?? "") !== (base.title ?? "")) return true;
      if (section.items.length !== base.items.length) return true;
      return section.items.some((item, itemIndex) => {
        const baseItem = base.items[itemIndex];
        return !baseItem || item.label !== baseItem.label;
      });
    });
  }, [draft, template]);

  const handleAddSection = () => {
    setDraft((prev) => [
      ...prev,
      {
        id: generateId(),
        title: "新しいセクション",
        items: [],
      },
    ]);
  };

  const handleUpdateSection = (sectionId: string, title: string) => {
    setDraft((prev) =>
      prev.map((section) => (section.id === sectionId ? { ...section, title } : section)),
    );
  };

  const handleRemoveSection = (sectionId: string) => {
    setDraft((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const handleAddItem = (sectionId: string) => {
    setDraft((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [
                ...section.items,
                {
                  id: generateId(),
                  label: "新しい項目",
                  checked: false,
                },
              ],
            }
          : section,
      ),
    );
  };

  const handleUpdateItem = (sectionId: string, itemId: string, label: string) => {
    setDraft((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, label } : item,
              ),
            }
          : section,
      ),
    );
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    setDraft((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section,
      ),
    );
  };

  const handleReset = () => {
    setDraft(cloneSections(template));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTemplate(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white/85 backdrop-blur rounded-2xl border border-black/5 shadow-xl p-6 space-y-6 h-full overflow-y-auto">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">テンプレート設定</h2>
          <p className="text-sm text-slate-500 mt-1">
            編集後に「保存」すると、指定日以降のチェックリストに反映されます。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!dirty || templateLoading || saving}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <RotateCcw className="size-4" />
            リセット
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || templateLoading || saving}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            保存
          </button>
          <button
            onClick={handleAddSection}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-100"
          >
            <PlusCircle className="size-4" />
            セクション追加
          </button>
        </div>
      </header>

      {templateLoading && (
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          読み込み中です...
        </div>
      )}

      <div className="space-y-4">
        {draft.map((section) => (
          <article
            key={section.id}
            className="border border-emerald-100 rounded-xl bg-white/90 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-emerald-100 px-4 py-3">
              <input
                value={section.title || ""}
                onChange={(event) => handleUpdateSection(section.id, event.target.value)}
                placeholder="見出し (空欄でもOK)"
                className="flex-1 bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
              />
              <button
                onClick={() => handleRemoveSection(section.id)}
                className="p-1 rounded-full hover:bg-rose-100 text-rose-500 transition"
                aria-label="セクション削除"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border border-emerald-50 rounded-lg px-3 py-2 bg-white"
                >
                  <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-semibold">
                    #
                  </div>
                  <input
                    value={item.label}
                    onChange={(event) => handleUpdateItem(section.id, item.id, event.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
                    placeholder="項目名"
                  />
                  <button
                    onClick={() => handleRemoveItem(section.id, item.id)}
                    className="p-1 rounded-full hover:bg-rose-100 text-rose-500 transition"
                    aria-label="項目削除"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => handleAddItem(section.id)}
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <PlusCircle className="size-4" />
                項目を追加
              </button>

              {section.items.length === 0 && (
                <p className="text-xs text-slate-400">
                  現在この見出しに紐づく項目はありません。上のボタンから追加できます。
                </p>
              )}
            </div>
          </article>
        ))}

        {draft.length === 0 && !templateLoading && (
          <p className="text-sm text-slate-500 text-center py-10">
            まだテンプレートがありません。まずはセクションを追加してください。
          </p>
        )}
      </div>
    </section>
  );
};
