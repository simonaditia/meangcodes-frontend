import React, { useEffect } from "react";

export default function ActionToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast?.message) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onClose();
    }, 2600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [toast, onClose]);

  if (!toast?.message) {
    return null;
  }

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ${
        isSuccess
          ? "border-emerald-200 bg-white/95 text-emerald-700 dark:border-emerald-700 dark:bg-slate-900/95 dark:text-emerald-300"
          : "border-rose-200 bg-white/95 text-rose-700 dark:border-rose-700 dark:bg-slate-900/95 dark:text-rose-300"
      }`}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  );
}
