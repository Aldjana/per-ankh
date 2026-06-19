import { FiAlertCircle, FiX } from "react-icons/fi";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Fermer"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        <div className="flex items-start gap-4 p-6 border-b border-slate-100">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isDangerous
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <FiAlertCircle className="text-xl" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex gap-3 p-6 bg-slate-50 rounded-b-2xl justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 h-10 rounded-lg border border-slate-200 text-slate-900 font-semibold text-sm hover:bg-slate-100 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 h-10 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50 flex items-center gap-2 ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
