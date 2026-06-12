import React, { useState } from 'react';
import { FiClock, FiChevronDown } from 'react-icons/fi';
import { toRoman } from '../../scripts/roman.js';

function SemestrSwitcher({ currentSemestr, shownSemestr, otherSemestrs, onSelect }) {
   const [showOld, setShowOld] = useState(false);

   const hasOld = otherSemestrs.length > 0;

   // Один семестр — просто квадрат с римской цифрой
   if (!hasOld) {
      return (
         <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shadow-md">
               {toRoman(currentSemestr)}
            </div>
            <span className="text-xs opacity-40">semestr</span>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-3">
         <div className="flex flex-wrap items-center gap-2">
            <button
               onClick={() => setShowOld(p => !p)}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${showOld
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md'
                  : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'}`}
            >
               <FiClock size={14} /> Köhnə semestrlər
               <FiChevronDown size={13} className={`transition-transform duration-200 ${showOld ? 'rotate-180' : ''}`} />
            </button>

            <button
               onClick={() => { setShowOld(false); onSelect(currentSemestr); }}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${shownSemestr === currentSemestr
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'}`}
            >
               Aktiv semestr · {toRoman(currentSemestr)}
            </button>
         </div>

         {showOld && (
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-base-200/40 border border-base-200">
               {[...otherSemestrs].sort((a, b) => a - b).map(s => (
                  <button
                     key={s}
                     onClick={() => onSelect(s)}
                     className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${shownSemestr === s
                        ? 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-md'
                        : 'bg-base-100 border border-base-200 opacity-60 hover:opacity-100 hover:bg-base-200'}`}
                  >
                     {toRoman(s)}
                  </button>
               ))}
            </div>
         )}
      </div>
   );
}

export default SemestrSwitcher;