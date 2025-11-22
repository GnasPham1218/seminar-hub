import { useState } from 'react'
import { toast } from 'sonner'
import { LogIn, Sparkles, User, Lock } from 'lucide-react'
import { client } from '../lib/graphql'
import { LOGIN_MUTATION } from '../lib/mutations'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng nhập email và mật khẩu')
      return
    }

    setIsLoading(true)

    try {
      const { login: user } = await client.request(LOGIN_MUTATION, {
        email: email.trim(),
        password: password,
      })

      localStorage.setItem('currentUserId', user.id)
      localStorage.setItem('currentUser', JSON.stringify(user))

      toast.success(`Đăng nhập thành công! Chào ${user.name} (${user.role}) 🎉`, {
        description: 'Đang chuyển hướng...',
      })

      setTimeout(() => window.location.replace('/'), 1500)
    } catch (err: any) {
      toast.error(
        err?.response?.errors?.[0]?.message || 
        err?.message || 
        'Đăng nhập thất bại – Sai email hoặc mật khẩu'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
          {/* Logo + Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl mb-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
              Hội thảo KH
            </h1>
            <p className="mt-3 text-gray-600 text-lg">Chào mừng bạn trở lại!</p>
          </div>

          {/* Form đăng nhập */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full pl-14 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : (
              <>
                <LogIn className="w-6 h-6" />
                Đăng nhập
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-8">
            Hệ thống quản lý hội thảo khoa học
          </p>
        </div>
      </div>
    </div>
  )
}