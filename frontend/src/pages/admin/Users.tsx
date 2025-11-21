// src/pages/admin/Users.tsx
import { useEffect, useState } from 'react'
import { Search, Mail, Phone, Building2, Shield, Users, Edit3, Trash2, Plus, Filter, MoreVertical } from 'lucide-react'
import { client } from '../../lib/graphql'

interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
  phone: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    client.request(`
      query { 
        users(page: 1, limit: 100) { 
          users { id name email role organization phone registeredEvents } 
        } 
      }
    `).then((data: any) => {
      setUsers(data.users.users)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { gradient: 'from-red-500 to-pink-600', icon: Shield, label: 'Quản trị viên' }
      case 'speaker':
        return { gradient: 'from-purple-500 to-indigo-600', icon: Users, label: 'Diễn giả' }
      case 'researcher':
        return { gradient: 'from-blue-500 to-cyan-600', icon: Users, label: 'Nhà nghiên cứu' }
      default:
        return { gradient: 'from-emerald-500 to-teal-600', icon: Users, label: 'Người tham gia' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý người dùng
          </h1>
          <p className="text-xl text-gray-600 mt-2">Tổng cộng {users.length} người dùng đã đăng ký</p>
        </div>

        <button className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, đơn vị..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 font-medium">
            <Filter className="w-5 h-5" />
            Lọc theo vai trò
          </button>
        </div>
      </div>

      {/* Users Grid - Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredUsers.map((user) => {
          const roleInfo = getRoleBadge(user.role)
          const RoleIcon = roleInfo.icon

          return (
            <div
              key={user.id}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-3"
            >
              {/* Role Badge */}
              <div className="absolute top-6 right-6 z-10">
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${roleInfo.gradient} text-white font-bold text-sm shadow-lg flex items-center gap-2`}>
                  <RoleIcon className="w-4 h-4" />
                  {roleInfo.label}
                </div>
              </div>

              {/* Avatar & ID */}
              <div className="p-8 pt-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      {user.name.split(' ').pop()?.[0] || 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="font-mono text-lg text-indigo-600 mb-2">#{user.id}</div>
                <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{user.name}</h3>

                {/* Info List */}
                <div className="space-y-4 mt-6 text-left bg-gray-50/70 rounded-2xl p-5">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm truncate">{user.organization}</span>
                  </div>
                </div>

                {/* Action Buttons - hiện khi hover */}
                <div className="mt-8 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-4 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition shadow-lg">
                    <Edit3 className="w-6 h-6" />
                  </button>
                  <button className="p-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition shadow-lg">
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <button className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition shadow-lg">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Decorative blur */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy người dùng nào</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  )
}