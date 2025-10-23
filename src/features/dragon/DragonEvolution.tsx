import { motion } from "framer-motion";

const stages = [
  {
    title: "卵がゆらゆら",
    description: "継続を始めたあなたの卵が、ほんのり光り始めました",
    gradient: "from-emerald-300 via-emerald-200 to-amber-100",
  },
  {
    title: "孵化の兆し",
    description: "殻にヒビが入り、赤ちゃんドラゴンが姿を見せる準備をしています",
    gradient: "from-emerald-400 via-emerald-200 to-amber-200",
  },
  {
    title: "赤ちゃんドラゴン",
    description: "毎日続けた成果が、かわいい赤ちゃんドラゴンの誕生につながりました",
    gradient: "from-emerald-500 via-emerald-300 to-amber-200",
  },
  {
    title: "成長したドラゴン",
    description: "継続が習慣になり、立派なドラゴンがあなたを守ってくれます",
    gradient: "from-emerald-600 via-emerald-400 to-amber-200",
  },
];

const stageIcons = [
  "🥚",
  "💫",
  "🐲",
  "🐉",
];

interface DragonEvolutionProps {
  progressRatio: number;
}

export const DragonEvolution = ({ progressRatio }: DragonEvolutionProps) => {
  const index = Math.min(Math.floor(progressRatio * stages.length), stages.length - 1);
  const stage = stages[index];
  const nextProgress = Math.min(1, progressRatio);

  return (
    <motion.section
      key={stage.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br ${stage.gradient} shadow-2xl`}
    >
      <div className="absolute -top-20 -right-12 h-60 w-60 bg-white/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-14 h-60 w-60 bg-emerald-200/50 rounded-full blur-3xl" />
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
        <motion.div
          className="text-6xl md:text-7xl lg:text-8xl drop-shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: [0.92, 1, 0.92],
            opacity: 1,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {stageIcons[index]}
        </motion.div>

        <div className="text-slate-800 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{stage.title}</h2>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">
            {stage.description}
          </p>
          <div className="h-2 rounded-full bg-white/40 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${nextProgress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};
