// src/pages/admin/Events.tsx
import { useEffect, useState } from 'react'
import { format } from 'date-fns'

import { Calendar, MapPin, Users, Edit3, Trash2, Plus, Search, Filter, ChevronRight } from 'lucide-react'
import { client } from '../../lib/graphql'
import { GET_EVENTS } from '../../lib/queries'

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    client.request(GET_EVENTS, { page: 1, limit: 50 })
      .then((data: any) => {
        setEvents(data.events.events)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý sự kiện
          </h1>
          <p className="text-xl text-gray-600 mt-2">Tổng cộng {events.length} sự kiện đang hoạt động</p>
        </div>

        <button className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Tạo sự kiện mới
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, địa điểm..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 font-medium">
            <Filter className="w-5 h-5" />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* Events Grid - Card Style (đẹp hơn table cũ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-3"
          >
            {/* Status Badge */}
            <div className="absolute top-6 right-6 z-10">
              <span className={`px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg ${
                event.status === 'upcoming' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                  : event.status === 'ongoing'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600'
              }`}>
                {event.status === 'upcoming' ? 'Sắp diễn ra' : event.status === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="font-mono text-2xl font-bold text-indigo-600">#{event.id}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition">
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-800 mb-4 line-clamp-2">
                {event.title}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium">
                    {format(new Date(event.startDate), 'dd/MM/yyyy')} → {format(new Date(event.endDate), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              {/* Participants Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-gray-700">Số lượng tham gia</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800">
                    {event.currentParticipants} / {event.maxParticipants}
                  </span>
                </div>
                <progress
                  className={`progress w-full h-4 ${
                    event.currentParticipants / event.maxParticipants > 0.8
                      ? 'progress-error'
                      : event.currentParticipants / event.maxParticipants > 0.5
                      ? 'progress-warning'
                      : 'progress-success'
                  }`}
                  value={event.currentParticipants}
                  max={event.maxParticipants}
                ></progress>
                <p className="text-sm text-gray-500 mt-2">
                  Còn {event.maxParticipants - event.currentParticipants} chỗ trống
                </p>
              </div>

              {/* View Detail Button */}
              <button className="mt-8 w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group">
                Xem chi tiết
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            {/* Decorative blur */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy sự kiện nào</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc tạo sự kiện mới</p>
        </div>
      )}
    </div>
  )
}