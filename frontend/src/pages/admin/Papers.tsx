// src/pages/admin/Papers.tsx
import { useEffect, useState } from 'react'
import { Search, Filter, FileText, User, CheckCircle2, XCircle, Clock, Download, Eye, Plus, Calendar, Tag, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Paper {
  id: string
  title: string
  authorIds: string[]
  authorNames: string[]
  abstract: string
  keywords: string[]
  fileUrl: string
  status: 'pending' | 'approved' | 'rejected' | 'revision'
  sessionId: string | null
  submissionDate: string
}

export default function AdminPapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all')

  // Dữ liệu mẫu siêu đẹp (sau này thay bằng fetch GraphQL thật)
  useEffect(() => {
    const mockPapers: Paper[] = [
      {
        id: 'p001',
        title: 'Ứng dụng Deep Learning trong phát hiện sớm ung thư từ ảnh X-quang',
        authorIds: ['u001'],
        authorNames: ['Nguyễn Văn An'],
        abstract: 'Bài báo đề xuất mô hình CNN cải tiến đạt độ chính xác 98.7% trên tập dữ liệu lớn...',
        keywords: ['Deep Learning', 'Y tế', 'Ung thư', 'CNN'],
        fileUrl: 'https://example.com/papers/ai_y_te.pdf',
        status: 'approved',
        sessionId: 's001',
        submissionDate: '2025-10-15T14:30:00Z'
      },
      {
        id: 'p002',
        title: 'Phân tích dữ liệu lớn với Python và Pandas: Tối ưu hiệu năng',
        authorIds: ['u002'],
        authorNames: ['Trần Thị Bình'],
        abstract: 'Nghiên cứu các kỹ thuật tối ưu hóa bộ nhớ và tốc độ xử lý với Pandas trên tập dữ liệu 100GB...',
        keywords: ['Python', 'Pandas', 'Big Data', 'Data Analysis'],
        fileUrl: 'https://example.com/papers/python_pandas.pdf',
        status: 'pending',
        sessionId: null,
        submissionDate: '2025-10-20T09:15:00Z'
      },
      {
        id: 'p003',
        title: 'Mô hình Transformer cho bài toán dịch máy Việt - Anh',
        authorIds: ['u001', 'u004'],
        authorNames: ['Nguyễn Văn An', 'Phạm Thị Lan'],
        abstract: 'Cải tiến kiến trúc Transformer với attention cơ chế mới, đạt BLEU score cao hơn 3.2 điểm...',
        keywords: ['NLP', 'Transformer', 'Dịch máy', 'Tiếng Việt'],
        fileUrl: 'https://example.com/papers/transformer_vi_en.pdf',
        status: 'revision',
        sessionId: null,
        submissionDate: '2025-10-18T11:00:00Z'
      },
    ]
    setPapers(mockPapers)
    setLoading(false)
  }, [])

  const filtered = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.authorNames.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         p.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusConfig = (status: Paper['status']) => {
    switch (status) {
      case 'approved':  return { gradient: 'from-emerald-500 to-teal-600',   icon: CheckCircle2, label: 'Đã duyệt',   color: 'text-emerald-600' }
      case 'pending':   return { gradient: 'from-orange-500 to-yellow-600', icon: Clock,        label: 'Chờ duyệt',  color: 'text-orange-600' }
      case 'rejected':  return { gradient: 'from-red-500 to-rose-600',      icon: XCircle,      label: 'Từ chối',    color: 'text-red-600' }
      case 'revision':  return { gradient: 'from-purple-500 to-pink-600',   icon: FileText,     label: 'Yêu cầu sửa',color: 'text-purple-600' }
      default: return { gradient: 'from-gray-500 to-slate-600', icon: FileText, label: 'Không rõ', color: 'text-gray-600' }
    }
  }

  const handleApprove = (id: string) => alert(`Đã phê duyệt bài báo ${id} ✅`)
  const handleReject = (id: string) => alert(`Đã từ chối bài báo ${id} ❌`)
  const handleRevision = (id: string) => alert(`Yêu cầu sửa bài báo ${id} ✍️`)

  if (loading) return <div className="flex items-center justify-center h-96"><span className="loading loading-spinner loading-lg text-primary"></span></div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
            Quản lý bài báo khoa học
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            Tổng cộng {papers.length} bài báo • {papers.filter(p => p.status === 'approved').length} đã duyệt • {papers.filter(p => p.status === 'pending').length} chờ xử lý
          </p>
        </div>
        <button className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <Download className="w-6 h-6" />
          Xuất danh sách
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, tác giả, từ khóa..."
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected', 'revision'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-5 py-4 rounded-2xl font-medium transition-all ${filterStatus === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {s === 'all' ? 'Tất cả' : s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : s === 'rejected' ? 'Từ chối' : 'Yêu cầu sửa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Papers Grid – Card Style SIÊU ĐẸP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((paper) => {
          const config = getStatusConfig(paper.status)
          const StatusIcon = config.icon

          return (
            <div key={paper.id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-4">
              {/* Status Header */}
              <div className={`p-6 bg-gradient-to-r ${config.gradient} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-8 h-8" />
                    <div>
                      <div className="text-xl font-bold">{config.label}</div>
                      <div className="text-sm opacity-90">Nộp ngày {format(new Date(paper.submissionDate), 'dd/MM/yyyy')}</div>
                    </div>
                  </div>
                  <span className="font-mono text-2xl font-bold">#{paper.id}</span>
                </div>
              </div>

              <div className="p-8">
                {/* Title */}
                <h3 className="text-2xl font-extrabold text-gray-800 mb-4 line-clamp-3 group-hover:text-indigo-600 transition">
                  {paper.title}
                </h3>

                {/* Authors */}
                <div className="flex items-center gap-3 mb-5">
                  <User className="w-5 h-5 text-indigo-500" />
                  <div className="flex flex-wrap gap-2">
                    {paper.authorNames.map((name, i) => (
                      <span key={i} className="text-gray-700 font-medium">
                        {name}{i < paper.authorNames.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <Tag className="w-5 h-5 text-purple-500" />
                  {paper.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Session */}
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">
                      {paper.sessionId ? `Đã gán vào phiên ${paper.sessionId}` : 'Chưa gán phiên trình bày'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons – hiện khi hover hoặc pending */}
                {(paper.status === 'pending' || paper.status === 'revision') && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button onClick={() => handleApprove(paper.id)} className="btn btn-success flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Duyệt
                    </button>
                    <button onClick={() => handleRevision(paper.id)} className="btn btn-warning flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" /> Sửa
                    </button>
                    <button onClick={() => handleReject(paper.id)} className="btn btn-error flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" /> Từ chối
                    </button>
                  </div>
                )}

                {/* View PDF */}
                <a
                  href={paper.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Xem PDF
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </a>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700">Không có bài báo nào</h3>
          <p className="text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc chờ tác giả nộp bài</p>
        </div>
      )}
    </div>
  )
}