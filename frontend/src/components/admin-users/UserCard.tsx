
import { Mail, Phone, Building2, Users, Edit3, Trash2, MoreVertical, Save, X } from 'lucide-react';
import { getRoleBadge, type User } from '../../lib/types';


interface UserCardProps {
  user: User;
  isEditing: boolean;
  editForm: Partial<User>;
  setEditForm: (form: Partial<User>) => void;
  onStartEdit: (user: User) => void;
  onSaveEdit: (userId: string) => void;
  onCancelEdit: () => void;
  onDelete: (user: User) => void;
}

export default function UserCard({
  user,
  isEditing,
  editForm,
  setEditForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: UserCardProps) {
  const roleInfo = getRoleBadge(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-3">
      {/* Role Badge */}
      <div className="absolute top-6 right-6 z-10">
        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${roleInfo.gradient} text-white font-bold text-sm shadow-lg flex items-center gap-2`}>
          <RoleIcon className="w-4 h-4" />
          {roleInfo.label}
        </div>
      </div>

      <div className="p-8 pt-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
              {user.name.split(' ').pop()?.[0] || 'U'}
            </div>
          </div>
        </div>

        <div className="font-mono text-lg text-indigo-600 mb-2 text-center">#{user.id}</div>

        {isEditing ? (
          <div className="space-y-4">
            <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Họ tên" />
            <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Email" />
            <select value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value as any })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none">
              <option value="attendee">Người tham gia</option>
              <option value="researcher">Nhà nghiên cứu</option>
              <option value="speaker">Diễn giả</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <input type="text" value={editForm.organization || ''} onChange={e => setEditForm({ ...editForm, organization: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Đơn vị" />
            <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Số điện thoại" />

            <div className="flex gap-3 mt-4">
              <button onClick={() => onSaveEdit(user.id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg">
                <Save className="w-5 h-5" /> Lưu
              </button>
              <button onClick={onCancelEdit} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition shadow-lg">
                <X className="w-5 h-5" /> Hủy
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">{user.name}</h3>

            <div className="space-y-4 mt-6 text-left bg-gray-50/70 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-gray-700"><Mail className="w-5 h-5 text-indigo-500" /><span className="text-sm truncate">{user.email}</span></div>
              <div className="flex items-center gap-3 text-gray-700"><Phone className="w-5 h-5 text-purple-500" /><span className="text-sm">{user.phone}</span></div>
              <div className="flex items-center gap-3 text-gray-700"><Building2 className="w-5 h-5 text-emerald-500" /><span className="text-sm truncate">{user.organization}</span></div>
              <div className="flex items-center gap-3 text-gray-700"><Users className="w-5 h-5 text-orange-500" /><span className="text-sm">Đã đăng ký {user.registeredEvents?.length || 0} sự kiện</span></div>
            </div>

            <div className="mt-8 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={() => onStartEdit(user)} className="p-4 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition shadow-lg"><Edit3 className="w-6 h-6" /></button>
              <button onClick={() => onDelete(user)} className="p-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition shadow-lg"><Trash2 className="w-6 h-6" /></button>
              <button className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition shadow-lg"><MoreVertical className="w-6 h-6" /></button>
            </div>
          </>
        )}
      </div>

      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
    </div>
  );
}