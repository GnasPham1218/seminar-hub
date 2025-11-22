import { useState, useEffect } from "react";
import {
  Database,
  Download,
  RefreshCw,
  Upload,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Clock,
  FileArchive,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Server,
  Plus as PlusIcon,
  CalendarClock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ConfirmModal from "../../components/common/ConfirmModal";
import ScheduleBackupModal from "../../components/backup-restore/ScheduleBackupModal";

const API_BASE_URL = "http://localhost:8000";

interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
  type: "auto" | "manual";
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "restore" | "delete";
    filename: string;
  }>({
    isOpen: false,
    type: "restore",
    filename: "",
  });

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

  const handleCreateBackup = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backups/create`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create backup");
      toast.success("Đã tạo bản sao lưu mới thành công!");
      fetchBackups();
    } catch (error: any) {
      toast.error(`Sao lưu thất bại: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const openRestoreConfirm = (filename: string) => {
    setConfirmModal({ isOpen: true, type: "restore", filename });
  };

  const openDeleteConfirm = (filename: string) => {
    setConfirmModal({ isOpen: true, type: "delete", filename });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleExecuteAction = async () => {
    const { type, filename } = confirmModal;
    if (!filename) return;

    setProcessing(true);
    try {
      if (type === "restore") {
        const res = await fetch(
          `${API_BASE_URL}/api/backups/restore/${filename}`,
          { method: "POST" }
        );
        if (!res.ok) throw new Error("Failed to restore");
        toast.success("Phục hồi thành công! Trang sẽ tải lại...");
        setTimeout(() => window.location.reload(), 2000);
      } else if (type === "delete") {
        const res = await fetch(`${API_BASE_URL}/api/backups/${filename}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        setBackups((prev) => prev.filter((b) => b.filename !== filename));
        toast.success("Đã xóa bản sao lưu.");
        closeConfirmModal();
      }
    } catch (error: any) {
      toast.error(`Thất bại: ${error.message}`);
    } finally {
      setProcessing(false);
      if (type === "delete") closeConfirmModal();
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".json"))
        return toast.error("Chỉ chấp nhận file .json");

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE_URL}/api/backups/upload`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        toast.success("Tải lên thành công!");
        fetchBackups();
      } catch (error) {
        toast.error("Tải lên thất bại!");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
            <Database className="text-blue-600" size={36} />
            Sao lưu & Phục hồi
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            Quản lý an toàn dữ liệu hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Nút Lên lịch: Style nhẹ nhàng, tinh tế */}
          <button
            onClick={() => setShowSchedule(true)}
            className="px-5 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <CalendarClock size={20} /> Cấu hình Lịch
          </button>

          {/* Nút Upload: Style nét đứt (dashed) để gợi ý kéo thả */}
          <label
            className={`px-5 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Upload size={20} />
            )}
            {uploading ? "Đang tải..." : "Tải lên JSON"}
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".json"
            />
          </label>

          {/* Nút Tạo Backup: Gradient nổi bật */}
          <button
            onClick={handleCreateBackup}
            disabled={processing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
          >
            {processing && !confirmModal.isOpen ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <PlusIcon size={20} strokeWidth={3} />
            )}
            Tạo bản sao lưu mới
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Server size={20} className="text-gray-400" /> Danh sách bản sao lưu
            ({backups.length})
          </h3>

          {/* Nút Refresh */}
          <button
            onClick={fetchBackups}
            className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 shadow-sm active:scale-95"
            title="Làm mới danh sách"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center text-blue-600">
            <Loader2 className="animate-spin w-10 h-10" />
          </div>
        ) : backups.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-400">
            <div className="p-4 bg-gray-50 rounded-full">
              <FileArchive size={48} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium">Chưa có bản sao lưu nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-5 pl-8">Tên File</th>
                  <th className="p-5">Loại</th>
                  <th className="p-5">Kích thước</th>
                  <th className="p-5">Ngày tạo</th>
                  <th className="p-5 text-right pr-8">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {backups.map((backup) => (
                  <tr
                    key={backup.filename}
                    className="hover:bg-blue-50/30 transition-colors duration-200 group"
                  >
                    <td className="p-5 pl-8">
                      <div className="font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <FileArchive size={20} />
                        </div>
                        {backup.filename}
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wide ${
                          backup.type === "auto"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-cyan-50 text-cyan-700 border-cyan-100"
                        }`}
                      >
                        {backup.type === "auto" ? "Tự động" : "Thủ công"}
                      </span>
                    </td>
                    <td className="p-5 text-gray-600 font-mono text-sm font-medium">
                      {formatSize(backup.size)}
                    </td>
                    <td className="p-5 text-gray-600 text-sm font-medium">
                      {format(new Date(backup.createdAt), "HH:mm - dd/MM/yyyy")}
                    </td>
                    <td className="p-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        {/* Action Buttons: Mỗi nút một màu riêng biệt */}
                        <a
                          href={`${API_BASE_URL}/backups/download/${backup.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:scale-105 transition-all duration-200"
                          title="Tải xuống"
                        >
                          <Download size={18} strokeWidth={2.5} />
                        </a>
                        <button
                          onClick={() => openRestoreConfirm(backup.filename)}
                          className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 hover:scale-105 transition-all duration-200"
                          title="Phục hồi"
                        >
                          <RotateCcw size={18} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(backup.filename)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-105 transition-all duration-200"
                          title="Xóa"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
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

      {/* MODAL CONFIRM */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleExecuteAction}
        isLoading={processing}
        title={
          confirmModal.type === "restore"
            ? "Xác nhận Phục hồi Dữ liệu"
            : "Xác nhận Xóa bản sao lưu"
        }
        message={
          confirmModal.type === "restore" ? (
            <span>
              Bạn đang yêu cầu phục hồi hệ thống về trạng thái của bản sao lưu{" "}
              <b>{confirmModal.filename}</b>.<br />
              <br />
              <span className="text-red-600 font-bold">
                ⚠️ CẢNH BÁO: Toàn bộ dữ liệu hiện tại sẽ bị thay thế hoàn toàn.
              </span>{" "}
              Hành động này không thể hoàn tác.
            </span>
          ) : (
            <span>
              Bạn có chắc chắn muốn xóa vĩnh viễn bản sao lưu{" "}
              <b>{confirmModal.filename}</b> không? <br />
              Hành động này không thể khôi phục.
            </span>
          )
        }
        type={confirmModal.type === "restore" ? "warning" : "danger"}
        confirmText={
          confirmModal.type === "restore" ? "Đồng ý phục hồi" : "Xóa vĩnh viễn"
        }
      />

      {/* MODAL SCHEDULE */}
      <ScheduleBackupModal
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
      />
    </div>
  );
}
