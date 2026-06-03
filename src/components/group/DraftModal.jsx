import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

function DraftModal({ draftData, onContinue, onDiscard, onClose }) {
   if (!draftData) return null;
   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-sm">
            <div className="flex flex-col items-center gap-2 text-center">
               <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 mb-1">
                  <FiAlertCircle size={20} />
               </div>
               <h3 className="text-base font-bold">Yarımçıq qrup var</h3>
               <p className="text-xs opacity-50">Əvvəl başladığınız qrup saxlanılıb. Davam etmək istəyirsiniz?</p>
            </div>
            <div className="bg-base-200/60 rounded-xl border border-base-200 p-4 flex flex-col gap-2">
               <div className="flex items-center justify-between">
                  <span className="text-xs opacity-40">İxtisas</span>
                  <span className="text-sm font-semibold">{draftData.profession || '—'}</span>
               </div>
               <div className="w-full h-px bg-base-200" />
               <div className="flex items-center justify-between">
                  <span className="text-xs opacity-40">Qrup №</span>
                  <span className="text-sm font-semibold">{draftData.groupNumber || '—'}</span>
               </div>
               <div className="w-full h-px bg-base-200" />
               <div className="flex items-center justify-between">
                  <span className="text-xs opacity-40">Şifrə</span>
                  <span className="text-sm font-semibold font-mono">{draftData.groupShifr || '—'}</span>
               </div>
            </div>
            <div className="flex gap-3">
               <button onClick={onContinue} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all duration-200">
                  Davam et
               </button>
               <button onClick={onDiscard} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                  Yenidən başla
               </button>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default DraftModal;