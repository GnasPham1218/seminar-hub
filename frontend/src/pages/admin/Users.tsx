import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { client } from '../../lib/graphql';
import type { CreateUserInput, User } from '../../lib/types';
import { GET_USERS } from '../../lib/queries';
import { CREATE_USER, DELETE_USER, UPDATE_USER } from '../../lib/mutations';
import UserHeader from '../../components/admin-users/UserHeader';
import UserSearch from '../../components/admin-users/UserSearch';
import CreateUserModal from '../../components/admin-users/CreateUserModal';
import DeleteConfirmModal from '../../components/admin-events/DeleteConfirmModal';
import UserCard from '../../components/admin-users/UserCard';



export default function AdminUsers() {
  // --- STATE ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // New User
  const [newUser, setNewUser] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
    role: 'attendee',
    organization: '',
    phone: ''
  });

  // --- EFFECTS ---
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- API HANDLERS ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.request(GET_USERS, { page: 1, limit: 100 });
      setUsers(response.users.users);
    } catch (err: any) {
      console.error('Lỗi fetch users:', err);
      setError('Không thể tải dữ liệu người dùng');
      toast.error('Lỗi kết nối backend!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Vui lòng điền đầy đủ họ tên, email và mật khẩu!');
      return;
    }

    try {
      await client.request(CREATE_USER, { input: newUser });
      toast.success(`Thêm thành công người dùng ${newUser.name}!`);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'attendee', organization: '', phone: '' });
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error('Thêm thất bại! Email có thể đã tồn tại.');
    }
  };

  // EDIT HANDLERS
  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      phone: user.phone
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (userId: string) => {
    try {
      await client.request(UPDATE_USER, { id: userId, input: editForm });
      toast.success('Cập nhật thành công!');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      toast.error('Cập nhật thất bại!');
    }
  };

  // DELETE HANDLERS
  const openDeleteModal = (user: User) => {
    setDeleteModal({ id: user.id, title: user.name });
  };

  const executeDelete = async () => {
    if (!deleteModal) return;
    try {
      await client.request(DELETE_USER, { id: deleteModal.id });
      toast.success('Xóa thành công!');
      setUsers(users.filter(u => u.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      toast.error('Xóa thất bại!');
    }
  };

  // FILTER
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  // --- RENDER ---
  if (loading) return <div className="flex flex-col items-center justify-center h-96 gap-6"><span className="loading loading-spinner loading-lg text-primary"></span><p className="text-xl text-gray-600">Đang tải dữ liệu...</p></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-6 text-center"><AlertCircle className="w-20 h-20 text-red-500" /><h3 className="text-2xl font-bold text-red-600">Lỗi kết nối</h3><p className="text-gray-600 max-w-md">{error}</p><button onClick={fetchUsers} className="btn btn-primary mt-4">Thử lại</button></div>;

  return (
    <div className="space-y-8">
      <UserHeader users={users} onOpenAddModal={() => setShowAddModal(true)} />
      <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isEditing={editingId === user.id}
            editForm={editForm}
            setEditForm={setEditForm}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onDelete={openDeleteModal}
          />
        ))}
      </div>

      {/* MODALS */}
      <CreateUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newUser={newUser}
        setNewUser={setNewUser}
        onSubmit={handleAddUser}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        eventTitle={deleteModal?.title || ''}
        onClose={() => setDeleteModal(null)}
        onConfirm={executeDelete}
      />
    </div>
  );
}