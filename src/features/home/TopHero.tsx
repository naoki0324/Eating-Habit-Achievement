import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAppStore, calculateContinuousDays } from "../../lib/store/appStore";
import { format } from "date-fns";

export const TopHero = () => {
  const user = useAppStore((state) => state.user);
  const dailyRecords = useAppStore((state) => state.dailyRecords);

  const continuousDays = useMemo(() => calculateContinuousDays(dailyRecords), [dailyRecords]);

  const goalDays = user?.goalDays ?? 0;
  const progressRatio = goalDays > 0 ? Math.min(continuousDays / goalDays, 1) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <section className="space-y-8">
      <motion.div
        className="rounded-3xl bg-slate-900 text-white px-8 py-10 shadow-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">STOCK DRAGON JOURNEY</p>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-normal">
          食材習慣を継続して、ドラゴンを育てよう！！
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl">
          今日のチェックリストを埋めて、連続達成日数を伸ばしましょう。<br />
          継続すればするほどドラゴンが成長し、新しい姿が解禁されます。
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-slate-300">現在の連続日数</p>
            <p className="text-2xl font-semibold">{continuousDays} 日</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-slate-300">目標日数</p>
            <p className="text-2xl font-semibold">{goalDays > 0 ? `${goalDays} 日` : "未設定"}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-slate-300">登録日</p>
            <p className="text-2xl font-semibold">
              {user ? format(new Date(user.createdAt), "yyyy年MM月dd日") : "-"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs text-slate-300 mb-2">達成状況</p>
          <div className="h-3 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span>0%</span>
            <span>{progressPercent}%</span>
            <span>100%</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
