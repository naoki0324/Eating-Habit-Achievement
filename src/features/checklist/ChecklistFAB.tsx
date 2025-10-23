import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface ChecklistFABProps {
  onClick: () => void;
}

export const ChecklistFAB = ({ onClick }: ChecklistFABProps) => (
  <AnimatePresence>
    <motion.button
      key="fab"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      aria-label="今日のチェックリストを開く"
    >
      <Plus className="size-7" />
    </motion.button>
  </AnimatePresence>
);
