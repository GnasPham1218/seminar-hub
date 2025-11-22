import { UserPlus, X } from 'lucide-react';
import type { CreateUserInput } from '../../lib/types';


interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUser: CreateUserInput;
  setNewUser: (user: CreateUserInput) => void;
  onSubmit: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  newUser,
  setNewUser,
  onSubmit,
}: CreateUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <UserPlus className="w-10 h-10 text-indigo-600" />
            Thêm người dùng mới
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-xl transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
            <input type="text" placeholder="Nhập họ tên" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
            <input type="email" placeholder="Nhập email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu *</label>
            <input type="password" placeholder="Nhập mật khẩu" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò</label>
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition">
              <option value="attendee">Người tham gia</option>
              <option value="researcher">Nhà nghiên cứu</option>
              <option value="speaker">Diễn giả</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Đơn vị công tác</label>
            <input type="text" placeholder="Nhập đơn vị" value={newUser.organization} onChange={e => setNewUser({ ...newUser, organization: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
            <input type="text" placeholder="Nhập số điện thoại" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onSubmit} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Thêm người dùng
          </button>
          <button onClick={onClose} className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl hover:bg-gray-300 transition">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}