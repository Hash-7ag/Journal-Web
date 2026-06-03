import React from 'react';
import { FiBook, FiX } from 'react-icons/fi';

const GRADE_LIMITS = { collegium1: 10, collegium2: 10, coursework: 20, attendence: 10, exam: 50 };
const GRADE_LABELS = { collegium1: 'Kollegium 1', collegium2: 'Kollegium 2', coursework: 'Kurswork', exam: 'İmtahan' };

function GradeEditModal({ gradeEdit, gradeEditValue, onChange, onSave, onClose, submitting, error }) {
   if (!gradeEdit) return null;
   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                        <FiBook size={15} />
                     </div>
                     <div>
                        <h3 className="text-base font-bold">Qiyməti Dəyiş</h3>
                        <p className="text-xs opacity-40">{GRADE_LABELS[gradeEdit.type]} · maks {GRADE_LIMITS[gradeEdit.type]}</p>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                     <FiX size={15} />
                  </button>
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-50 ml-1">Yeni qiymət (0 – {GRADE_LIMITS[gradeEdit.type]})</label>
                  <input
                     type="number" min={0} max={GRADE_LIMITS[gradeEdit.type]}
                     value={gradeEditValue} onChange={e => onChange(e.target.value)}
                     className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                     placeholder={`0 - ${GRADE_LIMITS[gradeEdit.type]}`} autoFocus
                  />
               </div>
               {error && <span className="text-red-400 text-xs text-center">{error}</span>}
               <div className="flex gap-3">
                  <button onClick={onSave} disabled={submitting}
                     className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60">
                     {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Yadda saxla'}
                  </button>
                  <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                     Ləğv et
                  </button>
               </div>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default GradeEditModal;