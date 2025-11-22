import React, { useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, X, Check, Loader2 } from "lucide-react";
import { client } from "../../lib/graphql";
import { CREATE_PAPER } from "../../lib/mutations";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/graphql", "") ||
  "http://localhost:8000";

// 👇 1. Cập nhật Interface để nhận danh sách sessions
interface PaperSubmissionFormProps {
  eventId: string;
  sessions: any[]; // Thêm prop này
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaperSubmissionForm({
  eventId,
  sessions, // Nhận prop
  onSuccess,
  onCancel,
}: PaperSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 👇 2. Thêm state cho sessionId
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Vui lòng chỉ chọn file PDF.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File quá lớn (Tối đa 10MB).");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !abstract.trim() || !selectedFile) {
      toast.error("Vui lòng điền đầy đủ thông tin và đính kèm file.");
      return;
    }

    setIsSubmitting(true);

    try {
      // --- BƯỚC 1: UPLOAD FILE ---
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Lỗi tải file.");
      const uploadData = await uploadRes.json();
      const savedFilename = uploadData.filename;

      // --- BƯỚC 2: TẠO PAPER ---
      const currentUserId = localStorage.getItem("currentUserId");

      await client.request(CREATE_PAPER, {
        input: {
          eventId: eventId,
          title: title,
          abstract: abstract,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k !== ""),
          fileUrl: savedFilename,
          authorIds: [currentUserId],
          status: "pending",

          // 👇 3. Gửi sessionId (Nếu rỗng thì gửi null)
          sessionId: selectedSessionId || null,
        },
      });

      toast.success("Nộp bài thành công! Vui lòng chờ duyệt.");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.errors?.[0]?.message || "Có lỗi xảy ra.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300 mb-8">
      <div className="bg-linear-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <FileText className="text-indigo-600" size={20} />
          Nộp Bài Tham Luận
        </h3>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* 👇 4. Thêm Dropdown chọn Session */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chọn phiên trình bày (Tùy chọn)
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">-- Chưa xác định phiên (Nộp chung) --</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} (
                {new Date(session.startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </option>
            ))}
          </select>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tiêu đề bài báo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Abstract Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tóm tắt (Abstract) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Keywords Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Từ khóa (Keywords)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tệp đính kèm (PDF) <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              selectedFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
              {selectedFile ? (
                <>
                  <Check className="text-green-500" size={24} />
                  <span className="font-semibold text-green-800">
                    {selectedFile.name}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="text-indigo-500" size={24} />
                  <span className="text-gray-600">
                    Chọn file PDF (Max 10MB)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Upload size={18} />
            )}
            {isSubmitting ? "Đang xử lý..." : "Nộp bài ngay"}
          </button>
        </div>
      </form>
    </div>
  );
}
