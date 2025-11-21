import { Users, Clock } from "lucide-react";

interface EventStatsProps {
  currentParticipants: number;
  maxParticipants: number;
  price: number; // giả sử 1500000
}

export default function EventStats({
  currentParticipants,
  maxParticipants,
  price = 1500000,
}: EventStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow hover:shadow-md transition">
        <Users size={40} className="text-blue-500 mb-2" />
        <div className="text-lg font-semibold">
          {currentParticipants}/{maxParticipants}
        </div>
        <div className="text-sm text-gray-500">
          Còn {maxParticipants - currentParticipants} chỗ trống
        </div>
      </div>
      <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow hover:shadow-md transition">
        <Clock size={40} className="text-green-500 mb-2" />
        <div className="text-lg font-semibold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </div>
        <div className="text-sm text-gray-500">Phí tham gia</div>
      </div>
    </div>
  );
}