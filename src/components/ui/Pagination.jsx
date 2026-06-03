import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Pagination({ page, totalPages, onChange }) {
   if (totalPages <= 1) return null;
   return (
      <div className="flex items-center justify-center gap-2 mt-4">
         <button onClick={() => onChange(page - 1)} disabled={page === 1}
            className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200">
            <FiChevronLeft size={14} />
         </button>
         {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => onChange(p)}
               className={`w-8 h-8 rounded-xl text-sm font-semibold transition-all duration-200 ${p === page
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'border border-base-200 opacity-50 hover:opacity-100 hover:bg-base-200'}`}>
               {p}
            </button>
         ))}
         <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
            className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200">
            <FiChevronRight size={14} />
         </button>
      </div>
   );
}

export default Pagination;