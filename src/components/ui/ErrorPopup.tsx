import { useEffect } from "react";
import { X, AlertCircle, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  showRegisterPrompt?: boolean;
  onRegisterClick?: () => void;
}

export const ErrorPopup = ({
  isOpen,
  onClose,
  title,
  message,
  showRegisterPrompt = false,
  onRegisterClick,
}: ErrorPopupProps) => {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* ポップアップ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              {/* ヘッダー */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              {/* コンテンツ */}
              <div className="px-6 py-4">
                <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
                
                {showRegisterPrompt && (
                  <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <UserPlus className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">
                          新規登録をお試しください
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          まだアカウントをお持ちでない場合は、新規登録から始めることができます。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* フッター */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                {showRegisterPrompt && onRegisterClick && (
                  <button
                    onClick={onRegisterClick}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    新規登録へ
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
