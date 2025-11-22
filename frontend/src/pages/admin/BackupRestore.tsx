import { useState, useEffect } from 'react';
import { 
  Database, Download, RefreshCw, Upload, Trash2, 
  RotateCcw, ShieldCheck, Clock, FileArchive, 
  AlertTriangle, CheckCircle2, Loader2, Server
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// URL API Backend (Chắc chắn port 8000 đang chạy)
const API_BASE_URL = "http://localhost:8000";

interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
  type: 'auto' | 'manual';
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- 1. FETCH DATA (GET) ---
  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backups`);
      if (!res.ok) throw new Error("Failed to fetch backups");
      
      const data = await res.json();
      setBackups(data);
    } catch (error) {
      console.error("Lỗi tải backups:", error);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CREATE BACKUP (POST) ---
  const handleCreateBackup = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backups/create`, { 
        method: 'POST' 
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create backup");
      }
      
      toast.success("Đã tạo bản sao lưu mới thành công!");
      fetchBackups(); // Refresh danh sách
    } catch (error: any) {
      toast.error(`Sao lưu thất bại: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // --- 3. RESTORE BACKUP (POST) ---
  const handleRestore = async (filename: string) => {
    if (!confirm(`⚠️ CẢNH BÁO NGUY HIỂM:\n\nHành động này sẽ XÓA TOÀN BỘ dữ liệu hiện tại và thay thế bằng bản sao lưu "${filename}".\n\nBạn có chắc chắn muốn tiếp tục không?`)) return;

    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backups/restore/${filename}`, { 
        method: 'POST' 
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to restore");
      }

      toast.success("Phục hồi dữ liệu thành công! Trang sẽ tải lại sau 2s.");
      
      // Reload trang để cập nhật dữ liệu mới từ DB
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      toast.error(`Phục hồi thất bại: ${error.message}`);
      setProcessing(false);
    }
  };

  // --- 4. DELETE BACKUP (DELETE) ---
  const handleDelete = async (filename: string) => {
    if (!confirm(`Xóa vĩnh viễn bản sao lưu "${filename}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/backups/${filename}`, { 
        method: 'DELETE' 
      });

      if (!res.ok) throw new Error("Failed to delete");

      setBackups(prev => prev.filter(b => b.filename !== filename));
      toast.success("Đã xóa bản sao lưu.");
    } catch (error) {
      toast.error("Xóa thất bại!");
    }
  };

  // --- 5. UPLOAD BACKUP (POST FormData) ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Backend MongoDB của chúng ta dùng file .json
      if (!file.name.endsWith('.json')) {
        return toast.error("Chỉ chấp nhận file .json (MongoDB Backup)");
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/api/backups/upload`, { 
          method: 'POST', 
          body: formData 
        });

        if (!res.ok) throw new Error("Upload failed");

        toast.success("Tải lên bản sao lưu thành công!");
        fetchBackups();
      } catch (error) {
        toast.error("Tải lên thất bại!");
      } finally {
        setUploading(false);
        // Reset input để có thể chọn lại cùng file nếu cần
        e.target.value = ''; 
      }
    }
  };

  // Utility: Format bytes to MB/GB
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
            <Database className="text-blue-600" size={36} />
            Sao lưu & Phục hồi
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Quản lý các bản sao lưu cơ sở dữ liệu hệ thống an toàn.
          </p>
        </div>
        
        <div className="flex gap-3">
           {/* Nút Upload */}
           <label className={`btn bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {uploading ? 'Đang tải...' : 'Tải lên File JSON'}
              <input type="file" className="hidden" onChange={handleUpload} accept=".json" />
           </label>

           {/* Nút Tạo Backup Mới */}
           <button 
             onClick={handleCreateBackup}
             disabled={processing}
             className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-200 gap-2"
           >
             {processing ? <Loader2 className="animate-spin" size={20} /> : <PlusIcon />}
             Tạo bản sao lưu mới
           </button>
        </div>
      </div>

      {/* WARNING BANNER KHI ĐANG XỬ LÝ */}
      {processing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 text-yellow-800 animate-pulse">
           <Loader2 className="animate-spin" />
           <span className="font-medium">Hệ thống đang xử lý dữ liệu (Sao lưu/Phục hồi). Vui lòng không tắt trình duyệt...</span>
        </div>
      )}

      {/* BACKUP LIST */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Danh sách bản sao lưu ({backups.length})</h3>
          <button onClick={fetchBackups} className="text-gray-400 hover:text-blue-600 transition p-2 rounded-full hover:bg-blue-50" title="Làm mới">
             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
           <div className="p-10 flex justify-center text-blue-600"><Loader2 className="animate-spin w-8 h-8"/></div>
        ) : backups.length === 0 ? (
           <div className="p-12 text-center flex flex-col items-center gap-3 text-gray-500">
             <FileArchive size={48} className="text-gray-300"/>
             <p>Chưa có bản sao lưu nào.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4 pl-6">Tên File</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Kích thước</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4 text-right pr-6">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-gray-50/50 transition group">
                    <td className="p-4 pl-6 font-medium text-gray-700 flex items-center gap-3">
                       <FileArchive className="text-blue-500 opacity-50 group-hover:opacity-100 transition" size={20} />
                       {backup.filename}
                    </td>
                    <td className="p-4">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                         backup.type === 'auto' 
                           ? 'bg-purple-50 text-purple-700 border-purple-100' 
                           : 'bg-cyan-50 text-cyan-700 border-cyan-100'
                       }`}>
                         {backup.type === 'auto' ? 'Tự động' : 'Thủ công'}
                       </span>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{formatSize(backup.size)}</td>
                    <td className="p-4 text-gray-500 text-sm">
                       {format(new Date(backup.createdAt), 'HH:mm - dd/MM/yyyy')}
                    </td>
                    <td className="p-4 text-right pr-6">
                       <div className="flex items-center justify-end gap-2">
                          {/* Download */}
                          <a 
                             href={`${API_BASE_URL}/backups/download/${backup.filename}`} 
                             className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                             title="Tải xuống máy"
                             target="_blank"
                             rel="noreferrer"
                          >
                             <Download size={18} />
                          </a>
                          
                          {/* Restore */}
                          <button 
                             onClick={() => handleRestore(backup.filename)}
                             disabled={processing}
                             className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                             title="Phục hồi dữ liệu từ bản này"
                          >
                             <RotateCcw size={18} />
                          </button>
                          
                          {/* Delete */}
                          <button 
                             onClick={() => handleDelete(backup.filename)}
                             disabled={processing}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                             title="Xóa bản sao lưu"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* INFO BOX */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
          <AlertTriangle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
             <p className="font-bold mb-1">Lưu ý quan trọng:</p>
             <ul className="list-disc list-inside space-y-1 text-blue-700/80">
                <li>Quá trình <strong>Phục hồi (Restore)</strong> sẽ <strong>xóa toàn bộ dữ liệu hiện tại</strong> và thay thế bằng dữ liệu trong file backup. Hãy chắc chắn rằng bạn đã sao lưu dữ liệu mới nhất trước khi thực hiện.</li>
                <li>File Backup có định dạng <code>.json</code> và chứa toàn bộ dữ liệu của MongoDB.</li>
                <li>Hệ thống sẽ tự động reload lại trang sau khi phục hồi thành công.</li>
             </ul>
          </div>
      </div>
    </div>
  );
}

// Icon phụ
function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  )
}