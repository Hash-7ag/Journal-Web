import React, { useState } from 'react';
import { FiX, FiLayers } from 'react-icons/fi';
import SemestrPicker from './SemestrPicker';

function ChangeSemestrModal({ group, onSave, onClose, submitting, error }) {
   const [semestr, setSemestr] = useState(group?.semestr ?? 1);

   if (!group) return null;

   const changed = semestr !== group.semestr;

   return (
      <div className="modal modal-open z-[60]" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />
            <div className="p-6 flex flex-col gap-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                        <FiLayers size={15} />
                     </div>
                     <div>
                        <h3 className="text-base font-bold">Semestri dəyiş</h3>
                        <p className="text-xs opacity-40">{group.profession}</p>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                     <FiX size={15} />
                  </button>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium opacity-50 ml-1">Semestr seçin</label>
                  <SemestrPicker value={semestr} onChange={setSemestr} />
               </div>

               {error && <span className="text-red-400 text-xs text-center">{error}</span>}

               <div className="flex gap-3">
                  <button onClick={() => onSave(semestr)} disabled={submitting || !changed}
                     className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-40">
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

export default ChangeSemestrModal;