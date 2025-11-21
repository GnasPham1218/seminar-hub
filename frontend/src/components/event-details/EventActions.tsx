import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface EventActionsProps {
  myRegistration: any;
  isFull: boolean;
  isProcessing: boolean;
  onRegister: () => void;
  onOpenPayment: () => void;
  onOpenCancel: () => void;
  onBack: () => void;
}

export default function EventActions({
  myRegistration,
  isFull,
  isProcessing,
  onRegister,
  onOpenPayment,
  onOpenCancel,
  onBack,
}: EventActionsProps) {
  const renderButtons = () => {
    // 1. Chưa đăng ký
    if (!myRegistration) {
      return (
        <button
          onClick={onRegister}
          disabled={isFull || isProcessing}
          className={`flex-1 py-3 rounded-lg font-semibold transition text-white
            ${
              isFull
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isFull ? "Đã hết chỗ" : "Đăng ký giữ chỗ"}
        </button>
      );
    }

    // 2. Đã đăng ký (Chưa thanh toán)
    if (
      myRegistration.paymentStatus === "unpaid" ||
      myRegistration.paymentStatus === "pending"
    ) {
      return (
        <>
          <button
            onClick={onOpenPayment}
            disabled={isProcessing}
            className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2 animate-pulse"
          >
            <AlertCircle size={20} />
            Thanh toán ngay
          </button>

          <button
            onClick={onOpenCancel}
            disabled={isProcessing}
            className="px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center"
            title="Hủy đăng ký"
          >
            <Trash2 size={20} />
          </button>
        </>
      );
    }

    // 3. Đã thanh toán
    return (
      <>
        <button
          disabled
          className="flex-1 bg-green-100 text-green-700 border border-green-500 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Đã thanh toán
        </button>

        <button
          onClick={onOpenCancel}
          disabled={isProcessing}
          className="px-6 py-3 bg-white border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 hover:border-red-400 transition flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Hủy vé
        </button>
      </>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {renderButtons()}
      <button
        onClick={onBack}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
      >
        <ArrowLeft /> Quay lại
      </button>
    </div>
  );
}