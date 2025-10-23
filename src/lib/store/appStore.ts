import { create } from "zustand";
import type {
  ChecklistSection,
  LogLevel,
  UserProfile,
} from "../../shared/types/domain";
import {
  authenticateUser,
  registerUser,
} from "../api/user";
import {
  ensureTemplateSeed,
  loadTemplateSections,
  saveTemplateSections,
} from "../api/template";
import {
  fetchDailyChecklist,
  upsertDailyChecklist,
} from "../api/dailyChecklist";
import { appendLog } from "../api/logger";
import { isSupabaseConfigured } from "../api/supabaseClient";

const todayISO = () => new Date().toISOString().slice(0, 10);

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const cloneSections = (sections: ChecklistSection[]): ChecklistSection[] =>
  sections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id,
      label: item.label,
      checked: Boolean(item.checked),
    })),
  }));


export const calculateContinuousDays = (
  records: Record<string, ChecklistSection[]>,
) => {
  const dates = Object.keys(records).sort((a, b) => (a > b ? -1 : 1));
  let count = 0;
  const todayIso = todayISO();
  const today = new Date(todayIso);

  for (const iso of dates) {
    const target = new Date(iso);
    const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === count) {
      const sections = records[iso];
      const hasIncomplete = sections.some((section) =>
        section.items.some((item) => !item.checked),
      );
      if (!hasIncomplete) {
        count += 1;
        continue;
      }
    }
    break;
  }

  return count;
};

interface TogglePayload {
  date: string;
  sectionId: string;
  itemId: string;
}

interface AppState {
  user: UserProfile | null;
  selectedDate: string;
  template: ChecklistSection[];
  dailyRecords: Record<string, ChecklistSection[]>;
  initializing: boolean;
  templateLoading: boolean;
  dailyLoading: boolean;
  modalOpen: boolean;
  setSelectedDate: (date: string) => void;
  setModalOpen: (open: boolean) => void;
  login: (id: string, password: string) => Promise<boolean>;
  register: (payload: { id: string; password: string; goalDays: number }) => Promise<boolean>;
  logout: () => void;
  bootstrap: () => Promise<void>;
  refreshTemplate: () => Promise<void>;
  saveTemplate: (sections: ChecklistSection[]) => Promise<void>;
  ensureDailyChecklist: (date: string) => Promise<ChecklistSection[]>;
  toggleChecklistItem: (payload: TogglePayload) => Promise<void>;
  recordLog: (action: string, message: string, level?: LogLevel) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  selectedDate: todayISO(),
  template: [],
  dailyRecords: {},
  initializing: false,
  templateLoading: false,
  dailyLoading: false,
  modalOpen: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setModalOpen: (open) => set({ modalOpen: open }),

  login: async (id, password) => {
    set({ initializing: true });
    try {
      const profile = await authenticateUser({ id, password });
      if (!profile) {
        return false;
      }

      set({
        user: profile,
        template: [],
        dailyRecords: {},
        modalOpen: false,
      });

      await get().bootstrap();
      await get().recordLog("user:login", `ユーザー ${profile.id} がサインインしました`);
      return true;
    } finally {
      set({ initializing: false });
    }
  },

  register: async ({ id, password, goalDays }) => {
    set({ initializing: true });
    try {

      const profile = await registerUser({ id, password, goalDays });
      set({
        user: profile,
        template: [],
        dailyRecords: {},
        modalOpen: false,
      });

      await get().bootstrap();
      await get().recordLog("user:register", `ユーザー ${profile.id} を登録しました`);
      return true;
    } finally {
      set({ initializing: false });
    }
  },

  logout: () => {
    set({
      user: null,
      template: [],
      dailyRecords: {},
      logs: [],
      selectedDate: todayISO(),
      initializing: false,
      templateLoading: false,
      logsLoading: false,
      dailyLoading: false,
      modalOpen: false,
    });
  },

  bootstrap: async () => {
    const user = get().user;
    if (!user) return;
    await Promise.all([get().refreshTemplate(), get().loadLogs()]);
  },

  refreshTemplate: async () => {
    const user = get().user;
    if (!user) return;

    set({ templateLoading: true });
    try {
      const sections = await ensureTemplateSeed(user.id);
      set({ template: sections });
    } finally {
      set({ templateLoading: false });
    }
  },

  saveTemplate: async (sections) => {
    const user = get().user;
    if (!user) return;

    set({ templateLoading: true });
    try {
      const next = await saveTemplateSections(user.id, sections);
      set({ template: next });
      await get().recordLog("template:save", "テンプレートを更新しました");
    } finally {
      set({ templateLoading: false });
    }
  },

  ensureDailyChecklist: async (date) => {
    const user = get().user;
    if (!user) throw new Error("認証情報がありません");

    const existing = get().dailyRecords[date];
    if (existing) {
      return existing;
    }

    set({ dailyLoading: true });
    try {
      const fetched = await fetchDailyChecklist(user.id, date);
      if (fetched) {
        set((state) => ({
          dailyRecords: {
            ...state.dailyRecords,
            [date]: cloneSections(fetched.sections as ChecklistSection[]),
          },
        }));
        return get().dailyRecords[date];
      }

      if (get().template.length === 0) {
        await get().refreshTemplate();
      }

      const baseTemplate = cloneSections(get().template);
      const seeded = baseTemplate.map((section) => ({
        ...section,
        items: section.items.map((item) => ({ ...item, checked: false })),
      }));

      await upsertDailyChecklist({
        userId: user.id,
        recordDate: date,
        sections: seeded,
      });

      set((state) => ({
        dailyRecords: {
          ...state.dailyRecords,
          [date]: seeded,
        },
      }));

      await get().recordLog("checklist:init", `${date} のチェック項目をテンプレートから生成しました`);
      return seeded;
    } finally {
      set({ dailyLoading: false });
    }
  },

  toggleChecklistItem: async ({ date, sectionId, itemId }) => {
    const user = get().user;
    if (!user) throw new Error("認証情報がありません");

    const records = get().dailyRecords;
    let daySections = records[date];
    if (!daySections) {
      daySections = await get().ensureDailyChecklist(date);
    }

    const updated = daySections.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        items: section.items.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item,
        ),
      };
    });

    set((state) => ({
      dailyRecords: {
        ...state.dailyRecords,
        [date]: updated,
      },
    }));

    await upsertDailyChecklist({
      userId: user.id,
      recordDate: date,
      sections: updated,
    });

    await get().recordLog(
      "checklist:toggle",
      `${date} / ${sectionId} / ${itemId} のチェック状態を切り替えました`,
    );
  },


  recordLog: async (action, message, level = "info") => {
    const timestamp = new Date().toISOString();

    console.log(`[DragonLog] ${timestamp} :: ${action} :: ${message}`);

    try {
      await appendLog({
        userId: get().user?.id ?? null,
        action,
        message,
        level,
      });
    } catch (error) {
      console.error(error);
    }
  },
}));
