import { AlertTriangle } from "lucide-react";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  eventTitle: string;
}

export default function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  eventTitle,
}: CancelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border-t-4 border-red-500">
        {/* Header */}
        <div className="p-6 pb-2 flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Hủy vé tham gia?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Bạn có chắc chắn muốn hủy đăng ký sự kiện này không? Hành động này
              không thể hoàn tác.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-2">
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-200">
            <span className="font-semibold">Sự kiện:</span> {eventTitle}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            Không, giữ vé
          </button>

          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-sm hover:shadow-md transition flex items-center gap-2 disabled:bg-gray-400"
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Đang hủy...
              </>
            ) : (
              "Đồng ý hủy"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}