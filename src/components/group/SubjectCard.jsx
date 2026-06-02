import React from 'react';
import { FiBook, FiUser, FiTrash2 } from 'react-icons/fi';

function SubjectCard({ item, index, deletingId, onDelete, onClick }) {
   const s = item.subject ?? item;
   const sid = typeof s === 'object' ? s._id : s;
   const teacher = item.teacher ?? s.teacherId;

   return (
      <div
         className="group/card bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
         onClick={onClick}
      >
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
               <FiBook size={16} />
            </div>
            <span className="text-sm font-semibold leading-tight flex-1">{s.subject ?? s.name ?? '—'}</span>
            <button
               onClick={e => { e.stopPropagation(); onDelete(sid); }}
               disabled={deletingId === sid}
               className="opacity-0 group-hover/card:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 disabled:opacity-50"
            >
               {deletingId === sid ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 size={13} />}
            </button>
         </div>
         {teacher && (
            <>
               <div className="w-full h-px bg-base-200" />
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                     <FiUser size={11} />
                  </div>
                  <span className="text-xs opacity-60 truncate">{teacher.name} {teacher.surname}</span>
               </div>
            </>
         )}
      </div>
   );
}

export default SubjectCard;