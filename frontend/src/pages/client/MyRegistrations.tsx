import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MapPin,
  Receipt,
  CreditCard,
  Trash2,
  Clock,
  Filter,
  CalendarX // Icon cho trạng thái kết thúc
} from "lucide-react";
import { client } from "../../lib/graphql";
import { toast } from "sonner";
import { GET_MY_REGISTRATIONS } from "../../lib/queries";
import { DELETE_REGISTRATION } from "../../lib/mutations";

// --- HELPER COMPONENTS (Giữ nguyên) ---
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

// --- COMPONENT CHÍNH ---
export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");
  
  // State Modal (Giữ nguyên logic modal của bạn)
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<{id: string, eventName: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  // Fetch Data
  const fetchMyRegs = async () => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) return;
    try {
      const data = await client.request(GET_MY_REGISTRATIONS, {
        userId: currentUserId,
        page: 1,
        limit: 50
      });
      setRegistrations(data.registrations.registrations);
    } catch (err) {
      toast.error("Không thể tải danh sách vé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyRegs(); }, []);

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
    } catch (error) {
      toast.error("Hủy vé thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter
  const filteredRegistrations = registrations.filter(reg => {
    if (filterStatus === "all") return true;
    return reg.paymentStatus === filterStatus;
  });

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <div className="container mx-auto py-16 px-4 md:px-8 max-w-7xl">
        
        {/* Header & Tabs (Giữ nguyên) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Vé Của Tôi</h1>
            <p className="text-gray-500 text-lg font-medium">Quản lý lịch trình và vé tham dự sự kiện</p>
          </div>
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex gap-1">
            {[
              { key: "all", label: "Tất cả" },
              { key: "unpaid", label: "Chờ thanh toán" },
              { key: "paid", label: "Đã thanh toán" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterStatus === tab.key ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách vé */}
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <Filter size={32} className="mx-auto text-gray-300 mb-4"/>
            <p className="text-gray-500">Không tìm thấy vé nào.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRegistrations.map((reg) => {
              
              // 👇 LOGIC KIỂM TRA MỚI (1 TRONG 2) 👇
              const isEventEnded = 
                (reg.event?.endDate && new Date(reg.event.endDate) < new Date()) || // Quá ngày
                reg.event?.status === "completed"; // Hoặc status completed

              return (
                <div 
                  key={reg.id} 
                  className={`
                    group relative bg-white rounded-[2rem] border shadow-sm transition-all duration-300 flex flex-col overflow-hidden
                    ${isEventEnded 
                      ? 'opacity-80 grayscale-[20%] border-gray-200' // Style cho sự kiện đã qua
                      : 'border-gray-100 hover:shadow-xl hover:-translate-y-1'
                    }
                  `}
                >
                  {/* Thanh màu trên cùng */}
                  <div className={`h-1.5 w-full ${isEventEnded ? 'bg-gray-400' : (reg.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500')}`} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Ngày tháng & Trạng thái */}
                    <div className="flex justify-between items-start mb-6">
                      {reg.event?.startDate ? (
                         <div className="flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm rounded-2xl w-16 h-16 shrink-0">
                           <span className="text-xs font-bold text-gray-400 uppercase">{format(new Date(reg.event.startDate), "MMM", { locale: vi })}</span>
                           <span className="text-xl font-black text-gray-800 leading-none">{format(new Date(reg.event.startDate), "dd")}</span>
                         </div>
                      ) : <div className="w-16"/>}
                      
                      {/* Nếu kết thúc: Hiện badge xám. Nếu chưa: Hiện badge thanh toán */}
                      {isEventEnded ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-500 border border-gray-200">
                          Đã kết thúc
                        </span>
                      ) : (
                        <StatusBadge status={reg.paymentStatus} />
                      )}
                    </div>

                    <h3 onClick={() => navigate(`/events/${reg.eventId}`)} className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 cursor-pointer hover:text-indigo-600">
                      {reg.event?.title}
                    </h3>

                    {/* Thông tin chi tiết */}
                    <div className="space-y-3 mb-8 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <Clock size={16} />
                        <span>{reg.event?.startDate ? format(new Date(reg.event.startDate), "HH:mm - dd/MM/yyyy", {locale: vi}) : "..."}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} />
                        <span className="truncate">{reg.event?.location}</span>
                      </div>
                      <div className="flex items-center gap-3 font-semibold text-gray-900">
                        <Receipt size={16} />
                        <span>{reg.paymentAmount?.toLocaleString("vi-VN")} đ</span>
                      </div>
                    </div>

                    {/* 👇 LOGIC NÚT BẤM (Footer) 👇 */}
                    <div className="mt-auto pt-5 border-t border-gray-50 grid grid-cols-2 gap-3">
                      
                      {/* TRƯỜNG HỢP 1: SỰ KIỆN ĐÃ KẾT THÚC (Do ngày HOẶC status) */}
                      {isEventEnded ? (
                        <>
                           {/* Nút trái: Disabled */}
                           <button 
                             disabled
                             className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed border border-gray-100"
                           >
                             <CalendarX size={16} className="mr-2"/> Đã kết thúc
                           </button>

                           {/* Nút phải: Xem chi tiết */}
                           <button 
                             onClick={() => navigate(`/events/${reg.eventId}`)}
                             className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                           >
                             Xem lại
                           </button>
                        </>
                      ) : (
                        
                      /* TRƯỜNG HỢP 2: SỰ KIỆN ĐANG DIỄN RA (Chưa kết thúc) */
                        <>
                          {reg.paymentStatus === 'paid' ? (
                            // Đã thanh toán -> Hủy vé | Chi tiết
                            <>
                               <button 
                                onClick={() => handleOpenCancelModal(reg.id, reg.event?.title)}
                                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100"
                              >
                                Hủy vé
                              </button>
                              <button 
                                onClick={() => navigate(`/events/${reg.eventId}`)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                              >
                                Chi tiết
                              </button>
                            </>
                          ) : (
                            // Chưa thanh toán -> Hủy (Icon) | Thanh toán (Nổi bật)
                            <>
                              <button 
                                onClick={() => handleOpenCancelModal(reg.id, reg.event?.title)}
                                className="flex items-center justify-center w-full h-full rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                                title="Hủy vé"
                              >
                                <Trash2 size={20} />
                              </button>
                              <button 
                                onClick={() => navigate(`/events/${reg.eventId}`)}
                                className="col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-r from-amber-500 to-orange-600 hover:shadow-lg transform active:scale-95 w-full"
                              >
                                <CreditCard size={16} /> Thanh toán
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {/* 👆 HẾT PHẦN LOGIC NÚT BẤM 👆 */}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Confirm Hủy (Giữ nguyên) */}
      {cancelModalOpen && selectedReg && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)} />
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95">
              <h3 className="text-lg font-bold mb-2 text-gray-900">Xác nhận hủy vé?</h3>
              <p className="text-gray-500 text-sm mb-6">Bạn sẽ mất chỗ tại sự kiện <b>{selectedReg.eventName}</b>.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setCancelModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Giữ vé</button>
                <button onClick={handleConfirmCancel} disabled={isProcessing} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700">
                  {isProcessing ? "..." : "Đồng ý hủy"}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}