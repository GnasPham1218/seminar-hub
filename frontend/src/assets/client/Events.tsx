import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, MapPin, Users } from 'lucide-react'
import { GET_EVENTS } from '../../lib/queries'
import { client } from '../../lib/graphql'

export default function EventList() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.request(GET_EVENTS, { page: 1, limit: 20 }).then((data) => {
      setEvents(data.events.events)
      setLoading(false)
    })
  }, [])

  if (loading)
    return <div className="flex justify-center items-center min-h-screen"><div className="loading loading-lg"></div></div>

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">Tất cả sự kiện</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <div className="p-6 flex flex-col h-full">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{event.title}</h2>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar size={16} />
                {format(new Date(event.startDate), 'dd/MM/yyyy')} → {format(new Date(event.endDate), 'dd/MM/yyyy')}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <MapPin size={16} />
                {event.location}
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <Users size={16} />
                {event.currentParticipants}/{event.maxParticipants} người đăng ký
                <span
                  className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${
                    event.status === 'upcoming'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {event.status === 'upcoming' ? 'Sắp diễn ra' : 'Đang diễn ra'}
                </span>
              </div>

              <Link
                to={`/events/${event.id}`}
                className="mt-auto inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
