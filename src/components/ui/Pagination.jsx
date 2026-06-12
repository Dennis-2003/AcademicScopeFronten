import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="w-9 h-9 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">1</button>
          {start > 2 && <span className="w-9 h-9 flex items-center justify-center text-slate-300">...</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
            p === page
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-slate-300">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="w-9 h-9 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function usePagination(data, pageSize = 25) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil((data?.length || 0) / pageSize);
  const paginatedData = (data || []).slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [data]);

  return { page, totalPages, setPage, paginatedData };
}
