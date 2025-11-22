// src/layouts/ClientLayout.tsx
import { Outlet, Link } from "react-router-dom";
import {
  Calendar,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import { useState } from "react";

export default function ClientLayout() {
  const userId = localStorage.getItem("currentUserId");
  const isAdmin = userId === "u003";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-white to-blue-50">
      {/* Navbar - Giữ nguyên phần Navbar của bạn */}
      <header className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="p-2 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Hội thảo KH
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/events"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center group"
              >
                <span>Sự kiện</span>
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              {userId && (
                <Link
                  to="/my-registrations"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Vé của tôi
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Auth Buttons */}
              <div className="flex items-center gap-3 ml-4">
                {userId ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-500 text-red-500 rounded-full hover:bg-red-50 hover:border-red-600 transition-all duration-300 font-medium"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
                  >
                    <LogIn size={18} />
                    Đăng nhập
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/events"
                className="block py-3 text-lg font-medium text-gray-800 hover:text-blue-600"
              >
                Danh sách sự kiện
              </Link>
              {userId && (
                <Link
                  to="/my-registrations"
                  className="block py-3 text-lg font-medium text-gray-800 hover:text-blue-600"
                >
                  Vé của tôi
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block py-3 text-lg font-medium text-blue-600"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-4 border-t">
                {userId ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 👇 FOOTER MỚI ĐƯỢC THIẾT KẾ LẠI 👇 */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="container mx-auto px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Cột 1: Thông tin Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  Hội thảo KH
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Nền tảng kết nối tri thức, chia sẻ đam mê và thúc đẩy sự phát
                triển của cộng đồng nghiên cứu khoa học Việt Nam.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="#"
                  className="p-2 bg-slate-800 rounded-full hover:bg-blue-400 hover:text-white transition-all duration-300"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  className="p-2 bg-slate-800 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="#"
                  className="p-2 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Cột 2: Liên kết nhanh */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Khám phá</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/events"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <ChevronRight size={14} /> Tất cả sự kiện
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <ChevronRight size={14} /> Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link
                    to="/speakers"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <ChevronRight size={14} /> Diễn giả tiêu biểu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <ChevronRight size={14} /> Tin tức & Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Cột 3: Liên hệ */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Liên hệ</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Tòa nhà Innovation, Q.1, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>+84 28 1234 5678</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="truncate">contact@hoithaokh.vn</span>
                </li>
              </ul>
            </div>

            {/* Cột 4: Newsletter */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">
                Đăng ký nhận tin
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Nhận thông báo về các hội thảo khoa học mới nhất hàng tuần.
              </p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700 transition-all placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Chúng tôi cam kết không spam email của bạn.
                </p>
              </form>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2025 Hội thảo Khoa học Việt Nam. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-medium">
              <Link to="/terms" className="hover:text-white transition-colors">
                Điều khoản
              </Link>
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Bảo mật
              </Link>
              <Link to="/help" className="hover:text-white transition-colors">
                Trợ giúp
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
