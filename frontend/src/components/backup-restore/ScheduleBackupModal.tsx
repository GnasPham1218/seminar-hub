import { useState, useEffect } from "react";
import { X, Save, Clock, CalendarClock, Loader2, Power } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8000";

interface ScheduleBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleBackupModal({ isOpen, onClose }: ScheduleBackupModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State form
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("00:00");
  const [frequency, setFrequency] = useState("daily");

  // Load config khi mở modal
  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backups/schedule`);
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled);
        setTime(data.time || "00:00");
        setFrequency(data.frequency || "daily");
      }
    } catch (err) {
      toast.error("Không thể tải cấu hình lịch");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/backups/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, time, frequency }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success(enabled ? "Đã bật lịch sao lưu tự động" : "Đã tắt sao lưu tự động");
      onClose();
    } catch (err) {
      toast.error("Lưu cấu hình thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
          <h3 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
            <CalendarClock className="text-indigo-600" size={24}/> Cấu hình Lịch Sao Lưu
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition text-gray-500">
            <X size={20}/>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600"/></div>
          ) : (
            <>
              {/* Toggle Switch */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${enabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                    <Power size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Tự động sao lưu</p>
                    <p className="text-xs text-gray-500">{enabled ? "Đang BẬT" : "Đang TẮT"}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Time & Freq Settings */}
              <div className={`space-y-4 transition-all ${!enabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16}/> Thời gian thực hiện (Hàng ngày)
                  </label>
                  <input 
                    type="time" 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-lg"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Hệ thống sẽ tự động tạo bản sao lưu vào thời điểm này mỗi ngày.</p>
                </div>
                
                {/* (Có thể mở rộng Frequency sau này) */}
                <div className="hidden">
                   <label className="block text-sm font-bold text-gray-700 mb-2">Tần suất</label>
                   <select 
                     className="w-full p-3 border border-gray-300 rounded-xl"
                     value={frequency}
                     onChange={(e) => setFrequency(e.target.value)}
                   >
                     <option value="daily">Hàng ngày</option>
                     <option value="weekly">Hàng tuần</option>
                   </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition">
            Đóng
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}