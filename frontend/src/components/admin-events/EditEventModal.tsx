import { useState, useEffect } from "react";
import {
  X,
  Save,
  CalendarDays,
  MapPin,
  Type,
  FileText,
  Users,
  DollarSign,
  Activity,
  Loader2,
} from "lucide-react";
import { type Event } from "../../lib/types";

interface EditEventModalProps {
  event: Event | null;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
}

export default function EditEventModal({
  event,
  onClose,
  onUpdate,
}: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: 0,
    fee: 0,
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dữ liệu sự kiện vào form khi modal mở
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        // Cắt chuỗi ISO để lấy phần YYYY-MM-DD cho input type="date"
        startDate: event.startDate.split("T")[0],
        endDate: event.endDate.split("T")[0],
        location: event.location,
        maxParticipants: event.maxParticipants,
        fee: event.fee,
        status: event.status,
      });
    }
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Chỉ gửi các trường cần thiết lên API
      const updateInput = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        maxParticipants: Number(formData.maxParticipants),
        fee: Number(formData.fee),
        status: formData.status,
      };

      await onUpdate(event.id, updateInput);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            <Edit3Icon className="text-blue-600" /> Chỉnh sửa sự kiện
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Type size={16} className="text-blue-600" /> Tên sự kiện
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" /> Ngày bắt
                đầu
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" /> Ngày kết
                thúc
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" /> Địa điểm
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Activity size={16} className="text-blue-600" /> Trạng thái
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Fee & Max Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-blue-600" /> Phí tham gia
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.fee}
                onChange={(e) =>
                  setFormData({ ...formData, fee: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> Số lượng tối đa
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipants: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Mô tả chi tiết
            </label>
            <textarea
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Icon phụ
function Edit3Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
