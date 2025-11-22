import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Filter, X } from "lucide-react"; // Thêm icon Filter, X
import { GET_EVENTS } from "../../lib/queries";
import { client } from "../../lib/graphql";

export default function EventList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Thêm State cho bộ lọc ---
  const [filterStatus, setFilterStatus] = useState(""); // '' = Tất cả
  const [filterDate, setFilterDate] = useState(""); // YYYY-MM-DD

  // --- 2. Cập nhật useEffect để fetch lại khi filter thay đổi ---
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Truyền thêm status và date vào query variables
        const variables: any = { page: 1, limit: 20 };

        if (filterStatus) variables.status = filterStatus;
        if (filterDate) variables.date = filterDate;

        const data = await client.request(GET_EVENTS, variables);
        setEvents(data.events.events);
      } catch (error) {
        console.error("Lỗi tải sự kiện:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filterStatus, filterDate]); // Chạy lại khi filterStatus hoặc filterDate đổi

  // Hàm helper reset bộ lọc
  const clearFilters = () => {
    setFilterStatus("");
    setFilterDate("");
  };

  // Hàm helper hiển thị status (giữ nguyên)
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          label: "Sắp diễn ra",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "completed":
        return { label: "Đã kết thúc", className: "bg-gray-200 text-gray-600" };
      default:
        return {
          label: "Đang diễn ra",
          className: "bg-green-100 text-green-800",
        };
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
        Tất cả sự kiện
      </h1>

      {/* --- 3. Giao diện Bộ lọc (Filter Bar) --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <Filter size={20} />
          <span>Bộ lọc:</span>
        </div>

        {/* Dropdown Trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="completed">Đã kết thúc</option>
        </select>

        {/* Input Ngày */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Ngày:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Nút Xóa bộ lọc (chỉ hiện khi có filter) */}
        {(filterStatus || filterDate) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium px-3 py-2 transition"
          >
            <X size={18} />
            Xóa lọc
          </button>
        )}
      </div>

      {/* --- Danh sách sự kiện (Loading & Empty State) --- */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="loading loading-lg text-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">
            Không tìm thấy sự kiện nào phù hợp.
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 font-semibold mt-2 hover:underline"
          >
            Xóa bộ lọc để xem tất cả
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const statusInfo = getStatusDisplay(event.status);
            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col"
              >
                <div className="p-6 flex flex-col h-full">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800 line-clamp-2">
                    {event.title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar size={16} className="shrink-0" />
                    <span>
                      {format(new Date(event.startDate), "dd/MM/yyyy")} →{" "}
                      {format(new Date(event.endDate), "dd/MM/yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin size={16} className="shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm mb-4 mt-auto pt-4">
                    <Users size={16} />
                    {event.currentParticipants}/{event.maxParticipants}
                    <span
                      className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
