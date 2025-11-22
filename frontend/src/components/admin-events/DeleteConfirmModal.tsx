import { AlertCircle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  eventTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  eventTitle,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          {/* Icon cảnh báo */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
          <p className="text-gray-500 mb-8">
            Bạn có chắc chắn muốn xóa sự kiện <br />
            <span className="font-bold text-gray-800">"{eventTitle}"</span> không?
            <br />
            <span className="text-red-500 text-sm mt-2 block">Hành động này không thể hoàn tác!</span>
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg hover:shadow-red-500/30 transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Xóa ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}