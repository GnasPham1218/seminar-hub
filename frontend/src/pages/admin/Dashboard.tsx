// src/pages/admin/Dashboard.tsx
import { useEffect, useState } from 'react'
import { Calendar, Users, FileText, TrendingUp, Activity, Clock, Bell, ArrowUpRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { client } from '../../lib/graphql'

interface Stats {
  totalEvents: number
  totalRegistrations: number
  totalPapers: number
  totalRevenue: number
  ongoingEvents: number
  upcomingEvents: number
}

interface RecentActivity {
  user: string
  action: string
  target: string
  time: string
  rating?: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalRegistrations: 0,
    totalPapers: 0,
    totalRevenue: 0,
    ongoingEvents: 0,
    upcomingEvents: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // 1. Lấy tất cả dữ liệu cần thiết
      const [eventsRes, registrationsRes, papersRes] = await Promise.all([
        client.request(`
          query { events(page: 1, limit: 100) { events { id title startDate endDate location status } } }
        `),
        client.request(`
          query { registrations(page: 1, limit: 100) { registrations { id paymentAmount paymentStatus } } }
        `),
        client.request(`
          query { papers(page: 1, limit: 100) { papers { id } } }
        `)
      ])

      const events = eventsRes.events.events
      const registrations = registrationsRes.registrations.registrations
      const papers = papersRes.papers.papers

      // Tính toán stats
      const revenue = registrations
        .filter((r: any) => r.paymentStatus === 'paid')
        .reduce((sum: number, r: any) => sum + (r.paymentAmount || 0), 0)

      const now = new Date()
      const ongoing = events.filter((e: any) => 
        new Date(e.startDate) <= now && new Date(e.endDate) >= now
      ).length
      const upcoming = events.filter((e: any) => 
        new Date(e.startDate) > now
      ).length

      setStats({
        totalEvents: events.length,
        totalRegistrations: registrations.length,
        totalPapers: papers.length,
        totalRevenue: revenue,
        ongoingEvents: ongoing,
        upcomingEvents: upcoming
      })

      // Top 3 sự kiện sắp tới
      const sortedEvents = events
        .filter((e: any) => new Date(e.startDate) >= now)
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3)

      setUpcomingEvents(sortedEvents)

      // Hoạt động gần đây (giả lập từ dữ liệu)
      setRecentActivities([
        { user: 'u004 - Phạm Thị Lan', action: 'đăng ký tham gia', target: 'e001', time: '2 phút trước' },
        { user: 'u002 - Trần Thị Bình', action: 'nộp bài báo', target: 'p002', time: '10 phút trước' },
        { user: 'u001 - Nguyễn Văn An', action: 'đánh giá sự kiện', target: 'e001', time: '25 phút trước', rating: 5 },
      ])

      toast.success('Cập nhật dữ liệu thành công!')
    } catch (err: any) {
      console.error('Lỗi fetch dashboard:', err)
      toast.error('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-xl text-gray-600">Đang tải dữ liệu dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Chào mừng trở lại, Admin!
          </h1>
          <p className="text-xl text-gray-600 mt-2">Hôm nay là {format(new Date(), 'EEEE, dd \'tháng\' MM, yyyy')}</p>
        </div>
       
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Calendar, label: "Tổng sự kiện", value: stats.totalEvents, color: "from-blue-500 to-cyan-500", change: "+12%" },
          { icon: Users, label: "Tổng đăng ký", value: stats.totalRegistrations.toLocaleString(), color: "from-emerald-500 to-teal-500", change: "+28%" },
          { icon: FileText, label: "Tổng bài báo", value: stats.totalPapers, color: "from-purple-500 to-pink-500", change: "+18%" },
          { icon: TrendingUp, label: "Doanh thu", value: `${stats.totalRevenue.toLocaleString('vi-VN')}đ`, color: "from-orange-500 to-red-500", change: "+35%" },
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

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Sự kiện sắp tới ({stats.upcomingEvents})
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.startDate), 'dd/MM/yyyy')}
                      </span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <span className="badge badge-lg badge-warning font-medium">
                    Sắp diễn ra
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Không có sự kiện sắp tới</p>
            )}
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