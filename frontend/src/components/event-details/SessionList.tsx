// src/components/event-details/SessionList.tsx
import React, { useState } from "react";
import FeedbackForm from "./FeedbackForm"; // Tái sử dụng Form cũ

interface Session {
  id: string;
  title: string;
  description: string;
  speakerId: string;
  startTime: string;
  endTime: string;
  room: string;
  topics: string[];
}

interface SessionListProps {
  sessions: Session[];
  feedbacks: any[]; // Truyền danh sách feedback vào để check
  currentUserId: string | null;
  eventId: string;
  onFeedbackSuccess: (newFeedback: any) => void;
  canReview: boolean; // Biến check logic event completed
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SessionList({ 
  sessions, 
  feedbacks, 
  currentUserId, 
  eventId,
  onFeedbackSuccess,
  canReview
}: SessionListProps) {
  // State để biết đang mở form đánh giá cho session nào
  const [openReviewSessionId, setOpenReviewSessionId] = useState<string | null>(null);

  if (!sessions || sessions.length === 0) {
    return <div className="p-6 text-center text-gray-500">Chưa có phiên họp.</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
        Lịch Trình & Đánh Giá Phiên
      </h3>
      
      <div className="space-y-6">
        {sessions.map((session) => {
          // Kiểm tra xem User hiện tại đã đánh giá session này chưa
          const hasReviewed = feedbacks.some(
            (fb) => fb.sessionId === session.id && fb.user?.id === currentUserId
          );

          return (
            <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Thông tin Session (Giữ nguyên) */}
                <div className="flex-shrink-0 min-w-[120px]">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                    {formatDate(session.startTime)} - {formatDate(session.endTime)}
                  </span>
                  <div className="text-sm text-gray-500 mt-2">📍 {session.room}</div>
                </div>

                <div className="flex-grow">
                  <h4 className="text-lg font-bold text-gray-800">{session.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 mb-2">{session.description}</p>
                  <div className="flex gap-2">
                    {session.topics.map((t, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">#{t}</span>
                    ))}
                  </div>
                </div>

                {/* Nút Thao Tác Đánh Giá */}
                <div className="flex-shrink-0 flex flex-col items-end justify-center min-w-[140px]">
                  {hasReviewed ? (
                    <span className="text-green-600 font-medium text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      ✓ Đã đánh giá
                    </span>
                  ) : (
                    canReview && (
                      <button
                        onClick={() => setOpenReviewSessionId(
                          openReviewSessionId === session.id ? null : session.id
                        )}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {openReviewSessionId === session.id ? "Đóng" : "Viết đánh giá"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Form Đánh Giá (Hiện ra khi bấm nút) */}
              {openReviewSessionId === session.id && (
                <div className="mt-4 pl-0 md:pl-[140px] border-t pt-4 animate-in fade-in slide-in-from-top-2">
                  <FeedbackForm 
                    eventId={eventId} 
                    // Truyền thêm sessionId vào props của Form (Cần sửa nhẹ FeedbackForm)
                    sessionId={session.id} 
                    onSuccess={(newFb) => {
                      onFeedbackSuccess(newFb);
                      setOpenReviewSessionId(null); // Đóng form sau khi gửi
                    }} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}