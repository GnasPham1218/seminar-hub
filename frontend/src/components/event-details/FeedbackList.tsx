// src/components/event-details/FeedbackList.tsx
interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  // Cập nhật interface user
  user?: {
    id: string;
    name: string;
  };
}

interface FeedbackListProps {
  feedbacks: Feedback[];
}

const renderStars = (rating: number) => {
  return [...Array(5)].map((_, i) => (
    <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
      ★
    </span>
  ));
};

// Hàm lấy chữ cái đầu để làm Avatar
const getAvatarChar = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (!feedbacks || feedbacks.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-green-500 pl-3">
        Đánh Giá Từ Tham Dự Viên
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex gap-4"
          >
            {/* Avatar Tròn */}
            <div className="shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              {getAvatarChar(fb.user?.name || "")}
            </div>

            <div className="grow">
              <div className="flex justify-between items-center mb-1">
                {/* Hiển thị tên User */}
                <h4 className="font-bold text-gray-900">
                  {fb.user?.name || "Người dùng ẩn danh"}
                </h4>
                <div className="text-sm">{renderStars(fb.rating)}</div>
              </div>

              <p className="text-gray-600 text-sm italic mb-2">
                "{fb.comment}"
              </p>

              <div className="text-xs text-gray-400">
                {new Date(fb.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
