// src/pages/client/Home.tsx
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  Globe,
  Award,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section - Siêu đỉnh cao */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-white/10 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-6 text-center z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">
                Hội thảo Khoa học Quốc gia 2025
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Nơi Hội Tụ Các Nhà
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Nghiên Cứu Hàng Đầu
              </span>
            </h1>

            <p className="mt-8 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Kết nối tri thức • Chia sẻ tầm nhìn • Định hình tương lai khoa học
              Việt Nam
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/events"
                className="group inline-flex items-center justify-center px-10 py-5 bg-white text-indigo-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 transition-all duration-300"
              >
                Khám phá sự kiện ngay
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center px-10 py-5 border-4 border-white/50 text-white font-bold text-lg rounded-full backdrop-blur-md hover:bg-white/20 transition-all duration-300"
              >
                Tham gia cùng chúng tôi
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-4 bg-white/70 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Stats Section - Nâng cấp siêu đẹp */}
      {/* Stats Section – Đã fix 100% đẹp */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block">
              Chúng tôi tự hào về những con số này
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Hành trình đồng hành cùng cộng đồng khoa học Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                icon: Calendar,
                value: "24+",
                label: "Sự kiện lớn nhỏ",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Users,
                value: "1,500+",
                label: "Nhà khoa học tham gia",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Trophy,
                value: "89",
                label: "Bài báo xuất sắc",
                gradient: "from-orange-500 to-pink-500",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`group relative bg-gradient-to-br ${stat.gradient} p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-6 transition-all duration-500 overflow-hidden`}
                >
                  {/* Overlay sáng khi hover */}
                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition"></div>

                  <div className="relative z-10 text-center text-white">
                    <Icon className="w-16 h-16 mx-auto mb-6 opacity-90" />
                    <div className="text-6xl font-extrabold mb-3 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xl font-medium opacity-90">
                      {stat.label}
                    </div>
                  </div>

                  {/* Hiệu ứng bóng mờ dưới */}
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Tại sao chọn <span className="text-indigo-600">Hội thảo KH</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                icon: Globe,
                title: "Quy mô quốc gia",
                desc: "Kết nối các trường đại học, viện nghiên cứu lớn nhất Việt Nam",
              },
              {
                icon: Award,
                title: "Chất lượng cao cấp",
                desc: "89+ bài báo được chọn lọc kỹ lưỡng từ hàng trăm bài nộp",
              },
              {
                icon: Sparkles,
                title: "Trải nghiệm đỉnh cao",
                desc: "Công nghệ quản lý hiện đại, giao diện đẹp mắt, dễ sử dụng",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                <div className="mt-6 flex items-center text-indigo-600 font-medium">
                  Tìm hiểu thêm <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Sẵn sàng tham gia hành trình khoa học 2025?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay để không bỏ lỡ các sự kiện đỉnh cao sắp tới
          </p>
          <Link
            to="/events"
            className="inline-flex items-center px-12 py-5 bg-white text-indigo-600 font-bold text-xl rounded-full shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 transition-all duration-300"
          >
            Bắt đầu ngay bây giờ
            <ArrowRight className="ml-4 w-7 h-7" />
          </Link>
        </div>
      </section>
    </>
  );
}
