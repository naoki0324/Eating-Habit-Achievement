import { useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useAppStore } from "../../services/store/appStore";

interface ChecklistModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChecklistModal = ({ open, onClose }: ChecklistModalProps) => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const sections = useAppStore((state) => state.dailyRecords[selectedDate] ?? []);
  const ensureChecklist = useAppStore((state) => state.ensureDailyChecklist);
  const toggleItem = useAppStore((state) => state.toggleChecklistItem);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const template = useAppStore((state) => state.template);

  useEffect(() => {
    if (open) {
      ensureChecklist(selectedDate);
    }
  }, [open, ensureChecklist, selectedDate]);

  // テンプレートが変更された場合、今日のチェックリストを更新
  useEffect(() => {
    if (open && selectedDate === new Date().toISOString().slice(0, 10)) {
      const todaySections = useAppStore.getState().dailyRecords[selectedDate];
      if (todaySections && template.length > 0) {
        // テンプレートと今日のチェックリストの構造が異なる場合、更新を実行
        const needsUpdate = template.some(templateSection => {
          const existingSection = todaySections.find(s => s.id === templateSection.id);
          if (!existingSection) return true;
          
          return templateSection.items.some(templateItem => {
            const existingItem = existingSection.items.find(i => i.id === templateItem.id);
            return !existingItem || existingItem.label !== templateItem.label;
          });
        });

        if (needsUpdate) {
          useAppStore.getState().updateTodayChecklistFromTemplate();
        }
      }
    }
  }, [open, selectedDate, template]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl" role="document">
        <header className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-800">チェックリスト登録</h2>
            <p className="text-sm text-slate-500 mt-1">
              食材の継続状況や買い足しを振り返りましょう。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600 flex items-center gap-2" htmlFor="checklist-date">
              日付
            </label>
            <input
              id="checklist-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto max-h-[60vh] px-6 py-6 space-y-4">
          {sections.map((section) => (
            <section key={section.id} className="bg-slate-50 rounded-xl border border-slate-100">
              {section.title && (
                <h3 className="text-sm font-semibold text-slate-700 px-4 py-3 border-b border-slate-100">
                  {section.title}
                </h3>
              )}

              <ul className="divide-y divide-slate-100">
                {section.items.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleItem({
                          date: selectedDate,
                          sectionId: section.id,
                          itemId: item.id,
                        })
                      }
                      className={`w-full flex items-center gap-3 text-left rounded-lg px-3 py-2 transition bg-white hover:shadow ${
                        item.checked ? "border border-emerald-300 bg-emerald-50" : "border border-transparent"
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                          item.checked
                            ? "border-emerald-400 bg-emerald-400 text-white"
                            : "border-slate-300 text-slate-400"
                        }`}
                      >
                        {item.checked ? <CheckCircle2 className="size-4" /> : ""}
                      </span>
                      <span className="text-sm text-slate-700 leading-relaxed">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {section.items.length === 0 && (
                <p className="text-sm text-slate-400 px-4 py-4">この見出しにはまだ項目がありません。</p>
              )}
            </section>
          ))}

          {sections.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <p>この日のチェック項目がまだありません。テンプレートで事前に準備しておきましょう。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
