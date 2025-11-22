// src/pages/admin/Registrations.tsx
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Receipt,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ChevronRight,
  AlertCircle,
  Save,
  X as XIcon,
  Edit3,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { client } from "../../lib/graphql";

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: string;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  paymentAmount: number;
}

const GET_REGISTRATIONS_QUERY = `
  query GetRegistrations($page: Int!, $limit: Int!) {
    registrations(page: $page, limit: $limit) {
      registrations {
        id
        eventId
        userId
        registrationDate
        status
        paymentStatus
        paymentAmount
      }
      pageInfo {
        totalCount
      }
    }
  }
`;

const UPDATE_REGISTRATION_MUTATION = `
  mutation UpdateRegistration($id: String!, $input: UpdateRegistrationInput!) {
    updateRegistration(id: $id, input: $input) {
      id
      status
      paymentStatus
      paymentAmount
    }
  }
`;

const DELETE_REGISTRATION_MUTATION = `
  mutation DeleteRegistration($id: String!) {
    deleteRegistration(id: $id)
  }
`;

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "pending" | "failed"
  >("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Registration>>({});

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.request(GET_REGISTRATIONS_QUERY, {
        page: 1,
        limit: 100,
      });
      setRegistrations(response.registrations.registrations);
    } catch (err: any) {
      console.error("Lỗi fetch registrations:", err);
      setError("Không thể tải dữ liệu đăng ký");
      toast.error("Lỗi kết nối backend!");
    } finally {
      setLoading(false);
    }
  };

  // SỬA ĐĂNG KÝ
  const startEdit = (reg: Registration) => {
    setEditingId(reg.id);
    setEditForm({
      status: reg.status,
      paymentStatus: reg.paymentStatus,
    });
  };

  const saveEdit = async (regId: string) => {
    try {
      const input: any = {};
      if (editForm.status) input.status = editForm.status;
      if (editForm.paymentStatus) input.paymentStatus = editForm.paymentStatus;

      await client.request(UPDATE_REGISTRATION_MUTATION, { id: regId, input });
      toast.success("Cập nhật đăng ký thành công!");
      setEditingId(null);
      fetchRegistrations();
    } catch (err: any) {
      console.error(err);
      toast.error("Cập nhật thất bại!");
    }
  };

  const cancelEdit = () => setEditingId(null);

  // XÓA ĐĂNG KÝ – ĐÃ FIX stopPropagation HOÀN HẢO!
  const handleDelete = async (regId: string) => {
    if (!confirm("Xóa đăng ký này? Không thể hoàn tác!")) return;

    try {
      await client.request(DELETE_REGISTRATION_MUTATION, { id: regId });
      toast.success("Xóa đăng ký thành công!");
      setRegistrations(registrations.filter((r) => r.id !== regId));
    } catch (err: any) {
      console.error(err);
      toast.error("Xóa thất bại!");
    }
  };

  // DUYỆT THANH TOÁN / XÁC NHẬN
  const handleQuickAction = async (
    regId: string,
    field: "status" | "paymentStatus",
    value: string
  ) => {
    try {
      const input: any = {};
      if (field === "status") input.status = value;
      if (field === "paymentStatus") input.paymentStatus = value;

      await client.request(UPDATE_REGISTRATION_MUTATION, { id: regId, input });
      toast.success("Cập nhật thành công!");
      fetchRegistrations();
    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      reg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || reg.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPaymentConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          gradient: "from-emerald-500 to-teal-600",
          icon: CheckCircle2,
          label: "Đã thanh toán",
        };
      case "pending":
        return {
          gradient: "from-orange-500 to-yellow-600",
          icon: Clock,
          label: "Chờ thanh toán",
        };
      case "failed":
        return {
          gradient: "from-red-500 to-rose-600",
          icon: XCircle,
          label: "Thất bại",
        };
      default:
        return {
          gradient: "from-gray-500 to-slate繳",
          icon: Clock,
          label: "Không rõ",
        };
    }
  };

  const getRegStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { gradient: "from-blue-500 to-cyan-600", label: "Đã xác nhận" };
      case "pending":
        return { gradient: "from-gray-500 to-slate-600", label: "Chờ duyệt" };
      case "cancelled":
        return { gradient: "from-red-500 to-pink-600", label: "Đã hủy" };
      default:
        return { gradient: "from-purple-500 to-indigo-600", label: status };
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6 text-center">
        <AlertCircle className="w-20 h-20 text-red-500" />
        <h3 className="text-2xl font-bold text-red-600">Lỗi kết nối</h3>
        <p className="text-gray-600 max-w-md">{error}</p>
        <button onClick={fetchRegistrations} className="btn btn-primary mt-4">
          Thử lại
        </button>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý đăng ký tham gia
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            Tổng cộng {registrations.length} lượt đăng ký • Doanh thu:{" "}
            {registrations
              .filter((r) => r.paymentStatus === "paid")
              .reduce((sum, r) => sum + r.paymentAmount, 0)
              .toLocaleString("vi-VN")}
            đ
          </p>
        </div>
        <button className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <Download className="w-6 h-6" />
          Xuất Excel
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm theo mã đăng ký, user ID, event ID..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            {(["all", "paid", "pending", "failed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-4 rounded-2xl font-medium transition-all ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all"
                  ? "Tất cả"
                  : status === "paid"
                  ? "Đã thanh toán"
                  : status === "pending"
                  ? "Chờ thanh toán"
                  : "Thất bại"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((reg) => {
          const paymentInfo = getPaymentConfig(reg.paymentStatus);
          const regInfo = getRegStatusConfig(reg.status);
          const PaymentIcon = paymentInfo.icon || CheckCircle2;
          const isEditing = editingId === reg.id;

          return (
            <div
              key={reg.id}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-3"
            >
              {/* Header - Payment Status */}
              <div
                className={`p-6 bg-gradient-to-r ${paymentInfo.gradient} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PaymentIcon className="w-8 h-8" />
                    <div>
                      <div className="text-2xl font-extrabold">
                        {reg.paymentAmount.toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-sm opacity-90">
                        {paymentInfo.label}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xl">#{reg.id}</span>
                </div>
              </div>

              <div className="p-8">
                {isEditing ? (
                  <div className="space-y-4">
                    <select
                      value={editForm.status || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="pending">Chờ duyệt</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                    <select
                      value={editForm.paymentStatus || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          paymentStatus: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="failed">Thất bại</option>
                    </select>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => saveEdit(reg.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg"
                      >
                        <Save className="w-5 h-5" /> Lưu
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition shadow-lg"
                      >
                        <XIcon className="w-5 h-5" /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* User & Event Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {reg.userId.slice(-1)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          User ID: {reg.userId}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Event ID: {reg.eventId}
                        </p>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        <div>
                          <p className="font-bold text-gray-800">
                            Ngày đăng ký
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(
                              new Date(reg.registrationDate),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className={`px-4 py-2 rounded-full bg-gradient-to-r ${regInfo.gradient} text-white font-bold text-sm shadow-lg`}
                      >
                        {regInfo.label}
                      </span>

                      {/* ĐÃ FIX stopPropagation → NÚT XÓA + SỬA HOẠT ĐỘNG NGAY! */}
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto relative z-50">
                        <button
                          onClick={(e) => {
                            console.log("🔥 EDIT CLICKED!");
                            e.stopPropagation();
                            startEdit(reg);
                          }}
                          className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition shadow-lg relative z-50"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            console.log("🔥 DELETE CLICKED!");
                            e.stopPropagation();
                            handleDelete(reg.id);
                          }}
                          className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition shadow-lg relative z-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          handleQuickAction(reg.id, "status", "confirmed")
                        }
                        className="btn btn-success btn-sm"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() =>
                          handleQuickAction(reg.id, "paymentStatus", "paid")
                        }
                        className="btn btn-outline btn-success btn-sm"
                      >
                        Đã thanh toán
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
