import { CreditCard, X, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  eventTitle: string;
  amount: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  eventTitle,
  amount,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Cổng thanh toán
          </h3>
          <button
            onClick={() => !isProcessing && onClose()}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-gray-600 mb-1">Đơn hàng:</p>
            <p className="font-semibold text-gray-800">{eventTitle}</p>
            <div className="mt-2 flex items-center gap-2 text-amber-700 text-sm">
              <AlertCircle size={16} /> Trạng thái: Chưa thanh toán
            </div>
          </div>
          <div className="flex justify-between items-center py-4 border-t border-b border-dashed border-gray-300">
            <span className="text-gray-600">Tổng tiền:</span>
            <span className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(amount)}
            </span>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p>
              Phương thức: <b>Ví điện tử giả lập</b>
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            Để sau
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-md hover:shadow-lg transition flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Đang xử lý...
              </>
            ) : (
              "Thanh toán ngay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}