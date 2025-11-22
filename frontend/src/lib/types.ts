import { format } from "date-fns";
import { Shield, Users, User } from "lucide-react";

// --- EVENT TYPES ---
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "upcoming" | "ongoing" | "completed";
  fee: number;
}

export interface CreateEventInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  fee: number;
  status: "upcoming" | "ongoing" | "completed";
}

// --- USER TYPES (MỚI) ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "speaker" | "researcher" | "attendee";
  organization: string;
  phone: string;
  registeredEvents: string[]; // Mảng ID các sự kiện
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string; // Optional khi update
  role: string;
  organization: string;
  phone: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {}

// --- UTILS ---
export const getStatusConfig = (status: string) => {
  switch (status) {
    case "upcoming":
      return { label: "Sắp diễn ra", gradient: "from-orange-500 to-red-500" };
    case "ongoing":
      return {
        label: "Đang diễn ra",
        gradient: "from-emerald-500 to-teal-600",
      };
    case "completed":
      return { label: "Đã kết thúc", gradient: "from-gray-500 to-slate-600" };
    default:
      return { label: status, gradient: "from-purple-500 to-pink-600" };
  }
};

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy");
  } catch {
    return dateString;
  }
};

export const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return {
        gradient: "from-red-500 to-pink-600",
        icon: Shield,
        label: "Quản trị viên",
      };
    case "speaker":
      return {
        gradient: "from-purple-500 to-indigo-600",
        icon: Users,
        label: "Diễn giả",
      };
    case "researcher":
      return {
        gradient: "from-blue-500 to-cyan-600",
        icon: Users,
        label: "Nhà nghiên cứu",
      };
    default:
      return {
        gradient: "from-emerald-500 to-teal-600",
        icon: User,
        label: "Người tham gia",
      };
  }
};
