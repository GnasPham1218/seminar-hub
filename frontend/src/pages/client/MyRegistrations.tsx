import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Calendar, 
  MapPin, 
  Receipt, 
  CreditCard, 
  Trash2, 
  Ticket, 
  AlertTriangle, 
  X,
  ChevronRight,
  Clock,
  Filter
} from "lucide-react";
import { client } from "../../lib/graphql";
import { toast } from "sonner";

// Import từ các file của bạn
import { GET_MY_REGISTRATIONS } from "../../lib/queries";
import { DELETE_REGISTRATION } from "../../lib/mutations";

// --- COMPONENT: MODAL HỦY VÉ (Redesigned) ---
interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  eventName: string;
}

const CancelModal = ({ isOpen, onClose, onConfirm, isProcessing, eventName }: CancelModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 fade-in duration-300">
        {/* Decorative top pattern */}
        <div className="h-2 w-full bg-gradient-to-r from-red-400 to-red-600" />
        
        <div className="p-8">
          <div className="flex items-start gap-5">
            <div className="p-3 bg-red-50 rounded-2xl shrink-0 ring-1 ring-red-100">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">Hủy vé tham gia?</h3>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                Hành động này sẽ hủy đăng ký của bạn tại sự kiện bên dưới và không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
            <Ticket size={18} className="text-gray-400" />
            <span className="text-gray-900 font-semibold text-sm line-clamp-1">{eventName}</span>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Giữ vé lại
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đồng ý hủy"
              )}
            </button>
          </div>
        </div>
        
        {/* Close button absolute */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

// Badge trạng thái (Status Badge)
const StatusBadge = ({ status }: { status: string }) => {
  const isPaid = status === "paid";
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm
      ${isPaid 
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20" 
        : "bg-amber-50 text-amber-700 ring-1 ring-amber-500/20"
      }
    `}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
    </span>
  );
};

// Khối hiển thị ngày tháng (Date Block)
const DateBlock = ({ dateStr }: { dateStr: string }) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return (
    <div className="flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm rounded-2xl w-16 h-16 shrink-0">
      <span className="text-xs font-bold text-gray-400 uppercase">{format(date, "MMM", { locale: vi })}</span>
      <span className="text-xl font-black text-gray-800 leading-none">{format(date, "dd")}</span>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");
  
  // State cho Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<{id: string, eventName: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const fetchMyRegs = async () => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    try {
      const data = await client.request(GET_MY_REGISTRATIONS, {
        userId: currentUserId,
        page: 1,
        limit: 50
      });
      setRegistrations(data.registrations.registrations);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      toast.error("Không thể tải danh sách vé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegs();
  }, []);

  const filteredRegistrations = registrations.filter(reg => {
    if (filterStatus === "all") return true;
    return reg.paymentStatus === filterStatus;
  });

  const handleOpenCancelModal = (regId: string, eventName: string) => {
    setSelectedReg({ id: regId, eventName });
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReg) return;
    setIsProcessing(true);
    try {
      await client.request(DELETE_REGISTRATION, { id: selectedReg.id });
      toast.success("Đã hủy vé thành công");
      setRegistrations(prev => prev.filter(r => r.id !== selectedReg.id));
      setCancelModalOpen(false);
      setSelectedReg(null);
    } catch (error) {
      console.error(error);
      toast.error("Hủy vé thất bại, vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- AUTH CHECK UI ---
  if (!localStorage.getItem("currentUserId")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Yêu cầu đăng nhập</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Để xem và quản lý vé tham dự sự kiện, vui lòng đăng nhập vào tài khoản của bạn.
          </p>
          <button 
            onClick={() => navigate("/login")} 
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  // --- LOADING SKELETON UI ---
  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8 container mx-auto">
      <div className="h-10 w-48 bg-gray-200 rounded-lg mb-2 animate-pulse" />
      <div className="h-5 w-64 bg-gray-200 rounded-lg mb-12 animate-pulse" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white h-64 rounded-3xl border border-gray-100 shadow-sm p-6 animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <div className="container mx-auto py-16 px-4 md:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
              Vé Của Tôi
            </h1>
            <p className="text-gray-500 text-lg font-medium">
              Quản lý lịch trình và vé tham dự sự kiện
            </p>
          </div>
          
          {/* Modern Filter Tabs */}
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex items-center gap-1 overflow-x-auto max-w-full">
            {([
              { key: "all", label: "Tất cả" },
              { key: "unpaid", label: "Chờ thanh toán" },
              { key: "paid", label: "Đã thanh toán" }
            ] as const).map((tab) => {
              const isActive = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`
                    relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap
                    ${isActive ? "text-gray-900 shadow-sm bg-gray-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        {filteredRegistrations.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6 ring-1 ring-gray-100">
              <Filter size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Danh sách trống</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {filterStatus === 'all' 
                ? "Bạn chưa đăng ký tham gia sự kiện nào." 
                : `Không tìm thấy vé nào phù hợp với bộ lọc.`}
            </p>
            {filterStatus === 'all' && (
              <button 
                onClick={() => navigate("/events")} 
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
              >
                Khám phá sự kiện
              </button>
            )}
          </div>
        ) : (
          // Grid Cards
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRegistrations.map((reg) => (
              <div 
                key={reg.id} 
                className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col hover:-translate-y-1 overflow-hidden"
              >
                {/* Top Decoration Line */}
                <div className={`h-1.5 w-full ${reg.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header: Date & Status */}
                  <div className="flex justify-between items-start mb-6">
                    <DateBlock dateStr={reg.event?.startDate} />
                    <StatusBadge status={reg.paymentStatus} />
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/events/${reg.eventId}`)}
                    title={reg.event?.title}
                  >
                    {reg.event?.title || "Sự kiện không xác định"}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Clock size={16} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                         {reg.event?.startDate ? format(new Date(reg.event.startDate), "HH:mm - EEEE, dd/MM/yyyy", {locale: vi}) : "Chưa có giờ"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="truncate">{reg.event?.location || "Online"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 mt-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Receipt size={14} className="text-gray-600" />
                      </div>
                      <span>{reg.paymentAmount?.toLocaleString("vi-VN")} đ</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-auto pt-5 border-t border-gray-50 grid grid-cols-2 gap-3">
                    {reg.paymentStatus === 'paid' ? (
                      // Case: Paid
                      <>
                         <button 
                          onClick={() => handleOpenCancelModal(reg.id, reg.event?.title)}
                          className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Hủy vé
                        </button>
                        <button 
                          onClick={() => navigate(`/events/${reg.eventId}`)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          Chi tiết
                        </button>
                      </>
                    ) : (
                      // Case: Unpaid
                      <>
                        <button 
                          onClick={() => handleOpenCancelModal(reg.id, reg.event?.title)}
                          className="flex items-center justify-center w-10 h-full rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Hủy vé"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/events/${reg.eventId}`)}
                          className="col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all transform active:scale-95 w-full ml-auto"
                        >
                          <CreditCard size={16} /> Thanh toán
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CancelModal 
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isProcessing={isProcessing}
        eventName={selectedReg?.eventName || ""}
      />
    </div>
  );
}