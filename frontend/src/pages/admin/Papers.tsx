// src/pages/admin/Papers.tsx
import { useEffect, useState } from 'react';
import { 
  Search, FileText, User, CheckCircle2, XCircle, Clock, 
  Trash2, Plus, X as XIcon, Edit3, Upload, Check, Loader2, 
  AlertCircle, Save, Type, Tag, Link as LinkIcon, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { client } from '../../lib/graphql';

// Import Queries & Mutations
import { GET_PAPERS, GET_EVENTS, GET_EVENT_SESSIONS } from '../../lib/queries';
import { 
  CREATE_PAPER, 
  UPDATE_PAPER, 
  DELETE_PAPER 
} from '../../lib/mutations';

const API_BASE_URL = "http://localhost:8000";

// --- INTERFACES ---
interface Paper {
  id: string;
  title: string;
  authorIds: string[];
  abstract: string;
  keywords: string[];
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  sessionId: string | null;
  submissionDate: string;
  eventId: string;
  event?: { title: string; };
}

interface EventOption { id: string; title: string; }
interface SessionOption { id: string; title: string; startTime: string; room: string; }

// ============================================================================
// 👇 COMPONENT MODAL SỬA (RIÊNG BIỆT, GIỮA MÀN HÌNH)
// ============================================================================
interface EditPaperModalProps {
  paper: Paper;
  events: EventOption[];
  onClose: () => void;
  onSave: () => void; // Gọi lại fetchData sau khi save
}

function EditPaperModal({ paper, events, onClose, onSave }: EditPaperModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  
  // Sessions cho dropdown (nếu muốn đổi session)
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    title: paper.title || "",
    abstract: paper.abstract || "",
    authorIds: paper.authorIds?.join(", ") || "", 
    keywords: paper.keywords?.join(", ") || "",   
    status: paper.status, // 👇 Cho phép sửa status
    eventId: paper.eventId || "",
    sessionId: paper.sessionId || "",
  });

  // Load sessions khi mở modal (dựa trên eventId hiện tại của paper)
  useEffect(() => {
    if (formData.eventId) {
      fetchSessions(formData.eventId);
    }
  }, []); // Chạy 1 lần khi mount

  const fetchSessions = async (eventId: string) => {
    setLoadingSessions(true);
    try {
      const data = await client.request(GET_EVENT_SESSIONS, { eventId });
      setSessions(data.sessions?.sessions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Xử lý khi đổi Event -> Reset Session và load lại list session
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEventId = e.target.value;
    setFormData({ ...formData, eventId: newEventId, sessionId: "" });
    if (newEventId) fetchSessions(newEventId);
    else setSessions([]);
  };

  // Xử lý file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") return toast.error("Chỉ nhận file PDF");
      setNewFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalFileUrl = paper.fileUrl; // Mặc định dùng file cũ

      // 👇 LOGIC: Nếu có chọn file mới thì upload, không thì giữ nguyên
      if (newFile) {
        const uploadData = new FormData();
        uploadData.append("file", newFile);
        const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: uploadData });
        if (!res.ok) throw new Error("Lỗi upload file");
        const data = await res.json();
        finalFileUrl = data.filename;
      }

      const input = {
        title: formData.title,
        abstract: formData.abstract,
        status: formData.status,
        fileUrl: finalFileUrl, // URL mới hoặc cũ
        authorIds: formData.authorIds.split(",").map(s => s.trim()).filter(Boolean),
        keywords: formData.keywords.split(",").map(s => s.trim()).filter(Boolean),
        eventId: formData.eventId,
        sessionId: formData.sessionId || null,
      };

      await client.request(UPDATE_PAPER, { id: paper.id, input });
      toast.success("Cập nhật thành công!");
      onSave(); // Refresh list
      onClose(); // Đóng modal
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Edit3 className="text-indigo-600" size={20}/> Chỉnh sửa bài báo
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><XIcon size={20}/></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Row 1: Title & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu đề</label>
              <input 
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
              <select 
                className="w-full p-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.status}
                onChange={(e: any) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="revision">Yêu cầu sửa</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>

          {/* Row 2: Event & Session */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sự kiện</label>
              <select className="w-full p-2.5 border rounded-xl bg-white" value={formData.eventId} onChange={handleEventChange}>
                <option value="">-- Chọn Event --</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Phiên họp {loadingSessions && <span className="ml-1 animate-spin">↻</span>}
              </label>
              <select 
                className="w-full p-2.5 border rounded-xl bg-white" 
                value={formData.sessionId} 
                onChange={e => setFormData({...formData, sessionId: e.target.value})}
                disabled={!formData.eventId}
              >
                <option value="">-- Trống / Chưa xếp --</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.title} ({format(new Date(s.startTime), 'HH:mm')})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Author IDs & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author IDs (phẩy)</label>
              <input 
                className="w-full p-2.5 border rounded-xl"
                value={formData.authorIds}
                onChange={e => setFormData({...formData, authorIds: e.target.value})}
                placeholder="u1, u2..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Từ khóa (phẩy)</label>
              <input 
                className="w-full p-2.5 border rounded-xl"
                value={formData.keywords}
                onChange={e => setFormData({...formData, keywords: e.target.value})}
              />
            </div>
          </div>

          {/* Abstract */}
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tóm tắt</label>
             <textarea 
                className="w-full p-2.5 border rounded-xl h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.abstract}
                onChange={e => setFormData({...formData, abstract: e.target.value})}
             />
          </div>

          {/* File Upload Logic */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Tệp đính kèm (PDF)</label>
             
             <div className="flex items-center gap-4">
                <div className="flex-1">
                  {newFile ? (
                    <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                       <CheckCircle2 size={16}/> File mới: {newFile.name}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                       <FileText size={16}/> File hiện tại: 
                       <a href={`${API_BASE_URL}/static/${paper.fileUrl}`} target="_blank" className="text-blue-600 hover:underline truncate max-w-[200px] block ml-1">
                          {paper.fileUrl}
                       </a>
                    </div>
                  )}
                </div>

                <label className="cursor-pointer px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center gap-2">
                   <Upload size={16}/>
                   {newFile ? "Chọn lại" : "Tải file khác"}
                   <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                </label>
             </div>
             {newFile && <p className="text-xs text-green-600 mt-2 ml-6">File này sẽ thay thế file cũ sau khi bấm Lưu.</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
             <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Hủy</button>
             <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
               {isLoading ? <Loader2 className="animate-spin"/> : <Save size={20}/>} Lưu thay đổi
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ============================================================================
// 👇 MAIN COMPONENT
// ============================================================================

export default function AdminPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  
  // State Modal Edit
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  // State Modal Add
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventSessions, setEventSessions] = useState<SessionOption[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUserId = localStorage.getItem('currentUserId') || 'u003';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all');

  const [newPaper, setNewPaper] = useState({
    title: '', abstract: '', keywords: '', fileUrl: '',
    authorIds: [currentUserId], sessionId: '', eventId: '', status: 'pending' as const
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersData, eventsData] = await Promise.all([
        client.request(GET_PAPERS, { page: 1, limit: 100 }),
        client.request(GET_EVENTS, { page: 1, limit: 100 })
      ]);
      setPapers(papersData.papers.papers);
      setEvents(eventsData.events.events);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  // --- ADD LOGIC ---
  const handleEventChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEventId = e.target.value;
    setNewPaper(prev => ({ ...prev, eventId: selectedEventId, sessionId: '' }));
    setEventSessions([]); 
    if (!selectedEventId) return;

    setLoadingSessions(true);
    try {
      const data = await client.request(GET_EVENT_SESSIONS, { eventId: selectedEventId });
      setEventSessions(data.sessions?.sessions || []);
    } catch (err) { toast.error("Lỗi tải phiên họp"); } 
    finally { setLoadingSessions(false); }
  };

  const uploadFileToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Lỗi upload");
    return (await res.json()).filename;
  };

  const handleAddPaper = async () => {
    if (!newPaper.title || !newPaper.abstract || !newPaper.eventId || !selectedFile) return toast.error("Thiếu thông tin!");
    setIsSubmitting(true);
    try {
      const filename = await uploadFileToBackend(selectedFile);
      await client.request(CREATE_PAPER, { 
        input: { ...newPaper, fileUrl: filename, keywords: newPaper.keywords.split(',').filter(Boolean) } 
      });
      toast.success('Thêm thành công!');
      setShowAddModal(false);
      fetchData();
    } catch (e) { toast.error("Thất bại"); } 
    finally { setIsSubmitting(false); }
  };

  // --- QUICK ACTIONS ---
  const handleQuickApprove = async (id: string) => {
    await client.request(UPDATE_PAPER, { id, input: { status: 'approved' } });
    toast.success("Đã duyệt!");
    fetchData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa "${title}"?`)) return;
    await client.request(DELETE_PAPER, { id });
    toast.success("Đã xóa");
    setPapers(prev => prev.filter(p => p.id !== id));
  };

  // --- RENDER ---
  const filtered = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status: Paper['status']) => {
    switch (status) {
      case 'approved': return { gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle2, label: 'Đã duyệt' };
      case 'pending': return { gradient: 'from-orange-500 to-yellow-600', icon: Clock, label: 'Chờ duyệt' };
      case 'rejected': return { gradient: 'from-red-500 to-rose-600', icon: XCircle, label: 'Từ chối' };
      case 'revision': return { gradient: 'from-purple-500 to-pink-600', icon: FileText, label: 'Yêu cầu sửa' };
      default: return { gradient: 'from-gray-500 to-slate-600', icon: FileText, label: 'Không rõ' };
    }
  };

  if (loading) return <div className="flex justify-center h-96 items-center"><Loader2 className="animate-spin text-indigo-600"/></div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-900">Quản lý bài báo</h1>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg">
          <Plus size={20}/> Thêm bài báo
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col lg:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="w-full pl-12 p-3 border rounded-xl outline-none focus:border-indigo-500" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected', 'revision'].map((s: any) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl font-medium capitalize transition ${filterStatus === s ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-600'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((paper) => {
          const config = getStatusConfig(paper.status);
          const StatusIcon = config.icon;

          return (
            <div key={paper.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
              {/* Header Card */}
              <div className={`p-6 bg-gradient-to-r ${config.gradient} text-white`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="opacity-90 w-8 h-8"/>
                    <div>
                      <div className="font-bold text-lg">{config.label}</div>
                      <div className="text-xs opacity-80">{format(new Date(paper.submissionDate), 'dd/MM/yyyy')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {paper.status === 'pending' && (
                      <button onClick={() => handleQuickApprove(paper.id)} className="p-2 bg-white/20 rounded-lg hover:bg-green-400/50 backdrop-blur-sm transition" title="Duyệt nhanh"><CheckCircle2 size={16}/></button>
                    )}
                    <button onClick={() => setEditingPaper(paper)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 backdrop-blur-sm transition" title="Sửa"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(paper.id, paper.title)} className="p-2 bg-white/20 rounded-lg hover:bg-red-500/50 backdrop-blur-sm transition" title="Xóa"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                 <h3 className="font-bold text-gray-800 line-clamp-2 text-lg" title={paper.title}>{paper.title}</h3>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={14} className="text-indigo-500"/>
                    <span className="truncate font-medium">{paper.authorIds.join(', ')}</span>
                 </div>
                 {paper.event && <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded w-fit">Event: {paper.event.title}</div>}
                 
                 <div className="pt-4 border-t border-gray-100">
                    <a href={`${API_BASE_URL}/static/${paper.fileUrl}`} target="_blank" className="block w-full py-3 bg-indigo-50 text-indigo-600 text-center rounded-xl font-bold hover:bg-indigo-100 transition">
                       Xem PDF
                    </a>
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 👇 MODAL SỬA BÀI BÁO */}
      {editingPaper && (
        <EditPaperModal 
          paper={editingPaper}
          events={events}
          onClose={() => setEditingPaper(null)}
          onSave={fetchData}
        />
      )}

      {/* MODAL THÊM MỚI (Giữ nguyên logic đơn giản để code gọn, bạn có thể tái sử dụng component Modal nếu muốn) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                 <h2 className="text-xl font-bold flex items-center gap-2"><Upload className="text-indigo-600"/> Thêm bài báo mới</h2>
                 <button onClick={() => setShowAddModal(false)}><XIcon/></button>
              </div>
              {/* ... (Phần nội dung Form Thêm Mới giống bài trước, lược bớt để tập trung vào phần Edit) ... */}
              <div className="space-y-4">
                  {/* Event */}
                  <div>
                    <label className="font-bold text-sm">Event</label>
                    <select className="w-full p-3 border rounded-xl" onChange={handleEventChange}>
                       <option value="">-- Chọn --</option>
                       {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                  </div>
                  {/* Sessions */}
                  <div>
                     <label className="font-bold text-sm">Session {loadingSessions && "..."}</label>
                     <select className="w-full p-3 border rounded-xl" onChange={e => setNewPaper({...newPaper, sessionId: e.target.value})} disabled={!newPaper.eventId}>
                        <option value="">-- Trống --</option>
                        {eventSessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                     </select>
                  </div>
                  <input className="w-full p-3 border rounded-xl" placeholder="Tiêu đề" onChange={e => setNewPaper({...newPaper, title: e.target.value})}/>
                  <input className="w-full p-3 border rounded-xl" placeholder="Author IDs" value={newPaper.authorIds} onChange={e => setNewPaper({...newPaper, authorIds: [e.target.value]})}/>
                  <textarea className="w-full p-3 border rounded-xl h-24" placeholder="Tóm tắt" onChange={e => setNewPaper({...newPaper, abstract: e.target.value})}/>
                  <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                  
                  <button onClick={handleAddPaper} disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl">
                    {isSubmitting ? "Đang xử lý..." : "Nộp bài"}
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}