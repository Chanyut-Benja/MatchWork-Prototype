import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const TONE_MAP = {
  success: {
    border: 'border-emerald-600/30',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
  },
  error: {
    border: 'border-red-600/30',
    icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
  },
  info: {
    border: 'border-neutral-300',
    icon: <Info className="w-4 h-4 text-neutral-700 shrink-0" />,
  },
};

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const tone = TONE_MAP[toast.type] || TONE_MAP.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] animate-editorial-in">
      <div
        className={`bg-white dark:bg-[#141416] border ${tone.border} rounded-lg px-4 py-3 shadow-sm flex items-start gap-3`}
      >
        <div className="mt-0.5">{tone.icon}</div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-xs font-semibold text-[#111111] dark:text-neutral-100 leading-snug">
              {toast.title}
            </p>
          )}
          {toast.message && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-neutral-400 hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
