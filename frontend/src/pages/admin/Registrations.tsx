// src/pages/admin/Registrations.tsx
import { useEffect, useState } from 'react'
import { Search, Filter, Receipt, User, Calendar, CheckCircle2, XCircle, Clock, Download, Eye, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Registration {
  id: string
  userId: string
  userName: string
  userEmail: string
  eventId: string
  eventTitle: string
  paymentAmount: number
  paymentStatus: 'paid' | 'pending' | 'failed'
  status: 'confirmed' | 'pending' | 'cancelled'
  registrationDate: string
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'failed'>('all')

  // Fetch thật từ GraphQL (sẽ hoạt động khi bạn có query registrations đầy đủ)
  useEffect(() => {
    // Nếu backend chưa có query chi tiết, tạm dùng dữ liệu mẫu đẹp
    const mockData: Registration[] = [
      { id: 'r001', userId: 'u001', userName: 'Nguyễn Văn An', userEmail: 'an.nguyen@hust.edu.vn', eventId: 'e001', eventTitle: 'Hội thảo AI 2025', paymentAmount: 1500000, paymentStatus: 'paid', status: 'confirmed', registrationDate: '2025-10-20T13:00:00Z' },
      { id: 'r002', userId: 'u004', userName: 'Phạm Thị Lan', userEmail: 'lan.pham@gmail.com', eventId: 'e001', eventTitle: 'Hội thảo AI 2025', paymentAmount: 1500000, paymentStatus: 'paid', status: 'confirmed', registrationDate: '2025-10-18T15:00:00Z' },
      { id: 'r003', userId: 'u002', userName: 'Trần Thị Bình', userEmail: 'binh.tran@hcmus.edu.vn', eventId: 'e002', eventTitle: 'Hội nghị Máy tính Mở Rộng', paymentAmount: 1500000, paymentStatus: 'pending', status: 'pending', registrationDate: '2025-11-05T10:20:00Z' },
      { id: 'r004', userId: 'u001', userName: 'Nguyễn Văn An', userEmail: 'an.nguyen@hust.edu.vn', eventId: 'e002', eventTitle: 'Hội nghị Máy tính Mở Rộng', paymentAmount: 1500000, paymentStatus: 'paid', status: 'confirmed', registrationDate: '2025-11-01T09:45:00Z' },
    ]
    setRegistrations(mockData)
    setLoading(false)
  }, [])

  const filtered = registrations.filter(reg => {
    const matchesSearch = reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || reg.paymentStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string, type: 'payment' | 'reg') => {
    if (type === 'payment') {
      switch (status) {
        case 'paid': return { gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle2, label: 'Đã thanh toán' }
        case 'pending': return { gradient: 'from-orange-500 to-yellow-600', icon: Clock, label: 'Chờ thanh toán' }
        case 'failed': return { gradient: 'from-red-500 to-rose-600', icon: XCircle, label: 'Thất bại' }
      }
    } else {
      switch (status) {
        case 'confirmed': return { gradient: 'from-blue-500 to-cyan-600', label: 'Đã xác nhận' }
        case 'pending': return { gradient: 'from-gray-500 to-slate-600', label: 'Chờ duyệt' }
        case 'cancelled': return { gradient: 'from-red-500 to-pink-600', label: 'Đã hủy' }
      }
    }
    return { gradient: 'from-gray-400 to-gray-600', label: 'Không rõ' }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý đăng ký tham gia
          </h1>
          <p className="text-xl text-gray-600 mt-2">Tổng cộng {registrations.length} lượt đăng ký • Doanh thu: {(registrations.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + r.paymentAmount, 0)).toLocaleString('vi-VN')}đ</p>
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
              placeholder="Tìm theo người dùng, email, sự kiện..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            {(['all', 'paid', 'pending', 'failed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-4 rounded-2xl font-medium transition-all ${filterStatus === status ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {status === 'all' ? 'Tất cả' : status === 'paid' ? 'Đã thanh toán' : status === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Registrations Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((reg) => {
          const paymentInfo = getStatusBadge(reg.paymentStatus, 'payment')
          const regInfo = getStatusBadge(reg.status, 'reg')
          const PaymentIcon = paymentInfo.icon || CheckCircle2

          return (
            <div key={reg.id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-3">
              {/* Header - Payment Status */}
              <div className={`p-6 bg-gradient-to-r ${paymentInfo.gradient} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PaymentIcon className="w-8 h-8" />
                    <div>
                      <div className="text-2xl font-extrabold">{reg.paymentAmount.toLocaleString('vi-VN')}đ</div>
                      <div className="text-sm opacity-90">{paymentInfo.label}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xl">#{reg.id}</span>
                </div>
              </div>

              <div className="p-8">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {reg.userName.split(' ').pop()?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{reg.userName}</h3>
                    <p className="text-gray-600 text-sm">{reg.userEmail}</p>
                  </div>
                </div>

                {/* Event */}
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-bold text-gray-800">{reg.eventTitle}</p>
                      <p className="text-sm text-gray-600">Đăng ký: {format(new Date(reg.registrationDate), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${regInfo.gradient} text-white font-bold text-sm shadow-lg`}>
                    {regInfo.label}
                  </span>

                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition shadow-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition shadow-lg">
                      <Receipt className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Receipt className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700">Không có đăng ký nào</h3>
          <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  )
}