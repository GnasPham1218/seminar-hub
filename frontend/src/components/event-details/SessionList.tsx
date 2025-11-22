import { useState } from "react";
import FeedbackForm from "./FeedbackForm";
import { FileText, Download, User } from "lucide-react"; // Import thêm icon
const API_BASE_URL = "http://localhost:8000";
// 1. Cập nhật Interface cho Paper và Author
interface Author {
  id: string;
  name: string;
}

interface Paper {
  id: string;
  title: string;
  abstract: string;
  fileUrl: string;
  keywords: string[];
  authors: Author[];
}

// 2. Cập nhật Interface Session để chứa papers
interface Session {
  id: string;
  title: string;
  description: string;
  speakerId: string;
  startTime: string;
  endTime: string;
  room: string;
  topics: string[];
  papers?: Paper[];
}

interface SessionListProps {
  sessions: Session[];
  feedbacks: any[];
  currentUserId: string | null;
  eventId: string;
  onFeedbackSuccess: (newFeedback: any) => void;
  canReview: boolean;
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
  canReview,
}: SessionListProps) {
  const [openReviewSessionId, setOpenReviewSessionId] = useState<string | null>(
    null
  );

  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">Chưa có phiên họp.</div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
        Lịch Trình & Tài Liệu
      </h3>

      <div className="space-y-6">
        {sessions.map((session) => {
          const hasReviewed = feedbacks.some(
            (fb) => fb.sessionId === session.id && fb.user?.id === currentUserId
          );

          return (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* --- Phần thông tin Session (Giữ nguyên) --- */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="shrink-0 min-w-[120px]">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                    {formatDate(session.startTime)} -{" "}
                    {formatDate(session.endTime)}
                  </span>
                  <div className="text-sm text-gray-500 mt-2">
                    📍 {session.room}
                  </div>
                </div>

                <div className="grow">
                  <h4 className="text-lg font-bold text-gray-800">
                    {session.title}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 mb-2">
                    {session.description}
                  </p>
                  <div className="flex gap-2">
                    {session.topics.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end justify-start min-w-[140px]">
                  {hasReviewed ? (
                    <span className="text-green-600 font-medium text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200">
                      ✓ Đã đánh giá
                    </span>
                  ) : (
                    canReview && (
                      <button
                        onClick={() =>
                          setOpenReviewSessionId(
                            openReviewSessionId === session.id
                              ? null
                              : session.id
                          )
                        }
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {openReviewSessionId === session.id
                          ? "Đóng"
                          : "Viết đánh giá"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* --- 👇 PHẦN MỚI: DANH SÁCH BÀI BÁO (PAPERS) --- */}
              {session.papers && session.papers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Tài liệu & Tham luận ({session.papers.length})
                  </h5>

                  <div className="space-y-3">
                    {session.papers.map((paper) => (
                      <div
                        key={paper.id}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <a
                              href={paper.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-blue-700 hover:underline text-sm block mb-1"
                            >
                              {paper.title}
                            </a>

                            {/* Tác giả */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <User size={12} />
                              {paper.authors && paper.authors.length > 0
                                ? paper.authors.map((a) => a.name).join(", ")
                                : "Tác giả ẩn danh"}
                            </div>

                            {/* Abstract rút gọn */}
                            <p className="text-xs text-gray-600 line-clamp-2 italic">
                              {paper.abstract}
                            </p>
                          </div>

                          {/* Nút Download */}
                          <a
                            href={`${API_BASE_URL}/static/${paper.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Tải xuống PDF"
                            className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full transition"
                          >
                            <Download size={16} />
                          </a>
                        </div>

                        {/* Keywords */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {paper.keywords.map((k, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Form Đánh Giá (Giữ nguyên logic cũ) --- */}
              {openReviewSessionId === session.id && (
                <div className="mt-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
                  <FeedbackForm
                    eventId={eventId}
                    sessionId={session.id}
                    onSuccess={(newFb) => {
                      onFeedbackSuccess(newFb);
                      setOpenReviewSessionId(null);
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
