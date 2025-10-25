export interface AuthUserRecord {
  id: string;
  password_hash: string;
  goal_days: number;
  email: string | null;
  display_name: string | null;
  streak_days: number;
  longest_streak: number;
  last_checklist_date: string | null;
  total_checklists: number;
  created_at: string;
  updated_at: string;
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

export interface StreakRecordRecord {
  id: string;
  user_id: string;
  streak_start_date: string;
  streak_end_date: string | null;
  streak_length: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStatisticsRecord {
  id: string;
  user_id: string;
  stat_date: string;
  checklists_completed: number;
  items_checked: number;
  completion_rate: number;
  created_at: string;
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
          email?: string | null;
          display_name?: string | null;
          streak_days?: number;
          longest_streak?: number;
          last_checklist_date?: string | null;
          total_checklists?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          goal_days?: number;
          password_hash?: string;
          email?: string | null;
          display_name?: string | null;
          streak_days?: number;
          longest_streak?: number;
          last_checklist_date?: string | null;
          total_checklists?: number;
          updated_at?: string;
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
      streak_records: {
        Row: StreakRecordRecord;
        Insert: {
          id?: string;
          user_id: string;
          streak_start_date: string;
          streak_end_date?: string | null;
          streak_length: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          streak_end_date?: string | null;
          streak_length?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      user_statistics: {
        Row: UserStatisticsRecord;
        Insert: {
          id?: string;
          user_id: string;
          stat_date: string;
          checklists_completed?: number;
          items_checked?: number;
          completion_rate?: number;
          created_at?: string;
        };
        Update: {
          checklists_completed?: number;
          items_checked?: number;
          completion_rate?: number;
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
