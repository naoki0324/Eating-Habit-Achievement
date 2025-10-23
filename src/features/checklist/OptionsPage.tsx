import { ChecklistTemplateEditor } from "./ChecklistTemplateEditor";

const OptionsPage = () => (
  <div className="space-y-8">
    <section id="template" className="rounded-3xl bg-white/90 px-6 py-6 shadow-lg border border-slate-200/60">
      <header className="mb-4">
        <h1 className="text-lg font-semibold text-slate-800">テンプレート設定</h1>
        <p className="mt-1 text-sm text-slate-500">項目の編集や追加はここから行えます。</p>
      </header>
      <ChecklistTemplateEditor />
    </section>

  </div>
);

export default OptionsPage;
