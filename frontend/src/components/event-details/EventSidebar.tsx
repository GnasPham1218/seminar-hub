interface EventSidebarProps {
  event: any;
}

export default function EventSidebar({ event }: EventSidebarProps) {
  // Hàm helper để lấy text và màu sắc dựa trên status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          label: "Sắp diễn ra",
          className: "bg-yellow-200 text-yellow-800",
        };
      case "completed":
        return {
          label: "Đã kết thúc",
          className: "bg-gray-200 text-gray-800", // Màu xám cho sự kiện đã qua
        };
      default: // Trường hợp còn lại (ongoing/active)
        return {
          label: "Đang diễn ra",
          className: "bg-green-200 text-green-800",
        };
    }
  };

  const statusInfo = getStatusDisplay(event.status);

  return (
    <div className="lg:w-1/3 bg-gradient-to-b from-blue-600 to-purple-600 rounded-2xl p-8 flex flex-col justify-center items-center text-white h-fit">
      <h2 className="text-3xl font-bold mb-6">Thông tin nhanh</h2>
      <div className="space-y-4 text-center text-lg">
        <p>
          Trạng thái:{" "}
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
        </p>
        <p>
          Đã có <span className="font-semibold">{event.currentParticipants}</span>{" "}
          người tham gia
        </p>
        <p>
          Địa điểm: <span className="font-semibold">{event.location}</span>
        </p>
      </div>
    </div>
  );
}