
import { Plus } from 'lucide-react';
import type { User } from '../../lib/types';


interface UserHeaderProps {
  users: User[];
  onOpenAddModal: () => void;
}

export default function UserHeader({ users, onOpenAddModal }: UserHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
          Quản lý người dùng
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Tổng cộng <span className="font-bold text-indigo-600">{users.length}</span> người dùng •{' '}
          <span className="text-red-600 font-bold">{users.filter(u => u.role === 'admin').length}</span> admin •{' '}
          <span className="text-purple-600 font-bold">{users.filter(u => u.role === 'speaker').length}</span> diễn giả
        </p>
      </div>

      <button
        onClick={onOpenAddModal}
        className="group flex items-center gap-3 px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        Thêm người dùng mới
      </button>
    </div>
  );
}