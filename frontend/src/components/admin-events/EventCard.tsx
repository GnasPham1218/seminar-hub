import React from "react";
import {
  CalendarDays,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Save,
  X,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { type Event, getStatusConfig, formatDate } from "../../lib/types";

interface EventCardProps {
  event: Event;
  isEditing: boolean;
  editForm: Partial<Event>;
  setEditForm: (form: Partial<Event>) => void;
  onStartEdit: (event: Event) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: (e?: React.MouseEvent) => void;
  onDelete: (event: Event) => void;
  onViewDetail: (event: Event) => void;
}

export default function EventCard({
  event,
  isEditing,
  editForm,
  setEditForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onViewDetail,
}: EventCardProps) {
  const status = getStatusConfig(event.status);
  const fillRate = event.currentParticipants / event.maxParticipants;

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-4">
      {/* Status Badge */}
      <div className="absolute top-6 right-6 z-10">
        <span
          className={`px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-2xl bg-linear-to-r ${status.gradient}`}
        >
          {status.label}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-6 pr-24">
          <div className="font-mono text-2xl font-bold text-indigo-600">
            #{event.id}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onStartEdit(event)}
              className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition shadow-sm hover:scale-110"
              title="Sửa"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event)}
              className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition shadow-sm hover:scale-110"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          // --- EDIT FORM ---
          <div className="space-y-4">
            <input
              type="text"
              value={editForm.title || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              placeholder="Tiêu đề"
            />
            <textarea
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none h-24 resize-none"
              placeholder="Mô tả"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={editForm.startDate || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, startDate: e.target.value })
                }
                className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="date"
                value={editForm.endDate || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, endDate: e.target.value })
                }
                className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={editForm.location || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, location: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              placeholder="Địa điểm"
            />
            <input
              type="number"
              value={editForm.maxParticipants || ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  maxParticipants: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              placeholder="Sức chứa"
            />
            <input
              type="number"
              value={editForm.fee || 0}
              onChange={(e) =>
                setEditForm({ ...editForm, fee: Number(e.target.value) })
              }
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              placeholder="Phí tham gia"
            />
            <select
              value={editForm.status || "upcoming"}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value as any })
              }
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã kết thúc</option>
            </select>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onSaveEdit(event.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg"
              >
                <Save className="w-5 h-5" /> Lưu
              </button>
              <button
                onClick={onCancelEdit}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition shadow-lg"
              >
                <X className="w-5 h-5" /> Hủy
              </button>
            </div>
          </div>
        ) : (
          // --- VIEW MODE ---
          <>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-4 line-clamp-2 leading-tight min-h-14">
              {event.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-6 min-h-15">
              {event.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-700">
                <CalendarDays className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="font-medium text-sm truncate">
                  {formatDate(event.startDate)} → {formatDate(event.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-purple-500 shrink-0" />
                <span className="font-medium text-sm truncate">
                  {event.location}
                </span>
              </div>
              {event.fee !== undefined && event.fee > 0 && (
                <div className="flex items-center gap-3 text-gray-700">
                  <DollarSign className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="font-medium text-sm">
                    {event.fee.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold">Tham gia</span>
                </div>
                <span className="text-xl font-bold">
                  {event.currentParticipants} / {event.maxParticipants}
                </span>
              </div>
              <progress
                className={`progress h-5 w-full ${
                  fillRate >= 0.9
                    ? "progress-error"
                    : fillRate >= 0.7
                    ? "progress-warning"
                    : "progress-success"
                }`}
                value={event.currentParticipants}
                max={event.maxParticipants}
              />
              <p className="text-sm text-gray-500 mt-2 text-right">
                {fillRate >= 1
                  ? "ĐÃ ĐẦY"
                  : `Còn ${
                      event.maxParticipants - event.currentParticipants
                    } chỗ`}
              </p>
            </div>

            <button
              onClick={() => onViewDetail(event)}
              className="w-full py-4 bg-linear-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              Xem chi tiết
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* Decor background */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-linear-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
    </div>
  );
}
