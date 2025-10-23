export interface AuthUserRecord {
  id: string;
  password_hash: string;
  goal_days: number;
  created_at: string;
}

export interface ChecklistTemplateRecord {
  id: string;
  user_id: string;
  title: string | null;
  position: number;
  created_at: string;
}

export interface ChecklistTemplateItemRecord {
  id: string;
  template_id: string;
  label: string;
  position: number;
  created_at: string;
}

export interface DailyChecklistRecord {
  id: string;
  user_id: string;
  record_date: string;
  sections: unknown;
  created_at: string;
  updated_at: string;
}

export interface SystemLogRecord {
  id: number;
  user_id: string | null;
  level: string;
  action: string;
  message: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      auth_users: {
        Row: AuthUserRecord;
        Insert: {
          id: string;
          password_hash: string;
          goal_days: number;
          created_at?: string;
        };
        Update: {
          goal_days?: number;
          password_hash?: string;
        };
      };
      checklist_templates: {
        Row: ChecklistTemplateRecord;
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          position: number;
        };
        Update: {
          title?: string | null;
          position?: number;
        };
      };
      checklist_template_items: {
        Row: ChecklistTemplateItemRecord;
        Insert: {
          id?: string;
          template_id: string;
          label: string;
          position: number;
        };
        Update: {
          label?: string;
          position?: number;
        };
      };
      daily_checklists: {
        Row: DailyChecklistRecord;
        Insert: {
          id?: string;
          user_id: string;
          record_date: string;
          sections: unknown;
        };
        Update: {
          sections?: unknown;
          updated_at?: string;
        };
      };
      system_logs: {
        Row: SystemLogRecord;
        Insert: {
          user_id?: string | null;
          level: string;
          action: string;
          message: string;
        };
        Update: never;
      };
    };
    Views: {};
    Functions: {};
  };
}
