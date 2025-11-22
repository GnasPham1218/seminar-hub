import { AlertTriangle, Info, X, Loader2, Trash2, CheckCircle2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  type?: "danger" | "warning" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Cấu hình màu sắc và icon dựa trên loại modal
  const config = {
    danger: {
      icon: Trash2,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      btnColor: "bg-red-600 hover:bg-red-700",
      borderColor: "border-red-100",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      btnColor: "bg-orange-600 hover:bg-orange-700",
      borderColor: "border-orange-100",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      btnColor: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-100",
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      btnColor: "bg-green-600 hover:bg-green-700",
      borderColor: "border-green-100",
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header với Icon */}
        <div className={`p-6 flex flex-col items-center text-center border-b ${currentConfig.borderColor} ${currentConfig.bgColor}`}>
          <div className={`p-3 rounded-full bg-white shadow-sm mb-4 ${currentConfig.iconColor}`}>
            <Icon size={32} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Message */}
        <div className="p-6 text-center">
          <div className="text-gray-600 text-base leading-relaxed">
            {message}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 text-white font-bold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 ${currentConfig.btnColor}`}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}