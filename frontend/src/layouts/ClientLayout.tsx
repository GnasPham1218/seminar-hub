// src/layouts/ClientLayout.tsx
import { Outlet, Link } from 'react-router-dom'
import { Calendar, LogIn, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function ClientLayout() {
  const userId = localStorage.getItem('currentUserId')
  const isAdmin = userId === 'u003'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('currentUserId')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navbar - Siêu đẹp & Responsive */}
      <header className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
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
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
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
              <Link to="/events" className="block py-3 text-lg font-medium text-gray-800 hover:text-blue-600">
                Danh sách sự kiện
              </Link>
              {userId && (
                <Link to="/my-registrations" className="block py-3 text-lg font-medium text-gray-800 hover:text-blue-600">
                  Vé của tôi
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="block py-3 text-lg font-medium text-blue-600">
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

      {/* Footer - Sang trọng */}
      <footer className="bg-gradient-to-t from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold">Hội thảo KH</span>
              </div>
              <p className="text-gray-400">
                Nền tảng quản lý hội thảo khoa học hàng đầu Việt Nam
              </p>
            </div>

            <div className="md:text-center">
              <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/events" className="hover:text-white transition">Sự kiện</Link></li>
                <li><Link to="/about" className="hover:text-white transition">Giới thiệu</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Liên hệ</Link></li>
              </ul>
            </div>

            <div className="md:text-right">
              <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
              <p className="text-gray-400">
                Email: support@hoithaokh.vn<br />
                Hotline: 1900 1234
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400">
            <p>© 2025 Hội thảo Khoa học Việt Nam. Phát triển bởi <span className="font-bold text-blue-400">Team xAI</span> ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  )
}