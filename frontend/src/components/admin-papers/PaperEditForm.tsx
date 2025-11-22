import { useState } from "react";
import { Save, X, Loader2, FileText, User, Tag, Link as LinkIcon, Type } from "lucide-react";

interface PaperEditFormProps {
  paper: {
    id: string;
    title: string;
    abstract: string;
    authorIds: string[];
    keywords: string[];
    fileUrl: string;
  };
  onSave: (id: string, data: any) => Promise<void>;
  onCancel: () => void;
}

export default function PaperEditForm({ paper, onSave, onCancel }: PaperEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // State nội bộ của Form
  const [formData, setFormData] = useState({
    title: paper.title || "",
    abstract: paper.abstract || "",
    // Chuyển mảng thành chuỗi để hiển thị trên input
    authorIds: paper.authorIds?.join(", ") || "",
    keywords: paper.keywords?.join(", ") || "",
    fileUrl: paper.fileUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Chuyển đổi dữ liệu từ Form về đúng định dạng Backend cần
    const processedData = {
      title: formData.title,
      abstract: formData.abstract,
      fileUrl: formData.fileUrl,
      // Chuyển chuỗi "u1, u2" -> mảng ["u1", "u2"]
      authorIds: formData.authorIds.split(",").map((s) => s.trim()).filter(Boolean),
      keywords: formData.keywords.split(",").map((s) => s.trim()).filter(Boolean),
    };

    await onSave(paper.id, processedData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
      <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wide border-b border-indigo-200 pb-2 mb-4">
        Chỉnh sửa thông tin bài báo
      </h4>

      {/* 1. Tiêu đề */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1.5">
          <Type size={14} /> Tiêu đề
        </label>
        <input
          type="text"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Nhập tiêu đề bài báo..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2. Author IDs */}
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1.5">
            <User size={14} /> Author IDs (ngăn cách phẩy)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
            value={formData.authorIds}
            onChange={(e) => setFormData({ ...formData, authorIds: e.target.value })}
            placeholder="VD: u001, u002"
          />
        </div>

        {/* 3. Keywords */}
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1.5">
            <Tag size={14} /> Từ khóa (ngăn cách phẩy)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="VD: AI, BigData"
          />
        </div>
      </div>

      {/* 4. File URL */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1.5">
          <LinkIcon size={14} /> Đường dẫn File PDF
        </label>
        <input
          type="text"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm font-mono text-sm text-gray-600"
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {/* 5. Abstract */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1.5">
          <FileText size={14} /> Tóm tắt (Abstract)
        </label>
        <textarea
          rows={5}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm resize-none"
          value={formData.abstract}
          onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
          placeholder="Nội dung tóm tắt..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2 border-t border-indigo-100 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition flex justify-center items-center gap-2"
        >
          <X size={18} /> Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition flex justify-center items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}