import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { client } from "../../lib/graphql";
import {
  GET_EVENT,
  CHECK_REGISTRATION,
  GET_EVENT_SESSIONS,
  GET_EVENT_FEEDBACKS,
} from "../../lib/queries";
import {
  CREATE_REGISTRATION,
  UPDATE_REGISTRATION,
  DELETE_REGISTRATION,
} from "../../lib/mutations";
import EventInfo from "../../components/event-details/EventInfo";
import EventStats from "../../components/event-details/EventStats";
import EventActions from "../../components/event-details/EventActions";
import EventSidebar from "../../components/event-details/EventSidebar";
import PaymentModal from "../../components/event-details/PaymentModal";
import CancelModal from "../../components/event-details/CancelModal";
import SessionList from "../../components/event-details/SessionList";
import FeedbackList from "../../components/event-details/FeedbackList";
import FeedbackForm from "../../components/event-details/FeedbackForm";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRegistration, setMyRegistration] = useState<any>(null);

  // State quản lý UI
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUserId = localStorage.getItem("currentUserId");
  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy thông tin Event
        const eventData = await client.request(GET_EVENT, { id });
        setEvent(eventData.event);

        // 2. Lấy Sessions và Feedbacks song song để tối ưu tốc độ
        const [sessionsData, feedbacksData] = await Promise.all([
          client.request(GET_EVENT_SESSIONS, { eventId: id }),
          client.request(GET_EVENT_FEEDBACKS, { eventId: id }),
        ]);

        setSessions(sessionsData.sessions?.sessions || []);
        setFeedbacks(feedbacksData.feedbacks?.feedbacks || []);

        // 3. Kiểm tra đăng ký của user hiện tại
        const currentUserId = localStorage.getItem("currentUserId");
        if (currentUserId) {
          const regData = await client.request(CHECK_REGISTRATION, {
            event_id: id,
            user_id: currentUserId,
          });
          if (regData.registrations?.registrations?.length > 0) {
            setMyRegistration(regData.registrations.registrations[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error("Không thể tải thông tin sự kiện");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleInitialRegister = async () => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập trước khi đăng ký!");
      return;
    }

    try {
      const data = await client.request(CREATE_REGISTRATION, {
        input: {
          eventId: id,
          paymentAmount: event.fee,
          paymentStatus: "unpaid",
        },
      });

      toast.success("Đăng ký giữ chỗ thành công! Vui lòng thanh toán.");
      setMyRegistration(data.createRegistration);
      setEvent((prev: any) => ({
        ...prev,
        currentParticipants: prev.currentParticipants + 1,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Đăng ký thất bại.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!myRegistration?.id) return;
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await client.request(UPDATE_REGISTRATION, {
        id: myRegistration.id,
        input: { paymentStatus: "paid", status: "confirmed" },
      });
      toast.success("Thanh toán thành công! Vé đã được xác nhận.");
      setMyRegistration((prev: any) => ({
        ...prev,
        paymentStatus: "paid",
        status: "confirmed",
      }));
      setShowPaymentModal(false);
    } catch (err) {
      toast.error("Thanh toán thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!myRegistration?.id) return;
    setIsProcessing(true);
    try {
      await client.request(DELETE_REGISTRATION, { id: myRegistration.id });
      toast.success("Đã hủy đăng ký thành công.");
      setMyRegistration(null);
      setShowCancelModal(false);
      setEvent((prev: any) => ({
        ...prev,
        currentParticipants: prev.currentParticipants - 1,
      }));
    } catch (err) {
      toast.error("Hủy đăng ký thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-lg"></div>
      </div>
    );

  const isFull = event.currentParticipants >= event.maxParticipants;
  // Điều kiện: Sự kiện đã kết thúc (completed) VÀ User có vé confirmed
  const canReview =
    event?.status === "completed" && myRegistration?.status === "confirmed";

  // Hàm cập nhật danh sách khi gửi feedback thành công
  const handleFeedbackSuccess = (newFeedback: any) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
  };
  return (
    <div className="container mx-auto py-12 px-4 relative">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cột trái: Chi tiết sự kiện */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col">
          <EventInfo event={event} />

          <EventStats
            currentParticipants={event.currentParticipants}
            maxParticipants={event.maxParticipants}
            price={event.fee}
          />

          <EventActions
            eventStatus={event.status} // <--- THÊM DÒNG NÀY
            myRegistration={myRegistration}
            isFull={isFull}
            isProcessing={isProcessing}
            onRegister={handleInitialRegister}
            onOpenPayment={() => setShowPaymentModal(true)}
            onOpenCancel={() => setShowCancelModal(true)}
            onBack={() => window.history.back()}
          />
          <div className="border-t border-gray-100 pt-8 mt-8">
            {/* Truyền các props mới vào SessionList */}
            <SessionList
              sessions={sessions}
              feedbacks={feedbacks} // Để check xem đã review session nào chưa
              currentUserId={currentUserId}
              eventId={id || ""}
              onFeedbackSuccess={handleFeedbackSuccess}
              canReview={canReview}
            />

            {/* Bên dưới hiển thị danh sách tất cả feedback (tổng hợp) */}
            <FeedbackList feedbacks={feedbacks} />
          </div>
        </div>

        {/* Cột phải: Sidebar */}
        <EventSidebar event={event} />
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        isProcessing={isProcessing}
        eventTitle={event.title}
        amount={1500000}
      />

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        isProcessing={isProcessing}
        eventTitle={event.title}
      />
    </div>
  );
}
