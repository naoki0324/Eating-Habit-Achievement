export type LogLevel = "info" | "warn" | "error";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistSection {
  id: string;
  title?: string;
  items: ChecklistItem[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  message: string;
  level: LogLevel;
}

export interface UserProfile {
  id: string;
  goalDays: number;
  createdAt: string;
}

export interface TemplateSeedSection {
  title?: string;
  items: string[];
}

export const DEFAULT_TEMPLATE_SEED: TemplateSeedSection[] = [
  {
    title: "今日食べた食材",
    items: [
      "朝食：野菜・果物を摂れた",
      "昼食：タンパク質を摂れた",
      "夕食：バランスよく食べた",
    ],
  },
  {
    title: "ストック・買い物",
    items: [
      "卵を購入できた",
      "野菜のストックを補充した",
      "プロテイン・豆製品を補充した",
    ],
  },
];
