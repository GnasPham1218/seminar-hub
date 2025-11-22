// src/pages/admin/Users.tsx
import { useEffect, useState } from 'react'
import { Search, Mail, Phone, Building2, Shield, Users, Edit3, Trash2, Plus, Filter, MoreVertical, AlertCircle, Save, X, UserPlus } from 'lucide-react'

import { toast } from 'sonner'
import { client } from '../../lib/graphql'

interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
  phone: string
  registeredEvents: string[]
  createdAt: string
  updatedAt: string
}

const GET_USERS_QUERY = `
  query GetUsers($page: Int!, $limit: Int!) {
    users(page: $page, limit: $limit) {
      users {
        id
        name
        email
        role
        organization
        phone
        registeredEvents
        createdAt
        updatedAt
      }
      pageInfo {
        totalCount
      }
    }
  }
`

const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      organization
      phone
    }
  }
`

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: String!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      organization
      phone
      updatedAt
    }
  }
`

const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: String!) {
    deleteUser(id: $id)
  }
`

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'attendee' as const,
    organization: '',
    phone: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.request(GET_USERS_QUERY, { page: 1, limit: 100 })
      setUsers(response.users.users)
    } catch (err: any) {
      console.error('Lỗi fetch users:', err)
      setError('Không thể tải dữ liệu người dùng')
      toast.error('Lỗi kết nối backend!')
    } finally {
      setLoading(false)
    }
  }

  // === THÊM NGƯỜI DÙNG ===
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Vui lòng điền đầy đủ họ tên, email và mật khẩu!')
      return
    }

    try {
      const result = await client.request(CREATE_USER_MUTATION, { input: newUser })
      toast.success(`Thêm thành công người dùng ${result.createUser.name}!`)
      setShowAddModal(false)
      setNewUser({ name: '', email: '', password: '', role: 'attendee', organization: '', phone: '' })
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      toast.error('Thêm thất bại! Email có thể đã tồn tại.')
    }
  }

  // === SỬA NGƯỜI DÙNG ===
  const startEdit = (user: User) => {
    setEditingId(user.id)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      phone: user.phone
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (userId: string) => {
    try {
      await client.request(UPDATE_USER_MUTATION, { id: userId, input: editForm })
      toast.success('Cập nhật thành công!')
      setEditingId(null)
      fetchUsers()
    } catch (err) {
      toast.error('Cập nhật thất bại!')
    }
  }

  // === XÓA NGƯỜI DÙNG ===
  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Xóa người dùng "${userName}"? Không thể hoàn tác!`)) return

    try {
      await client.request(DELETE_USER_MUTATION, { id: userId })
      toast.success('Xóa thành công!')
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      toast.error('Xóa thất bại!')
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return { gradient: 'from-red-500 to-pink-600', icon: Shield, label: 'Quản trị viên' }
      case 'speaker': return { gradient: 'from-purple-500 to-indigo-600', icon: Users, label: 'Diễn giả' }
      case 'researcher': return { gradient: 'from-blue-500 to-cyan-600', icon: Users, label: 'Nhà nghiên cứu' }
      default: return { gradient: 'from-emerald-500 to-teal-600', icon: Users, label: 'Người tham gia' }
    }
  }

  if (loading) return <div className="flex flex-col items-center justify-center h-96 gap-6"><span className="loading loading-spinner loading-lg text-primary"></span><p className="text-xl text-gray-600">Đang tải dữ liệu...</p></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-6 text-center"><AlertCircle className="w-20 h-20 text-red-500" /><h3 className="text-2xl font-bold text-red-600">Lỗi kết nối</h3><p className="text-gray-600 max-w-md">{error}</p><button onClick={fetchUsers} className="btn btn-primary mt-4">Thử lại</button></div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý người dùng
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            Tổng cộng <span className="font-bold text-indigo-600">{users.length}</span> người dùng • 
            <span className="text-red-600 font-bold">{users.filter(u => u.role === 'admin').length}</span> admin • 
            <span className="text-purple-600 font-bold">{users.filter(u => u.role === 'speaker').length}</span> diễn giả
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, đơn vị, số điện thoại..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredUsers.map((user) => {
          const roleInfo = getRoleBadge(user.role)
          const RoleIcon = roleInfo.icon
          const isEditing = editingId === user.id

          return (
            <div key={user.id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-3">
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
                    <select value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none">
                      <option value="attendee">Người tham gia</option>
                      <option value="researcher">Nhà nghiên cứu</option>
                      <option value="speaker">Diễn giả</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                    <input type="text" value={editForm.organization || ''} onChange={e => setEditForm({ ...editForm, organization: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Đơn vị" />
                    <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Số điện thoại" />

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => saveEdit(user.id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg">
                        <Save className="w-5 h-5" /> Lưu
                      </button>
                      <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition shadow-lg">
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
                      <div className="flex items-center gap-3 text-gray-700"><Users className="w-5 h-5 text-orange-500" /><span className="text-sm">Đã đăng ký {user.registeredEvents.length} sự kiện</span></div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => startEdit(user)} className="p-4 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition shadow-lg"><Edit3 className="w-6 h-6" /></button>
                      <button onClick={() => deleteUser(user.id, user.name)} className="p-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition shadow-lg"><Trash2 className="w-6 h-6" /></button>
                      <button className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition shadow-lg"><MoreVertical className="w-6 h-6" /></button>
                    </div>
                  </>
                )}
              </div>

              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {/* Modal Thêm người dùng */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <UserPlus className="w-10 h-10 text-indigo-600" />
                Thêm người dùng mới
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 rounded-xl transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <input type="text" placeholder="Họ và tên *" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="email" placeholder="Email *" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="password" placeholder="Mật khẩu *" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition">
                <option value="attendee">Người tham gia</option>
                <option value="researcher">Nhà nghiên cứu</option>
                <option value="speaker">Diễn giả</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <input type="text" placeholder="Đơn vị công tác" value={newUser.organization} onChange={e => setNewUser({ ...newUser, organization: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="text" placeholder="Số điện thoại" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handleAddUser} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Thêm người dùng
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold rounded-2xl hover:bg-gray-300 transition">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}