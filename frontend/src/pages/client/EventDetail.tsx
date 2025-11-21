import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { client } from "../../lib/graphql";
import { GET_EVENT, CHECK_REGISTRATION } from "../../lib/queries";
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


export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myRegistration, setMyRegistration] = useState<any>(null);

  // State quản lý UI
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await client.request(GET_EVENT, { id });
        setEvent(eventData.event);

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
          paymentAmount: 1500000,
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

  return (
    <div className="container mx-auto py-12 px-4 relative">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cột trái: Chi tiết sự kiện */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col">
          <EventInfo event={event} />
          
          <EventStats
            currentParticipants={event.currentParticipants}
            maxParticipants={event.maxParticipants}
            price={1500000}
          />

          <EventActions
            myRegistration={myRegistration}
            isFull={isFull}
            isProcessing={isProcessing}
            onRegister={handleInitialRegister}
            onOpenPayment={() => setShowPaymentModal(true)}
            onOpenCancel={() => setShowCancelModal(true)}
            onBack={() => window.history.back()}
          />
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