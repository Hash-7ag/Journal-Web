import React from 'react';
import { FiUsers, FiBook, FiArrowRight } from 'react-icons/fi';

const groupColors = [
   'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
   'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
   'from-[#3B82F6] to-[#8B5CF6]', 'from-[#A78BFA] to-[#60A5FA]',
];

function GroupCard({ group, index, onClick, onEdit }) {
   const colorClass = groupColors[index % groupColors.length];
   return (
      <div
         onClick={onClick}
         className="group bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative"
      >
         <button
            onClick={e => { e.stopPropagation(); onEdit(e, group); }}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-base-200 flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-base-200 transition-all duration-200"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
               <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
         </button>
         <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
            {group.groupNumber}
         </div>
         <div className="text-sm font-semibold text-center leading-tight">{group.profession}</div>
         <div className="text-xs opacity-30 tracking-widest font-mono">#{group.groupShifr}</div>
         <div className="w-full h-px bg-base-200" />
         <div className="flex gap-4 w-full justify-center items-center">
            <div className="flex items-center gap-1 text-xs opacity-50"><FiUsers size={12} />{group.students?.length ?? 0}</div>
            <div className="flex items-center gap-1 text-xs opacity-50"><FiBook size={12} />{group.subjects?.length ?? 0}</div>
            <FiArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity duration-200" />
         </div>
      </div>
   );
}

export default GroupCard;