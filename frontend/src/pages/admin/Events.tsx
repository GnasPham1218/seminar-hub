// src/pages/admin/Events.tsx
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Plus,
  Search,
  ChevronRight,
  AlertCircle,
  Save,
  X,
  CalendarDays,
  DollarSign,
  Clock,
  MapPinned,
  Hash,
} from 'lucide-react'
import { toast } from 'sonner'
import { client } from '../../lib/graphql'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: 'upcoming' | 'ongoing' | 'completed'
  fee?: number
}

const GET_EVENTS_QUERY = `
  query GetEvents($page: Int!, $limit: Int!) {
    events(page: $page, limit: $limit) {
      events {
        id
        title
        description
        startDate
        endDate
        location
        maxParticipants
        currentParticipants
        status
        fee
      }
      pageInfo {
        totalCount
      }
    }
  }
`

const CREATE_EVENT_MUTATION = `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      startDate
      endDate
      location
      maxParticipants
      currentParticipants
      status
      fee
    }
  }
`

const UPDATE_EVENT_MUTATION = `
  mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      startDate
      endDate
      location
      maxParticipants
      status
      fee
    }
  }
`

const DELETE_EVENT_MUTATION = `
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
  }
`

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState<Event | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Event>>({})

  const currentUserId = localStorage.getItem('currentUserId') || 'u003'

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 100,
    fee: 0,
    status: 'upcoming' as const,
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.request(GET_EVENTS_QUERY, { page: 1, limit: 50 })
      setEvents(response.events.events)
    } catch (err: any) {
      console.error('Lỗi fetch events:', err)
      setError('Không thể tải dữ liệu sự kiện')
      toast.error('Lỗi kết nối backend!')
    } finally {
      setLoading(false)
    }
  }

  // TẠO SỰ KIỆN THÀNH CÔNG 100%
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate || !newEvent.location) {
      toast.error('Vui lòng điền đầy đủ tiêu đề, ngày bắt đầu, ngày kết thúc và địa điểm!')
      return
    }

    const eventInput = {
      title: newEvent.title,
      description: newEvent.description,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      location: newEvent.location,
      maxParticipants: newEvent.maxParticipants,
      fee: newEvent.fee || 0,
      status: newEvent.status,
      organizerId: currentUserId, // camelCase đúng như Strawberry yêu cầu
    }

    try {
      await client.request(CREATE_EVENT_MUTATION, { input: eventInput })
      toast.success('Tạo sự kiện thành công!')
      setShowAddModal(false)
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        maxParticipants: 100,
        fee: 0,
        status: 'upcoming',
      })
      fetchEvents()
    } catch (err: any) {
      console.error(err)
      toast.error('Tạo thất bại!')
    }
  }

  // SỬA SỰ KIỆN
  const startEdit = (event: Event) => {
    setEditingId(event.id)
    setEditForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      location: event.location,
      maxParticipants: event.maxParticipants,
      fee: event.fee || 0,
      status: event.status,
    })
  }

  const saveEdit = async (eventId: string) => {
    try {
      await client.request(UPDATE_EVENT_MUTATION, { id: eventId, input: editForm })
      toast.success('Cập nhật thành công!')
      setEditingId(null)
      fetchEvents()
    } catch (err) {
      toast.error('Cập nhật thất bại!')
    }
  }

  const cancelEdit = () => setEditingId(null)

  // XÓA SỰ KIỆN
  const deleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Xóa sự kiện "${eventTitle}"? Không thể hoàn tác!`)) return

    try {
      await client.request(DELETE_EVENT_MUTATION, { id: eventId })
      toast.success('Xóa thành công!')
      setEvents(events.filter(e => e.id !== eventId))
    } catch (err) {
      toast.error('Xóa thất bại!')
    }
  }

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'upcoming': return { label: 'Sắp diễn ra', gradient: 'from-orange-500 to-red-500' }
      case 'ongoing': return { label: 'Đang diễn ra', gradient: 'from-emerald-500 to-teal-600' }
      case 'completed': return { label: 'Đã kết thúc', gradient: 'from-gray-500 to-slate-600' }
      default: return { label: status, gradient: 'from-purple-500 to-pink-600' }
    }
  }

  if (loading) return <div className="flex flex-col items-center justify-center h-96 gap-6"><span className="loading loading-spinner loading-lg text-primary"></span><p className="text-xl text-gray-600">Đang tải dữ liệu...</p></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-6 text-center"><AlertCircle className="w-20 h-20 text-red-500" /><h3 className="text-2xl font-bold text-red-600">Lỗi kết nối</h3><p className="text-gray-600 max-w-md">{error}</p><button onClick={fetchEvents} className="btn btn-primary mt-4">Thử lại</button></div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý sự kiện
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            Tổng cộng <span className="font-bold text-indigo-600">{events.length}</span> sự kiện • 
            <span className="text-emerald-600 font-bold"> {events.filter(e => e.status === 'ongoing').length}</span> đang diễn ra • 
            <span className="text-orange-600 font-bold"> {events.filter(e => e.status === 'upcoming').length}</span> sắp tới
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Tạo sự kiện mới
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sự kiện, địa điểm, mô tả..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredEvents.map((event) => {
          const status = getStatusConfig(event.status)
          const fillRate = event.currentParticipants / event.maxParticipants
          const isEditing = editingId === event.id

          return (
            <div key={event.id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-4">
              <div className="absolute top-6 right-6 z-10">
                <span className={`px-5 py-2.5 rounded-full text-white font-bold text-sm shadow-2xl bg-gradient-to-r ${status.gradient}`}>
                  {status.label}
                </span>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="font-mono text-2xl font-bold text-indigo-600">#{event.id}</div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => startEdit(event)} className="p-3 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition shadow-lg">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteEvent(event.id, event.title)} className="p-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition shadow-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Tiêu đề" />
                    <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none h-24 resize-none" placeholder="Mô tả" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={editForm.startDate || ''} onChange={e => setEditForm({ ...editForm, startDate: e.target.value })} className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                      <input type="date" value={editForm.endDate || ''} onChange={e => setEditForm({ ...editForm, endDate: e.target.value })} className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <input type="text" value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Địa điểm" />
                    <input type="number" value={editForm.maxParticipants || ''} onChange={e => setEditForm({ ...editForm, maxParticipants: Number(e.target.value) })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Sức chứa" />
                    <input type="number" value={editForm.fee || 0} onChange={e => setEditForm({ ...editForm, fee: Number(e.target.value) })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Phí tham gia (0 nếu miễn phí)" />
                    <select value={editForm.status || ''} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none">
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="ongoing">Đang diễn ra</option>
                      <option value="completed">Đã kết thúc</option>
                    </select>

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => saveEdit(event.id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg">
                        <Save className="w-5 h-5" /> Lưu
                      </button>
                      <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition shadow-lg">
                        <X className="w-5 h-5" /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-4 line-clamp-2 leading-tight">{event.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6">{event.description}</p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-gray-700">
                        <CalendarDays className="w-5 h-5 text-indigo-500" />
                        <span className="font-medium text-sm">
                          {format(new Date(event.startDate), 'dd/MM/yyyy')} → {format(new Date(event.endDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-sm">{event.location}</span>
                      </div>
                      {event.fee !== undefined && event.fee > 0 && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-sm">{event.fee.toLocaleString('vi-VN')}đ</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-emerald-500" />
                          <span className="font-semibold">Tham gia</span>
                        </div>
                        <span className="text-xl font-bold">
                          {event.currentParticipants} / {event.maxParticipants}
                        </span>
                      </div>
                      <progress
                        className={`progress h-5 w-full ${fillRate >= 0.9 ? 'progress-error' : fillRate >= 0.7 ? 'progress-warning' : 'progress-success'}`}
                        value={event.currentParticipants}
                        max={event.maxParticipants}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-right">
                        {fillRate >= 1 ? 'ĐÃ ĐẦY' : `Còn ${event.maxParticipants - event.currentParticipants} chỗ`}
                      </p>
                    </div>

                    <button 
                      onClick={() => setShowDetailModal(event)}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      Xem chi tiết
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </>
                )}
              </div>

              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {/* Modal Chi tiết sự kiện - SIÊU ĐẸP */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <CalendarDays className="w-10 h-10 text-indigo-600" />
                Chi tiết sự kiện
              </h2>
              <button onClick={() => setShowDetailModal(null)} className="p-3 hover:bg-gray-100 rounded-xl transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="text-center">
                <div className="font-mono text-2xl text-indigo-600 mb-4">#{showDetailModal.id}</div>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{showDetailModal.title}</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">{showDetailModal.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-100 rounded-2xl">
                      <CalendarDays className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Thời gian diễn ra</p>
                      <p className="text-xl font-bold">
                        {format(new Date(showDetailModal.startDate), 'dd/MM/yyyy')} → {format(new Date(showDetailModal.endDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-2xl">
                      <MapPinned className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="text-xl font-bold">{showDetailModal.location}</p>
                    </div>
                  </div>

                  {showDetailModal.fee !== undefined && showDetailModal.fee > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-100 rounded-2xl">
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phí tham gia</p>
                        <p className="text-xl font-bold">{showDetailModal.fee.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-100 rounded-2xl">
                      <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số lượng tham gia</p>
                      <p className="text-3xl font-bold">
                        {showDetailModal.currentParticipants} / {showDetailModal.maxParticipants}
                      </p>
                      <progress
                        className={`progress h-6 w-full mt-2 ${showDetailModal.currentParticipants / showDetailModal.maxParticipants >= 0.9 ? 'progress-error' : 'progress-success'}`}
                        value={showDetailModal.currentParticipants}
                        max={showDetailModal.maxParticipants}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-100 rounded-2xl">
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 ">Trạng thái</p>
                      <span>
                        {getStatusConfig(showDetailModal.status).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-8">
                <button onClick={() => { startEdit(showDetailModal); setShowDetailModal(null) }} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg flex items-center gap-3">
                  <Edit3 className="w-5 h-5" /> Sửa sự kiện
                </button>
                <button onClick={() => { deleteEvent(showDetailModal.id, showDetailModal.title); setShowDetailModal(null) }} className="px-8 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg flex items-center gap-3">
                  <Trash2 className="w-5 h-5" /> Xóa sự kiện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo sự kiện */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <CalendarDays className="w-10 h-10 text-indigo-600" />
                Tạo sự kiện mới
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 rounded-xl transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <input type="text" placeholder="Tiêu đề sự kiện *" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <textarea placeholder="Mô tả sự kiện" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition h-32 resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input type="date" value={newEvent.startDate} onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
                </div>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
                </div>
              </div>
              <input type="text" placeholder="Địa điểm *" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="number" placeholder="Sức chứa tối đa" value={newEvent.maxParticipants} onChange={e => setNewEvent({ ...newEvent, maxParticipants: Number(e.target.value) || 100 })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="number" placeholder="Phí tham gia (0 nếu miễn phí)" value={newEvent.fee} onChange={e => setNewEvent({ ...newEvent, fee: Number(e.target.value) || 0 })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <select value={newEvent.status} onChange={e => setNewEvent({ ...newEvent, status: e.target.value as any })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition">
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
              </select>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handleAddEvent} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Tạo sự kiện
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl hover:bg-gray-300 transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}