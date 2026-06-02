import React from 'react';
import { FiX, FiUser, FiPhone, FiMail } from 'react-icons/fi';

function StudentInfoModal({ student, onClose }) {
   if (!student) return null;
   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                        {student.name?.charAt(0)}{student.surname?.charAt(0)}
                     </div>
                     <div>
                        <div className="font-bold text-base">{student.name} {student.surname}</div>
                        <div className="text-xs opacity-40">{student.fatherName}</div>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0">
                     <FiX size={15} />
                  </button>
               </div>
               <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiUser size={11} /> Ad Soyad Ata adı</span>
                     <span className="text-sm font-semibold">{student.name} {student.surname} {student.fatherName}</span>
                  </div>
                  <div className="w-full h-px bg-base-200" />
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiPhone size={11} /> Telefon</span>
                     <span className="text-sm font-semibold">{student.phoneNumber || '—'}</span>
                  </div>
                  <div className="w-full h-px bg-base-200" />
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiMail size={11} /> Email</span>
                     <span className="text-sm font-semibold">{student.email || '—'}</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default StudentInfoModal;