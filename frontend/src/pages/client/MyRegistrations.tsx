import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, MapPin, Receipt, AlertCircle } from "lucide-react";
import { client } from "../../lib/graphql";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRegs = async () => {
      try {
        const { registrations } = await client.request(`
          query {
            registrations(page: 1, limit: 50) {
              registrations {
                id
                eventId
                registrationDate
                status
                paymentStatus
                paymentAmount
                event {
                  title
                  startDate
                  endDate
                  location
                }
              }
            }
          }
        `);
        setRegistrations(registrations.registrations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("currentUserId")) {
      fetchMyRegs();
    } else {
      setLoading(false);
    }
  }, []);

  if (!localStorage.getItem("currentUserId")) {
    return (
      <div className="container mx-auto py-20 text-center">
        <AlertCircle size={64} className="mx-auto text-warning mb-4" />
        <h2 className="text-2xl font-bold">
          Vui lòng đăng nhập để xem đăng ký của bạn
        </h2>
      </div>
    );
  }

  if (loading) return <div className="loading loading-lg mx-auto mt-40" />;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-10">
        Các sự kiện tôi đã đăng ký
      </h1>

      {registrations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">Bạn chưa đăng ký sự kiện nào</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((reg) => (
            <div key={reg.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl">
                  {reg.event?.title || "Sự kiện đã xóa"}
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {format(new Date(reg.event?.startDate), "dd/MM/yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {reg.event?.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Receipt size={16} />
                    {reg.paymentAmount.toLocaleString("vi-VN")}đ
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <span
                    className={`badge ${
                      reg.status === "confirmed"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {reg.status === "confirmed" ? "Đã xác nhận" : "Chờ xử lý"}
                  </span>
                  <span
                    className={`badge ${
                      reg.paymentStatus === "paid"
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {reg.paymentStatus === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>

                <div className="card-actions mt-4">
                  <button className="btn btn-primary btn-sm">Xem vé</button>
                  <button className="btn btn-ghost btn-sm">Hủy đăng ký</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
