import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { client } from "../../lib/graphql";
import { CREATE_USER } from "../../lib/mutations";

export default function SignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    role: "researcher", // Mặc định là researcher
  });

  // Hàm kiểm tra định dạng email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Email
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    if (!validateEmail(formData.email)) {
      toast.error("Email không đúng định dạng (ví dụ: user@domain.com)");
      return;
    }

    // 2. Validate Password
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    // 3. Validate các trường khác (nếu cần)
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập họ tên!");
      return;
    }

    setIsLoading(true);

    try {
      // Chuẩn bị input theo đúng schema CreateUserInput của backend
      const input = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        organization: formData.organization,
        role: formData.role,
      };

      await client.request(CREATE_USER, { input });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login"); // Chuyển hướng về trang login
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error);
      // Hiển thị lỗi từ backend (ví dụ: Email đã tồn tại)
      const msg =
        error.response?.errors?.[0]?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Welcome Image/Text */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4">
              Tham gia cùng chúng tôi
            </h2>
            <p className="text-indigo-100 text-lg">
              Tạo tài khoản để đăng ký tham gia hội thảo, nộp bài tham luận và
              kết nối với cộng đồng nghiên cứu khoa học.
            </p>
          </div>
          <div className="relative z-10">
            <p className="text-sm text-indigo-200">© 2024 EventHub System</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Đăng ký tài khoản
            </h1>
            <p className="text-gray-500 mt-2">
              Nhập thông tin chi tiết của bạn để bắt đầu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="flex gap-4 p-1 bg-gray-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "researcher" })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.role === "researcher"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                Nhà nghiên cứu
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "attendee" })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.role === "attendee"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                Người tham dự
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (ví dụ: user@domain.com)"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone & Org */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Số điện thoại"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="organization"
                    placeholder="Tổ chức / Trường"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )}
              {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}