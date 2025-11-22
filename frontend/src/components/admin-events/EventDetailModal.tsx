import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPinned,
  DollarSign,
  Users,
  Clock,
  Edit3,
  Trash2,
  X,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { type Event, getStatusConfig, formatDate } from "../../lib/types";
import { client } from "../../lib/graphql";
import { GET_EVENT_REGISTRATIONS } from "../../lib/queries";

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

interface Participant {
  id: string;
  status: string;
  paymentStatus: string;
  registrationDate: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    organization: string;
  };
}

export default function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Fetch danh sách người tham gia khi mở modal
  useEffect(() => {
    if (event?.id) {
      fetchParticipants(event.id);
    } else {
      setParticipants([]);
    }
  }, [event]);

  const fetchParticipants = async (eventId: string) => {
    setLoadingParticipants(true);
    try {
      // Lấy tối đa 100 người tham gia để hiển thị (có thể phân trang nếu cần)
      const response: any = await client.request(GET_EVENT_REGISTRATIONS, {
        eventId: eventId,
        page: 1,
        limit: 100,
      });
      setParticipants(response.registrations.registrations);
    } catch (error) {
      console.error("Lỗi tải người tham gia:", error);
      toast.error("Không thể tải danh sách người tham gia");
    } finally {
      setLoadingParticipants(false);
    }
  };

  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 flex items-center justify-between z-50">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
            <CalendarDays className="w-8 h-8 text-indigo-600" />
            Chi tiết sự kiện
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* 1. THÔNG TIN CHUNG */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-mono mb-3">
                #{event.id}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Thời gian</p>
                    <p className="text-base font-bold text-gray-800">
                      {formatDate(event.startDate)} <br />
                      <span className="text-gray-400 font-normal">đến</span>{" "}
                      {formatDate(event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-purple-600">
                    <MapPinned className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Địa điểm</p>
                    <p className="text-base font-bold text-gray-800">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 font-medium">
                      Tiến độ tham gia
                    </p>
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xl font-bold text-gray-800">
                        {event.currentParticipants}
                        <span className="text-sm text-gray-400 font-normal">
                          /{event.maxParticipants}
                        </span>
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (event.currentParticipants / event.maxParticipants) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-green-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phí tham gia</p>
                    <p className="text-xl font-bold text-gray-800">
                      {event.fee > 0
                        ? `${event.fee.toLocaleString("vi-VN")} đ`
                        : "Miễn phí"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DANH SÁCH NGƯỜI THAM GIA (PHẦN MỚI) */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BadgeCheck className="w-6 h-6 text-blue-600" />
              Danh sách người tham gia ({participants.length})
            </h3>

            {loadingParticipants ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                Chưa có ai đăng ký sự kiện này.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Liên hệ</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Trạng thái vé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {participants.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">
                            {p.user.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {p.user.id}
                          </div>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-3 h-3" /> {p.user.email}
                          </div>
                          {p.user.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-3 h-3" /> {p.user.phone}
                            </div>
                          )}
                          {p.user.organization && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building2 className="w-3 h-3" />{" "}
                              {p.user.organization}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              p.user.role === "admin"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : p.user.role === "researcher"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-gray-50 text-gray-700 border-gray-100"
                            }`}
                          >
                            {p.user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-xs font-bold ${
                                p.status === "confirmed"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {p.status === "confirmed"
                                ? "Đã xác nhận"
                                : "Chờ xử lý"}
                            </span>
                            <span
                              className={`text-xs ${
                                p.paymentStatus === "paid"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {p.paymentStatus === "paid"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
            <button
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition flex items-center gap-2"
            >
              <Edit3 className="w-5 h-5" /> Sửa
            </button>
            <button
              onClick={() => {
                onDelete(event);
                onClose();
              }}
              className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 font-bold rounded-xl hover:bg-red-50 transition flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Xóa
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition shadow-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}