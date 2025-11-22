import {
  CalendarDays,
  MapPinned,
  DollarSign,
  Users,
  Clock,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import { type Event, getStatusConfig, formatDate } from "../../lib/types";

interface EventDetailModalProps {
  event: Event | null;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export default function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 flex items-center justify-between z-50">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <CalendarDays className="w-10 h-10 text-indigo-600" />
            Chi tiết sự kiện
          </h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center">
            <div className="font-mono text-2xl text-indigo-600 mb-4">
              #{event.id}
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-100 rounded-2xl">
                  <CalendarDays className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian diễn ra</p>
                  <p className="text-xl font-bold">
                    {formatDate(event.startDate)} → {formatDate(event.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <MapPinned className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Địa điểm</p>
                  <p className="text-xl font-bold">{event.location}</p>
                </div>
              </div>

              {event.fee !== undefined && event.fee > 0 && (
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-100 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phí tham gia</p>
                    <p className="text-xl font-bold">
                      {event.fee.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-100 rounded-2xl">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số lượng tham gia</p>
                  <p className="text-3xl font-bold">
                    {event.currentParticipants} / {event.maxParticipants}
                  </p>
                  <progress
                    className={`progress h-6 w-full mt-2 ${
                      event.currentParticipants / event.maxParticipants >= 0.9
                        ? "progress-error"
                        : "progress-success"
                    }`}
                    value={event.currentParticipants}
                    max={event.maxParticipants}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-100 rounded-2xl">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 ">Trạng thái</p>
                  <span>{getStatusConfig(event.status).label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg flex items-center gap-3"
            >
              <Edit3 className="w-5 h-5" /> Sửa sự kiện
            </button>
            <button
              onClick={() => {
                onDelete(event);
                onClose();
              }}
              className="px-8 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg flex items-center gap-3"
            >
              <Trash2 className="w-5 h-5" /> Xóa sự kiện
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
