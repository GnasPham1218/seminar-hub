// src/pages/Login.tsx
import { useState } from 'react'
import { toast } from 'sonner'
import { LogIn, Sparkles, User, Shield, Users } from 'lucide-react'

export default function Login() {
  const [userId, setUserId] = useState('')

  const handleLogin = () => {
    if (!userId.trim()) {
      toast.error('Vui lòng nhập User ID')
      return
    }
    localStorage.setItem('currentUserId', userId.trim())
    toast.success('Đăng nhập thành công! 🎉', {
      description: 'Đang chuyển hướng...',
    })
    setTimeout(() => window.location.replace('/'), 1200)
  }

  const quickLogin = (id: string, role: string) => {
    setUserId(id)
    localStorage.setItem('currentUserId', id)
    toast.success(`Đã đăng nhập với vai trò ${role} 👋`)
    setTimeout(() => window.location.replace('/'), 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-white/10 to-transparent"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          {/* Logo + Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl mb-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Hội thảo KH
            </h1>
            <p className="mt-3 text-gray-600 text-lg">Chào mừng bạn trở lại!</p>
          </div>

          {/* Input */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Nhập User ID của bạn
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Ví dụ: u003"
                className="w-full pl-14 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {/* Main Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            Đăng nhập ngay
          </button>

          {/* Divider */}
          <div className="my-10 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-6 text-gray-500 font-medium">Hoặc chọn nhanh</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Quick Login Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => quickLogin('u003', 'Quản trị viên')}
              className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              <Shield className="w-10 h-10 mb-2" />
              <span className="text-sm font-bold">Admin</span>
              <span className="text-xs opacity-90">u003</span>
            </button>

            <button
              onClick={() => quickLogin('u001', 'Nhà nghiên cứu')}
              className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              <Users className="w-10 h-10 mb-2" />
              <span className="text-sm font-bold">Researcher</span>
              <span className="text-xs opacity-90">u001</span>
            </button>

            <button
              onClick={() => quickLogin('u002', 'Diễn giả')}
              className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              <Sparkles className="w-10 h-10 mb-2" />
              <span className="text-sm font-bold">Speaker</span>
              <span className="text-xs opacity-90">u002</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-gray-500 text-sm mt-10">
            Đây là phiên bản phát triển • Dùng <span className="font-mono bg-gray-200 px-2 py-1 rounded">u003</span> để vào Admin
          </p>
        </div>
      </div>
    </div>
  )
}