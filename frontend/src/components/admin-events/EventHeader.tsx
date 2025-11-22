import { Plus } from "lucide-react";
import type { Event } from "../../lib/types";

interface EventHeaderProps {
  events: Event[];
  onOpenAddModal: () => void;
}

export default function EventHeader({
  events,
  onOpenAddModal,
}: EventHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
          Quản lý sự kiện
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Tổng cộng{" "}
          <span className="font-bold text-indigo-600">{events.length}</span> sự
          kiện •{" "}
          <span className="text-emerald-600 font-bold">
            {events.filter((e) => e.status === "ongoing").length}
          </span>{" "}
          đang diễn ra •{" "}
          <span className="text-orange-600 font-bold">
            {events.filter((e) => e.status === "upcoming").length}
          </span>{" "}
          sắp tới
        </p>
      </div>

      <button
        onClick={onOpenAddModal}
        className="group flex items-center gap-3 px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        Tạo sự kiện mới
      </button>
    </div>
  );
}
