import React from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiAward, FiAlertCircle } from 'react-icons/fi';
import GradeRow from './GradeRow';

function SubjectGradeModal({ item, grade, color, totalColor, onClose }) {
   if (!item) return null;

   const subject = item.subject;
   const teacher = item.teacher;
   const total = grade
      ? (grade.col1?.grade?.grade ?? 0) + (grade.col2?.grade?.grade ?? 0) +
      (grade.coursework?.grade?.grade ?? 0) + (grade.attendence?.grade?.grade ?? 0) +
      (grade.exam?.grade?.grade ?? 0)
      : null;
   const calcedTotal = grade && Object.values({
      col1: grade.col1?.grade?.grade,
      col2: grade.col2?.grade?.grade,
      cw: grade.coursework?.grade?.grade,
      att: grade.attendence?.grade?.grade,
      exam: grade.exam?.grade?.grade,
   }).some(v => v != null) ? total : null;

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">
            <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
            <div className="p-6 flex flex-col gap-5">

               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}>
                        {subject?.subject?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <div className="font-bold text-base">{subject?.subject}</div>
                        <div className="text-xs opacity-40">
                           {subject?.kredit} kredit · {subject?.totalHours} saat · {subject?.semestr}-ci semestr
                        </div>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0">
                     <FiX size={15} />
                  </button>
               </div>

               {teacher && (
                  <div className="bg-base-200/50 rounded-xl p-4 flex flex-col gap-3 border border-base-200">
                     <div className="text-xs font-semibold opacity-40 flex items-center gap-1"><FiUser size={11} /> Müəllim</div>
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                           {teacher.name?.charAt(0)}{teacher.surname?.charAt(0)}
                        </div>
                        <div className="font-semibold text-sm">{teacher.name} {teacher.surname}</div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        {teacher.phoneNumber && <div className="flex items-center gap-1.5 text-xs opacity-50"><FiPhone size={11} />{teacher.phoneNumber}</div>}
                        {teacher.email && <div className="flex items-center gap-1.5 text-xs opacity-50"><FiMail size={11} />{teacher.email}</div>}
                     </div>
                  </div>
               )}

               <div className="bg-base-200/50 rounded-xl p-4 border border-base-200">
                  <div className="text-xs font-semibold opacity-40 mb-3 flex items-center gap-1"><FiAward size={11} /> Qiymətlər</div>
                  <GradeRow label="Kollegium 1" value={grade?.col1?.grade?.grade} max={10} color="text-blue-400" />
                  <GradeRow label="Kollegium 2" value={grade?.col2?.grade?.grade} max={10} color="text-blue-400" />
                  <GradeRow label="Kurswork" value={grade?.coursework?.grade?.grade} max={20} color="text-violet-400" />
                  <GradeRow label="Davamiyyət" value={grade?.attendence?.grade?.grade} max={10} color={grade?.attendence?.limited ? 'text-red-400' : 'text-emerald-400'} />
                  <GradeRow label="İmtahan" value={grade?.exam?.grade?.grade} max={50} color="text-orange-400" />
               </div>

               {grade?.attendence?.limited && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border border-red-100 dark:border-red-900">
                     <FiAlertCircle size={14} /> Bu fəndən davamiyyət limiti aşılıb — buraxılmayıb
                  </div>
               )}

               <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold opacity-60">Yekun bal</span>
                  <div className="flex items-baseline gap-1">
                     <span className={`text-3xl font-bold ${totalColor(calcedTotal)}`}>{calcedTotal != null ? calcedTotal : '—'}</span>
                     <span className="text-sm opacity-30">/100</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default SubjectGradeModal;