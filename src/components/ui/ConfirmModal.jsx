import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel, variant = 'danger' }) {
  if (!isOpen) return null;

  const colors = variant === 'danger'
    ? { bg: 'bg-red-50', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' }
    : { bg: 'bg-indigo-50', text: 'text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700' };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-sm font-medium text-slate-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 text-white rounded-xl font-bold text-sm transition-all ${colors.btn}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
