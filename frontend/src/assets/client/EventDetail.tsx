import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { client } from '../../lib/graphql'
import { CREATE_REGISTRATION, GET_EVENT } from '../../lib/queries'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.request(GET_EVENT, { id }).then((data) => {
      setEvent(data.event)
      setLoading(false)
    })
  }, [id])

  const handleRegister = async () => {
    if (!localStorage.getItem('currentUserId')) {
      toast.error('Vui lòng đăng nhập trước khi đăng ký!')
      return
    }

    try {
      await client.request(CREATE_REGISTRATION, {
        input: { event_id: id, payment_amount: 1500000 }
      })
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email thanh toán.')
    } catch (err) {
      toast.error('Đăng ký thất bại. Có thể bạn đã đăng ký rồi.')
    }
  }

  if (loading)
    return <div className="flex justify-center items-center min-h-screen"><div className="loading loading-lg"></div></div>

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Event Details */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">{event.title}</h1>

          <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-500" />
              {format(new Date(event.startDate), 'dd/MM/yyyy')} → {format(new Date(event.endDate), 'dd/MM/yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-red-500" />
              {event.location}
            </div>
          </div>

          <div className="prose max-w-none mb-8 text-gray-700">
            <h3>Mô tả chi tiết</h3>
            <p>{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow hover:shadow-md transition">
              <Users size={40} className="text-blue-500 mb-2" />
              <div className="text-lg font-semibold">{event.currentParticipants}/{event.maxParticipants}</div>
              <div className="text-sm text-gray-500">Còn {event.maxParticipants - event.currentParticipants} chỗ trống</div>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 shadow hover:shadow-md transition">
              <Clock size={40} className="text-green-500 mb-2" />
              <div className="text-lg font-semibold">1.500.000₫</div>
              <div className="text-sm text-gray-500">Phí tham gia</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleRegister}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Đăng ký ngay hôm nay
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft /> Quay lại
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="lg:w-1/3 bg-gradient-to-b from-blue-600 to-purple-600 rounded-2xl p-8 flex flex-col justify-center items-center text-white">
          <h2 className="text-3xl font-bold mb-6">Thông tin nhanh</h2>
          <div className="space-y-4 text-center text-lg">
            <p>
              Trạng thái:{" "}
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === 'upcoming' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                }`}
              >
                {event.status === 'upcoming' ? 'Sắp diễn ra' : 'Đang diễn ra'}
              </span>
            </p>
            <p>Đã có <span className="font-semibold">{event.currentParticipants}</span> người tham gia</p>
            <p>Địa điểm: <span className="font-semibold">{event.location}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
