import { CalendarDays, X } from "lucide-react";
import type { CreateEventInput } from "../../lib/types";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEvent: CreateEventInput;
  setNewEvent: (event: CreateEventInput) => void;
  onSubmit: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  onSubmit,
}: CreateEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <CalendarDays className="w-10 h-10 text-indigo-600" />
            Tạo sự kiện mới
          </h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tiêu đề sự kiện *
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề sự kiện..."
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              placeholder="Nhập mô tả sự kiện..."
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition h-32 resize-none"
            />
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày bắt đầu *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={newEvent.startDate}
                  max={newEvent.endDate} // Ràng buộc: Không được lớn hơn ngày kết thúc
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startDate: e.target.value })
                  }
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày kết thúc *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={newEvent.endDate}
                  min={newEvent.startDate} // Ràng buộc: Không được nhỏ hơn ngày bắt đầu
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endDate: e.target.value })
                  }
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Địa điểm *
            </label>
            <input
              type="text"
              placeholder="Nhập địa điểm tổ chức..."
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Sức chứa */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sức chứa tối đa
            </label>
            <input
              type="number"
              min="0" // Ràng buộc HTML không cho nhập số âm
              placeholder="Số lượng người tham gia tối đa..."
              value={newEvent.maxParticipants}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  // Ràng buộc logic: Luôn lấy số lớn hơn hoặc bằng 0
                  maxParticipants: Math.max(0, Number(e.target.value)),
                })
              }
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Phí tham gia */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phí tham gia (VNĐ)
            </label>
            <input
              type="number"
              min="0" // Ràng buộc HTML không cho nhập số âm
              placeholder="Nhập 0 nếu miễn phí"
              value={newEvent.fee}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  // Ràng buộc logic: Luôn lấy số lớn hơn hoặc bằng 0
                  fee: Math.max(0, Number(e.target.value)),
                })
              }
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Trạng thái sự kiện
            </label>
            <select
              value={newEvent.status}
              onChange={(e) =>
                setNewEvent({ ...newEvent, status: e.target.value as any })
              }
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition"
            >
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onSubmit}
            className="flex-1 py-4 bg-linear-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Tạo sự kiện
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl hover:bg-gray-300 transition"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
