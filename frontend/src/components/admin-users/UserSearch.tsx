import { Search } from 'lucide-react';

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function UserSearch({ searchTerm, setSearchTerm }: UserSearchProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, đơn vị, số điện thoại..."
            className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}