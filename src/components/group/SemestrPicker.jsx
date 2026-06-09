import React from 'react';
import { toRoman } from '../../scripts/roman.js';

function SemestrPicker({ value, onChange, max = 6 }) {
   return (
      <div className="flex flex-wrap gap-2">
         {Array.from({ length: max }, (_, i) => i + 1).map(s => (
            <button
               key={s}
               type="button"
               onClick={() => onChange(s)}
               className={`w-11 h-11 rounded-xl font-bold text-sm transition-all duration-200 ${value === s
                  ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100 hover:bg-base-200'}`}
            >
               {toRoman(s)}
            </button>
         ))}
      </div>
   );
}

export default SemestrPicker;