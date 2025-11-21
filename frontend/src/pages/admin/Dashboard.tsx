// src/pages/admin/Dashboard.tsx
import { useState, useEffect } from 'react'
import { Calendar, Users, FileText, TrendingUp, Activity, Clock, Bell, ArrowUpRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  // Giả lập dữ liệu động (bạn có thể fetch thật từ GraphQL sau)
  const [stats] = useState({
    events: 12,
    registrations: 1234,
    papers: 89,
    satisfaction: 95.8
  })

  const upcomingEvents = [
    { id: 'e001', title: 'Hội thảo Công nghệ Trí tuệ Nhân tạo 2025', date: '2025-12-01', location: 'Hà Nội', status: 'upcoming' },
    { id: 'e002', title: 'Hội nghị Khoa học Máy tính Mở Rộng', date: '2025-11-20', location: 'TP.HCM', status: 'ongoing' },
  ]

  const recentActivities = [
    { user: 'u004 - Phạm Thị Lan', action: 'đăng ký tham gia', target: 'e001', time: '2 phút trước' },
    { user: 'u002 - Trần Thị Bình', action: 'nộp bài báo', target: 'p002', time: '10 phút trước' },
    { user: 'u001 - Nguyễn Văn An', action: 'đánh giá sự kiện', target: 'e001', time: '25 phút trước', rating: 5 },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Chào mừng trở lại, Admin! 👋
          </h1>
          <p className="text-xl text-gray-600 mt-2">Hôm nay là {format(new Date(), 'EEEE, dd \'tháng\' MM, yyyy')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost btn-circle relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 badge badge-error badge-xs">3</span>
          </button>
          <div className="avatar">
            <div className="w-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Siêu đẹp với glassmorphism + gradient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Calendar, label: "Sự kiện đang quản lý", value: stats.events, color: "from-blue-500 to-cyan-500", change: "+12%" },
          { icon: Users, label: "Người đăng ký", value: stats.registrations.toLocaleString(), color: "from-emerald-500 to-teal-500", change: "+28%" },
          { icon: FileText, label: "Bài báo đã nộp", value: stats.papers, color: "from-purple-500 to-pink-500", change: "+18%" },
          { icon: TrendingUp, label: "Tỷ lệ hài lòng", value: `${stats.satisfaction}%`, color: "from-orange-500 to-red-500", change: "+5%" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="relative group overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`}></div>
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition"></div>
              
              <div className="relative p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-white/30 backdrop-blur-md rounded-2xl">
                    <Icon className="w-10 h-10" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="text-5xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-white/90 text-lg">{stat.label}</div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {/* Bottom Grid: Upcoming Events + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Sự kiện sắp tới
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.date), 'dd/MM/yyyy')}
                    </span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className={`badge badge-lg font-medium ${event.status === 'upcoming' ? 'badge-warning' : 'badge-success'}`}>
                  {event.status === 'upcoming' ? 'Sắp diễn ra' : 'Đang diễn ra'}
                </span>
              </div>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition">
              Xem tất cả sự kiện →
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8" />
              Hoạt động gần đây
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="avatar placeholder">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold">
                      {act.user.split(' ')[1]?.[0] || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      <span className="text-indigo-600">{act.user}</span> {act.action}{' '}
                      <span className="text-purple-600 font-mono">{act.target}</span>
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4" />
                      {act.time}
                      {act.rating && (
                        <span className="flex items-center gap-1 ml-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          {act.rating} sao
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}