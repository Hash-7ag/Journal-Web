import React from 'react';

function TabBtn({ active, onClick, icon, label, count }) {
   return (
      <button
         onClick={onClick}
         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${active
            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
            : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
            }`}
      >
         {icon}{label}
         <span className={`text-xs px-1.5 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-base-300'}`}>{count}</span>
      </button>
   );
}

export default TabBtn;