import React, { useState } from 'react';

function GradeCell({ label, value, max, color, editable, onEdit }) {
   const [hovered, setHovered] = useState(false);
   return (
      <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
         <span className="text-xs opacity-30">{label}</span>
         {value != null ? (
            <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
               <span className={`text-xs font-bold ${color}`}>{value}/{max}</span>
               {editable && hovered && (
                  <button onClick={onEdit} className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white border border-[#3B82F6] rounded-lg px-2 py-1 text-[11px] font-semibold whitespace-nowrap z-10 shadow-md">
                     Dəyiş
                  </button>
               )}
            </div>
         ) : (
            <span className="text-xs opacity-20">—/{max}</span>
         )}
      </div>
   );
}

export default GradeCell;