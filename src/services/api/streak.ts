import { getSupabaseClient } from "../supabase/supabaseClient";
import type { StreakRecordRecord, UserStatisticsRecord } from "./types";

/**
 * 連続日数管理API
 */
export class StreakAPI {
  private supabase = getSupabaseClient();

  /**
   * ユーザーの現在の連続日数を取得
   */
  async getCurrentStreak(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .select("streak_days")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("連続日数の取得に失敗:", error);
      return 0;
    }

    return data?.streak_days || 0;
  }

  /**
   * ユーザーの最長連続日数を取得
   */
  async getLongestStreak(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("auth_users")
      .select("longest_streak")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("最長連続日数の取得に失敗:", error);
      return 0;
    }

    return data?.longest_streak || 0;
  }

  /**
   * 連続日数を更新（チェックリスト完了時に呼び出し）
   */
  async updateStreak(userId: string, completedDate: string): Promise<boolean> {
    try {
      // 現在のユーザー情報を取得
      const { data: userData, error: userError } = await this.supabase
        .from("auth_users")
        .select("streak_days, longest_streak, last_checklist_date")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("ユーザー情報の取得に失敗:", userError);
        return false;
      }

      const currentStreak = userData?.streak_days || 0;
      const longestStreak = userData?.longest_streak || 0;
      const lastDate = userData?.last_checklist_date;

      // 日付の計算
      const today = new Date(completedDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = 1; // 最低1日

      // 昨日が最後のチェックリスト日の場合、連続日数を継続
      if (lastDate && new Date(lastDate).toDateString() === yesterday.toDateString()) {
        newStreak = currentStreak + 1;
      }

      // 最長連続日数を更新
      const newLongestStreak = Math.max(longestStreak, newStreak);

      // ユーザー情報を更新
      const { error: updateError } = await this.supabase
        .from("auth_users")
        .update({
          streak_days: newStreak,
          longest_streak: newLongestStreak,
          last_checklist_date: completedDate,
          total_checklists: (userData?.total_checklists || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("連続日数の更新に失敗:", updateError);
        return false;
      }

      // 連続記録テーブルを更新
      await this.updateStreakRecord(userId, completedDate, newStreak);

      return true;
    } catch (error) {
      console.error("連続日数更新エラー:", error);
      return false;
    }
  }

  /**
   * 連続記録テーブルを更新
   */
  private async updateStreakRecord(
    userId: string,
    completedDate: string,
    streakLength: number
  ): Promise<void> {
    // 現在アクティブな連続記録を取得
    const { data: activeStreak, error: fetchError } = await this.supabase
      .from("streak_records")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("アクティブな連続記録の取得に失敗:", fetchError);
      return;
    }

    if (activeStreak) {
      // 既存のアクティブな連続記録を更新
      await this.supabase
        .from("streak_records")
        .update({
          streak_length: streakLength,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeStreak.id);
    } else {
      // 新しい連続記録を作成
      await this.supabase.from("streak_records").insert({
        user_id: userId,
        streak_start_date: completedDate,
        streak_length: streakLength,
        is_active: true,
      });
    }
  }

  /**
   * 連続日数をリセット（チェックリストをスキップした場合）
   */
  async resetStreak(userId: string): Promise<boolean> {
    try {
      // 現在のアクティブな連続記録を終了
      const { error: endError } = await this.supabase
        .from("streak_records")
        .update({
          is_active: false,
          streak_end_date: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_active", true);

      if (endError) {
        console.error("連続記録の終了に失敗:", endError);
      }

      // ユーザーの連続日数をリセット
      const { error: resetError } = await this.supabase
        .from("auth_users")
        .update({
          streak_days: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (resetError) {
        console.error("連続日数のリセットに失敗:", resetError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("連続日数リセットエラー:", error);
      return false;
    }
  }

  /**
   * ユーザーの統計情報を取得
   */
  async getUserStatistics(userId: string, days: number = 30): Promise<UserStatisticsRecord[]> {
    const { data, error } = await this.supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", userId)
      .order("stat_date", { ascending: false })
      .limit(days);

    if (error) {
      console.error("統計情報の取得に失敗:", error);
      return [];
    }

    return data || [];
  }

  /**
   * 日別統計を更新
   */
  async updateDailyStatistics(
    userId: string,
    date: string,
    checklistsCompleted: number,
    itemsChecked: number,
    completionRate: number
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("user_statistics")
      .upsert({
        user_id: userId,
        stat_date: date,
        checklists_completed: checklistsCompleted,
        items_checked: itemsChecked,
        completion_rate: completionRate,
      });

    if (error) {
      console.error("日別統計の更新に失敗:", error);
      return false;
    }

    return true;
  }

  /**
   * 連続記録の履歴を取得
   */
  async getStreakHistory(userId: string): Promise<StreakRecordRecord[]> {
    const { data, error } = await this.supabase
      .from("streak_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("連続記録履歴の取得に失敗:", error);
      return [];
    }

    return data || [];
  }
}

export const streakAPI = new StreakAPI();
