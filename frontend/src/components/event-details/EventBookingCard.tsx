import { CheckCircle, CreditCard, Users, Ticket, AlertCircle, XCircle } from "lucide-react";

interface EventBookingCardProps {
  event: any;
  myRegistration: any;
  isFull: boolean;
  isProcessing: boolean;
  onRegister: () => void;
  onOpenPayment: () => void;
  onOpenCancel: () => void;
}

export default function EventBookingCard({
  event,
  myRegistration,
  isFull,
  isProcessing,
  onRegister,
  onOpenPayment,
  onOpenCancel,
}: EventBookingCardProps) {
  
  const priceFormatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(event.fee);

  // Logic hiển thị nút bấm
  const renderActions = () => {
    // Case 0: Sự kiện đã kết thúc
    if (event.status === "completed") {
      return (
        <button disabled className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed border border-gray-200">
          Sự kiện đã kết thúc
        </button>
      );
    }

    // Case 1: Chưa đăng ký
    if (!myRegistration) {
      return (
        <button
          onClick={onRegister}
          disabled={isFull || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform hover:-translate-y-1
            ${isFull 
              ? "bg-gray-400 cursor-not-allowed shadow-none" 
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"}`}
        >
          {isFull ? "Đã hết chỗ" : "Đăng ký ngay"}
        </button>
      );
    }

    // Case 2: Đã đăng ký nhưng chưa thanh toán
    if (myRegistration.paymentStatus === "unpaid") {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5"/>
            <span>Bạn đã giữ chỗ thành công. Vui lòng thanh toán để xác nhận vé.</span>
          </div>
          <button
            onClick={onOpenPayment}
            disabled={isProcessing}
            className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition flex justify-center items-center gap-2"
          >
            <CreditCard size={18} /> Thanh toán ngay
          </button>
          <button
            onClick={onOpenCancel}
            className="w-full py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition"
          >
            Hủy giữ chỗ
          </button>
        </div>
      );
    }

    // Case 3: Đã thanh toán (Vé confirmed)
    return (
      <div className="space-y-3">
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center justify-center text-center">
          <CheckCircle size={32} className="text-green-600 mb-2" />
          <span className="font-bold text-green-800">Bạn đã có vé!</span>
          <span className="text-xs text-green-600 mt-1">Mã vé: #{myRegistration.id.substring(0,8).toUpperCase()}</span>
        </div>
        
        <button
          onClick={onOpenCancel}
          className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 text-sm hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <XCircle size={16} /> Hủy vé tham gia
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
      {/* Header Card */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <span className="text-gray-500 font-medium text-sm">Phí tham dự</span>
        {event.fee === 0 ? (
          <span className="text-green-600 font-bold text-xl">Miễn phí</span>
        ) : (
          <span className="text-blue-600 font-bold text-2xl">{priceFormatted}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Thống kê nhanh */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-400" />
            <span>Đã đăng ký: <b>{event.currentParticipants}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket size={18} className="text-gray-400" />
            <span>Còn lại: <b>{event.maxParticipants - event.currentParticipants}</b></span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` }}
          ></div>
        </div>

        {/* Buttons Action */}
        {renderActions()}
      </div>
    </div>
  );
}