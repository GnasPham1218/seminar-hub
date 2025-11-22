interface Session {
  id: string;
  title: string;
  description: string;
  speakerId: string;
  startTime: string;
  endTime: string;
  room: string;
  topics: string[];
}

interface SessionListProps {
  sessions: Session[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SessionList({ sessions }: SessionListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-xl text-center text-gray-500">
        Chưa có thông tin về các phiên họp.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
        Lịch Trình Sự Kiện
      </h3>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              {/* Time & Room */}
              <div className="flex-shrink-0 min-w-[120px] flex flex-col gap-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold w-fit">
                  {formatDate(session.startTime)} -{" "}
                  {formatDate(session.endTime)}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  📍 {session.room}
                </span>
              </div>

              {/* Content */}
              <div className="flex-grow">
                <h4 className="text-lg font-bold text-gray-800">
                  {session.title}
                </h4>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {session.description}
                </p>

                {/* Topics */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
