import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Share2, ArrowLeft } from "lucide-react";
import { client } from "../../lib/graphql";

// Queries & Mutations
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

// Components
import SessionList from "../../components/event-details/SessionList";
import FeedbackList from "../../components/event-details/FeedbackList";
import PaperSubmissionForm from "../../components/event-details/PaperSubmissionForm";
import PaymentModal from "../../components/event-details/PaymentModal";
import CancelModal from "../../components/event-details/CancelModal";

// UI Components (Tách nhỏ để code gọn hơn)
import EventBookingCard from "../../components/event-details/EventBookingCard"; // Sidebar mới
import { format } from "date-fns";

export default function EventDetail() {
  const { id } = useParams();

  // --- STATE QUẢN LÝ DATA ---
  const [event, setEvent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [myRegistration, setMyRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState<"about" | "schedule" | "reviews">(
    "about"
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaperForm, setShowPaperForm] = useState(false);

  // --- AUTH INFO ---
  const currentUserId = localStorage.getItem("currentUserId");
  const currentUserStr = localStorage.getItem("currentUser");
  const currentUserObj = currentUserStr ? JSON.parse(currentUserStr) : null;
  const currentUserRole = currentUserObj?.role;

  // --- FETCH DATA (Giữ nguyên logic cũ) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await client.request(GET_EVENT, { id });
        setEvent(eventData.event);

        const [sessionsData, feedbacksData] = await Promise.all([
          client.request(GET_EVENT_SESSIONS, { eventId: id }),
          client.request(GET_EVENT_FEEDBACKS, { eventId: id }),
        ]);

        setSessions(sessionsData.sessions?.sessions || []);
        setFeedbacks(feedbacksData.feedbacks?.feedbacks || []);

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
  }, [id, currentUserId]);

  // --- HANDLERS (Giữ nguyên logic cũ) ---
  const handleInitialRegister = async () => {
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
      toast.success("Thanh toán thành công!");
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
      toast.success("Đã hủy vé.");
      setMyRegistration(null);
      setShowCancelModal(false);
      setEvent((prev: any) => ({
        ...prev,
        currentParticipants: prev.currentParticipants - 1,
      }));
    } catch (err) {
      toast.error("Hủy thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaperSuccess = () => {
    setShowPaperForm(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleFeedbackSuccess = (newFeedback: any) => {
    setFeedbacks((prev) => [newFeedback, ...prev]);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="loading loading-bars loading-lg text-blue-600"></div>
      </div>
    );

  // LOGIC PERMISSION
  const isEventEnded =
    (event.endDate && new Date(event.endDate) < new Date()) ||
    event.status === "completed";
  const isFull = event.currentParticipants >= event.maxParticipants;
  const canReview =
    event?.status === "completed" && myRegistration?.status === "confirmed";
  const canSubmitPaper =
    (currentUserRole === "admin" || currentUserRole === "researcher") &&
    !isEventEnded;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. HERO SECTION (HEADER) */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white pt-24 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-200 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
          </button>

          <div className="flex flex-col gap-4">
            <span className="inline-block w-fit px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium">
              {event.status === "upcoming"
                ? "Sắp diễn ra"
                : event.status === "completed"
                ? "Đã kết thúc"
                : "Đang diễn ra"}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-blue-100 mt-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {format(new Date(event.startDate), "dd/MM/yyyy")} -{" "}
                {format(new Date(event.endDate), "dd/MM/yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT LAYOUT */}
      <div className="container mx-auto max-w-6xl px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI (NỘI DUNG CHÍNH - 2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
              {/* TABS NAVIGATION */}
              <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
                <button
                  onClick={() => setActiveTab("about")}
                  className={`flex-1 py-4 font-semibold text-sm text-center border-b-2 transition ${
                    activeTab === "about"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Giới thiệu
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`flex-1 py-4 font-semibold text-sm text-center border-b-2 transition ${
                    activeTab === "schedule"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Lịch trình & Tài liệu
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-4 font-semibold text-sm text-center border-b-2 transition ${
                    activeTab === "reviews"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Đánh giá ({feedbacks.length})
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="p-6 md:p-8">
                {activeTab === "about" && (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      Mô tả sự kiện
                    </h3>
                    <div className="prose max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                      {event.description}
                    </div>

                    {/* Thêm thông tin bổ sung nếu có */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2">
                        <Clock size={18} /> Lưu ý quan trọng
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>
                          Vui lòng mang theo vé điện tử (QR Code) khi check-in.
                        </li>
                        <li>
                          Trang phục lịch sự, phù hợp với tính chất sự kiện.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="animate-in fade-in duration-300">
                    {/* Header Section of Tab */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">
                        Chương trình chi tiết
                      </h3>
                      {canSubmitPaper && !showPaperForm && (
                        <button
                          onClick={() => setShowPaperForm(true)}
                          className="text-sm bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
                        >
                          + Nộp tham luận
                        </button>
                      )}
                    </div>

                    {showPaperForm && (
                      <PaperSubmissionForm
                        eventId={id || ""}
                        sessions={sessions}
                        onSuccess={handlePaperSuccess}
                        onCancel={() => setShowPaperForm(false)}
                      />
                    )}

                    <SessionList
                      sessions={sessions}
                      feedbacks={feedbacks}
                      currentUserId={currentUserId}
                      eventId={id || ""}
                      onFeedbackSuccess={handleFeedbackSuccess}
                      canReview={canReview}
                    />
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="animate-in fade-in duration-300">
                    <FeedbackList feedbacks={feedbacks} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (SIDEBAR - 1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card Component Mới */}
              <EventBookingCard
                event={event}
                myRegistration={myRegistration}
                isFull={isFull}
                isProcessing={isProcessing}
                onRegister={handleInitialRegister}
                onOpenPayment={() => setShowPaymentModal(true)}
                onOpenCancel={() => setShowCancelModal(true)}
              />

              {/* Share / Support Box */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between text-gray-600 hover:text-blue-600 cursor-pointer transition">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Share2 size={18} /> Chia sẻ sự kiện
                  </span>
                </div>
                <div className="border-t border-gray-100 my-4"></div>
                <p className="text-xs text-gray-400 text-center">
                  Cần hỗ trợ? Liên hệ: support@eventhub.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        isProcessing={isProcessing}
        eventTitle={event.title}
        amount={event.fee}
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
