// src/pages/admin/Papers.tsx
import { useEffect, useState } from 'react'
import { Search, Filter, FileText, User, CheckCircle2, XCircle, Clock, Download, Eye, Calendar, Tag, ChevronRight, AlertCircle, Trash2, Plus, Save, X as XIcon, Edit3 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { client } from '../../lib/graphql'

interface Paper {
  id: string
  title: string
  authorIds: string[]
  abstract: string
  keywords: string[]
  fileUrl: string
  status: 'pending' | 'approved' | 'rejected' | 'revision'
  sessionId: string | null
  submissionDate: string
}

const GET_PAPERS_QUERY = `
  query GetPapers($page: Int!, $limit: Int!) {
    papers(page: $page, limit: $limit) {
      papers {
        id
        title
        authorIds
        abstract
        keywords
        fileUrl
        status
        sessionId
        submissionDate
      }
      pageInfo {
        totalCount
      }
    }
  }
`

const CREATE_PAPER_MUTATION = `
  mutation CreatePaper($input: CreatePaperInput!) {
    createPaper(input: $input) {
      id
      title
      authorIds
      abstract
      keywords
      fileUrl
      status
      sessionId
      submissionDate
    }
  }
`

const UPDATE_PAPER_MUTATION = `
  mutation UpdatePaper($id: String!, $input: UpdatePaperInput!) {
    updatePaper(id: $id, input: $input) {
      id
      title
      status
      sessionId
    }
  }
`

const DELETE_PAPER_MUTATION = `
  mutation DeletePaper($id: String!) {
    deletePaper(id: $id)
  }
`

export default function AdminPapers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Paper>>({})

  const currentUserId = localStorage.getItem('currentUserId') || 'u003'

  const [newPaper, setNewPaper] = useState({
    title: '',
    abstract: '',
    keywords: '',
    fileUrl: '',
    authorIds: [currentUserId],
    sessionId: '',
    status: 'pending' as const
  })

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.request(GET_PAPERS_QUERY, { page: 1, limit: 100 })
      setPapers(response.papers.papers)
    } catch (err: any) {
      console.error('Lỗi fetch papers:', err)
      setError('Không thể tải dữ liệu bài báo')
      toast.error('Lỗi kết nối backend!')
    } finally {
      setLoading(false)
    }
  }

  // TẠO BÀI BÁO THÀNH CÔNG 100%
  const handleAddPaper = async () => {
    if (!newPaper.title || !newPaper.abstract || !newPaper.fileUrl) {
      toast.error('Vui lòng điền đầy đủ tiêu đề, tóm tắt và link PDF!')
      return
    }

    const paperInput = {
      title: newPaper.title,
      abstract: newPaper.abstract,
      keywords: newPaper.keywords.split(',').map(k => k.trim()).filter(Boolean),
      fileUrl: newPaper.fileUrl,
      authorIds: newPaper.authorIds,
      sessionId: newPaper.sessionId || null,
      status: newPaper.status
    }

    try {
      await client.request(CREATE_PAPER_MUTATION, { input: paperInput })
      toast.success('Nộp bài báo thành công!')
      setShowAddModal(false)
      setNewPaper({
        title: '',
        abstract: '',
        keywords: '',
        fileUrl: '',
        authorIds: [currentUserId],
        sessionId: '',
        status: 'pending'
      })
      fetchPapers()
    } catch (err: any) {
      console.error(err)
      toast.error('Nộp bài thất bại!')
    }
  }

  // SỬA BÀI BÁO
  const startEdit = (paper: Paper) => {
    setEditingId(paper.id)
    setEditForm({
      title: paper.title,
      abstract: paper.abstract,
      keywords: paper.keywords,
      fileUrl: paper.fileUrl,
      sessionId: paper.sessionId || '',
      status: paper.status
    })
  }

  const saveEdit = async (paperId: string) => {
    try {
      const input: any = { ...editForm }
      if (input.keywords) input.keywords = input.keywords
      if (input.sessionId === '') input.sessionId = null

      await client.request(UPDATE_PAPER_MUTATION, { id: paperId, input })
      toast.success('Cập nhật thành công!')
      setEditingId(null)
      fetchPapers()
    } catch (err) {
      toast.error('Cập nhật thất bại!')
    }
  }

  // DUYỆT / TỪ CHỐI / YÊU CẦU SỬA
  const handleStatusChange = async (paperId: string, newStatus: Paper['status'], sessionId?: string) => {
    try {
      await client.request(UPDATE_PAPER_MUTATION, {
        id: paperId,
        input: { status: newStatus, sessionId: sessionId || null }
      })
      toast.success(`Đã ${newStatus === 'approved' ? 'duyệt' : newStatus === 'rejected' ? 'từ chối' : 'yêu cầu sửa'} bài báo!`)
      fetchPapers()
    } catch (err) {
      toast.error('Cập nhật thất bại!')
    }
  }

  // XÓA BÀI BÁO
  const handleDelete = async (paperId: string, title: string) => {
    if (!confirm(`Xóa bài báo "${title}"? Không thể hoàn tác!`)) return

    try {
      await client.request(DELETE_PAPER_MUTATION, { id: paperId })
      toast.success('Xóa thành công!')
      setPapers(papers.filter(p => p.id !== paperId))
    } catch (err) {
      toast.error('Xóa thất bại!')
    }
  }

  const filtered = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusConfig = (status: Paper['status']) => {
    switch (status) {
      case 'approved':  return { gradient: 'from-emerald-500 to-teal-600',   icon: CheckCircle2, label: 'Đã duyệt' }
      case 'pending':   return { gradient: 'from-orange-500 to-yellow-600', icon: Clock,        label: 'Chờ duyệt' }
      case 'rejected':  return { gradient: 'from-red-500 to-rose-600',      icon: XCircle,      label: 'Từ chối' }
      case 'revision':  return { gradient: 'from-purple-500 to-pink-600',   icon: FileText,     label: 'Yêu cầu sửa' }
      default: return { gradient: 'from-gray-500 to-slate-600', icon: FileText, label: 'Không rõ' }
    }
  }

  if (loading) return <div className="flex items-center justify-center h-96"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (error) return <div className="flex flex-col items-center justify-center h-96 gap-6 text-center"><AlertCircle className="w-20 h-20 text-red-500" /><h3 className="text-2xl font-bold text-red-600">Lỗi kết nối</h3><p className="text-gray-600 max-w-md">{error}</p><button onClick={fetchPapers} className="btn btn-primary mt-4">Thử lại</button></div>

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
        <button
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Nộp bài báo mới
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, từ khóa..."
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

      {/* Papers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((paper) => {
          const config = getStatusConfig(paper.status)
          const StatusIcon = config.icon
          const isEditing = editingId === paper.id

          return (
            <div key={paper.id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-white/30 overflow-hidden transition-all duration-500 hover:-translate-y-4">
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
                {isEditing ? (
                  <div className="space-y-4">
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Tiêu đề" />
                    <textarea value={editForm.abstract || ''} onChange={e => setEditForm({ ...editForm, abstract: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none h-32 resize-none" placeholder="Tóm tắt" />
                    <input type="text" value={editForm.keywords?.join(', ') || ''} onChange={e => setEditForm({ ...editForm, keywords: e.target.value.split(',').map(k => k.trim()) })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Từ khóa (ngăn cách bằng dấu phẩy)" />
                    <input type="text" value={editForm.fileUrl || ''} onChange={e => setEditForm({ ...editForm, fileUrl: e.target.value })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Link PDF" />
                    <input type="text" value={editForm.sessionId || ''} onChange={e => setEditForm({ ...editForm, sessionId: e.target.value || null })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" placeholder="Session ID (để trống nếu chưa gán)" />
                    <select value={editForm.status || ''} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none">
                      <option value="pending">Chờ duyệt</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                      <option value="revision">Yêu cầu sửa</option>
                    </select>

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => saveEdit(paper.id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg">
                        <Save className="w-5 h-5" /> Lưu
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition shadow-lg">
                        <XIcon className="w-5 h-5" /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-2xl font-extrabold text-gray-800 line-clamp-3 group-hover:text-indigo-600 transition">{paper.title}</h3>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => startEdit(paper)} className="p-3 bg-blue-100 text-blue-600 rounded-2xl hover:bg-blue-200 transition shadow-lg">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(paper.id, paper.title)} className="p-3 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition shadow-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-5">
                      <User className="w-5 h-5 text-indigo-500" />
                      <span className="text-gray-700 font-medium text-sm">
                        {paper.authorIds.join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                      <Tag className="w-5 h-5 text-purple-500" />
                      {paper.keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium">
                          {paper.sessionId ? `Đã gán vào phiên ${paper.sessionId}` : 'Chưa gán phiên trình bày'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {(paper.status === 'pending' || paper.status === 'revision') && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <button onClick={() => handleStatusChange(paper.id, 'approved')} className="btn btn-success flex items-center justify-center gap-2 text-sm">
                          <CheckCircle2 className="w-5 h-5" /> Duyệt
                        </button>
                        <button onClick={() => handleStatusChange(paper.id, 'revision')} className="btn btn-warning flex items-center justify-center gap-2 text-sm">
                          <FileText className="w-5 h-5" /> Sửa
                        </button>
                        <button onClick={() => handleStatusChange(paper.id, 'rejected')} className="btn btn-error flex items-center justify-center gap-2 text-sm">
                          <XCircle className="w-5 h-5" /> Từ chối
                        </button>
                      </div>
                    )}

                    <a
                      href={paper.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      Xem PDF
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </a>
                  </>
                )}
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          )
        })}
      </div>

      {/* Modal Nộp bài báo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="w-10 h-10 text-indigo-600" />
                Nộp bài báo mới
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 rounded-xl transition">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <input type="text" placeholder="Tiêu đề bài báo *" value={newPaper.title} onChange={e => setNewPaper({ ...newPaper, title: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <textarea placeholder="Tóm tắt (Abstract) *" value={newPaper.abstract} onChange={e => setNewPaper({ ...newPaper, abstract: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition h-32 resize-none" />
              <input type="text" placeholder="Từ khóa (ngăn cách bằng dấu phẩy)" value={newPaper.keywords} onChange={e => setNewPaper({ ...newPaper, keywords: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="url" placeholder="Link file PDF *" value={newPaper.fileUrl} onChange={e => setNewPaper({ ...newPaper, fileUrl: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
              <input type="text" placeholder="Session ID (để trống nếu chưa biết)" value={newPaper.sessionId} onChange={e => setNewPaper({ ...newPaper, sessionId: e.target.value })} className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition" />
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={handleAddPaper} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Nộp bài báo
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