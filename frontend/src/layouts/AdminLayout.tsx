// src/layouts/AdminLayout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Newspaper, 
  FileText, 
  LogOut, 
  Settings, 
  Bell,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/events', label: 'Sự kiện', icon: Calendar },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/registrations', label: 'Đăng ký', icon: Newspaper },
  { to: '/admin/papers', label: 'Bài báo', icon: FileText },
]

export default function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('currentUserId')
    window.location.href = '/login'
  }

  const currentUserName = "Quản trị viên" // Có thể lấy từ context sau

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex">
      {/* Sidebar - Glassmorphism + Gradient */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-500 bg-white/80 backdrop-blur-2xl shadow-2xl border-r border-white/20 flex flex-col relative z-50`}>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-4 top-24 z-50 bg-white p-2 rounded-full shadow-xl border border-gray-200 hover:bg-gray-50 lg:hidden"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo & Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden transition-all">
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-500 mt-1">Hội thảo Khoa học 2025</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl font-medium transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-xl'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-indigo-600'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                )}

                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}`} />
                </div>

                {sidebarOpen && (
                  <span className="font-semibold text-lg">{item.label}</span>
                )}

                {/* Tooltip khi thu gọn */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-4 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-2xl">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-900"></div>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200/50">
          <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white"></div>
            </div>

            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-bold text-gray-800">{currentUserName}</p>
                <p className="text-sm text-gray-600">admin@hoithaokh.vn</p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition shadow-lg"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-3 rounded-xl hover:bg-gray-100 transition"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-3 rounded-xl hover:bg-gray-100 transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button className="p-3 rounded-xl hover:bg-gray-100 transition">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}