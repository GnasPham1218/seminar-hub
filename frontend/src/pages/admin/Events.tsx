import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { client } from "../../lib/graphql";
import type { CreateEventInput, Event } from "../../lib/types";
import EventHeader from "../../components/admin-events/EventHeader";
import EventSearch from "../../components/admin-events/EventSearch";
import EventCard from "../../components/admin-events/EventCard";
import CreateEventModal from "../../components/admin-events/CreateEventModal";
import EventDetailModal from "../../components/admin-events/EventDetailModal";
import DeleteConfirmModal from "../../components/admin-events/DeleteConfirmModal";
import { GET_EVENTS } from "../../lib/queries";
import { CREATE_EVENT, DELETE_EVENT, UPDATE_EVENT } from "../../lib/mutations";

export default function AdminEvents() {
  // --- STATE ---
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Event | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Event>>({});

  // New Event Form State
  const currentUserId = localStorage.getItem("currentUserId") || "u003";
  const [newEvent, setNewEvent] = useState<CreateEventInput>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: 100,
    fee: 0,
    status: "upcoming",
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchEvents();
  }, []);

  // --- API HANDLERS ---
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.request(GET_EVENTS, { page: 1, limit: 50 });
      setEvents(response.events.events);
    } catch (err: any) {
      console.error("Lỗi fetch events:", err);
      setError("Không thể tải dữ liệu sự kiện");
      toast.error("Lỗi kết nối backend!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (
      !newEvent.title ||
      !newEvent.startDate ||
      !newEvent.endDate ||
      !newEvent.location
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const eventInput = { ...newEvent, organizerId: currentUserId };

    try {
      await client.request(CREATE_EVENT, { input: eventInput });
      toast.success("Tạo sự kiện thành công!");
      setShowAddModal(false);
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        maxParticipants: 100,
        fee: 0,
        status: "upcoming",
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Tạo thất bại!");
    }
  };

  const startEdit = (event: Event) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
      location: event.location,
      maxParticipants: event.maxParticipants,
      fee: event.fee || 0,
      status: event.status,
    });
  };

  const saveEdit = async (eventId: string) => {
    try {
      await client.request(UPDATE_EVENT, { id: eventId, input: editForm });
      toast.success("Cập nhật thành công!");
      setEditingId(null);
      fetchEvents();
    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setEditingId(null);
    setEditForm({});
  };

  // DELETE HANDLERS
  const openDeleteModal = (event: Event) => {
    setDeleteModal({ id: event.id, title: event.title });
  };

  const executeDelete = async () => {
    if (!deleteModal) return;
    try {
      await client.request(DELETE_EVENT, { id: deleteModal.id });
      toast.success("Xóa thành công!");
      setEvents(events.filter((e) => e.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      toast.error("Xóa thất bại!");
    }
  };

  // FILTER
  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER ---
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6 text-center">
        <AlertCircle className="w-20 h-20 text-red-500" />
        <h3 className="text-2xl font-bold text-red-600">Lỗi kết nối</h3>
        <p className="text-gray-600 max-w-md">{error}</p>
        <button onClick={fetchEvents} className="btn btn-primary mt-4">
          Thử lại
        </button>
      </div>
    );

  return (
    <div className="space-y-8">
      <EventHeader
        events={events}
        onOpenAddModal={() => setShowAddModal(true)}
      />
      <EventSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isEditing={editingId === event.id}
            editForm={editForm}
            setEditForm={setEditForm}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onDelete={openDeleteModal}
            onViewDetail={setShowDetailModal}
          />
        ))}
      </div>

      {/* MODALS */}
      <CreateEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSubmit={handleAddEvent}
      />

      <EventDetailModal
        event={showDetailModal}
        onClose={() => setShowDetailModal(null)}
        onEdit={startEdit}
        onDelete={openDeleteModal}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        eventTitle={deleteModal?.title || ""}
        onClose={() => setDeleteModal(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}
