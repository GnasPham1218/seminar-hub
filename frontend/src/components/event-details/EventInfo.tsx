import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

interface EventInfoProps {
  event: any;
}

export default function EventInfo({ event }: EventInfoProps) {
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
        {event.title}
      </h1>

      <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-500" />
          {format(new Date(event.startDate), "dd/MM/yyyy")} →{" "}
          {format(new Date(event.endDate), "dd/MM/yyyy")}
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
    </>
  );
}