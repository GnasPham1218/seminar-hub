// src/components/event-details/FeedbackForm.tsx
import { useState } from "react";
import { toast } from "sonner";
import { client } from "../../lib/graphql";
import { CREATE_FEEDBACK } from "../../lib/mutations";

interface FeedbackFormProps {
  eventId: string;
  sessionId?: string;
  onSuccess: (newFeedback: any) => void;
}

export default function FeedbackForm({
  eventId,
  sessionId,
  onSuccess,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await client.request(CREATE_FEEDBACK, {
        input: {
          eventId: eventId,
          sessionId: sessionId,
          rating: rating,
          comment: comment,
          // sessionId: null (nếu muốn đánh giá session cụ thể thì truyền vào)
        },
      });

      toast.success("Cảm ơn bạn đã đánh giá!");
      setComment("");
      setRating(5);
      // Callback để cập nhật lại list feedback bên ngoài
      onSuccess(data.createFeedback);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.errors?.[0]?.message || "Gửi đánh giá thất bại"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Gửi đánh giá của bạn
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Chọn sao */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-transform hover:scale-110 ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Nhập nội dung */}
        <textarea
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          rows={3}
          placeholder="Chia sẻ cảm nhận của bạn về sự kiện..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
}
