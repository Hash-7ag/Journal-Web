import React, { useState } from 'react';
import { FiX, FiArrowUp, FiRotateCcw, FiTrendingUp } from 'react-icons/fi';
import { toRoman } from '../../scripts/roman.js';

function PromoteSemestrModal({ currentSemestr, onSave, onClose, submitting, error }) {
   const [target, setTarget] = useState(currentSemestr);
   const [animating, setAnimating] = useState(false);

   const atMax = target >= 6;
   const changed = target !== currentSemestr;

   const promote = () => {
      if (atMax || animating) return;
      setAnimating(true);
      setTimeout(() => {
         setTarget(t => t + 1);
         setAnimating(false);
      }, 350);
   };

   const reset = () => { if (!animating) setTarget(currentSemestr); };

   return (
      <div className="modal modal-open z-[60]" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-6">

               <style>{`
                  @keyframes sem-out {
                     0% { transform: translateY(0); opacity: 1; }
                     100% { transform: translateY(40px); opacity: 0; }
                  }
                  @keyframes sem-in {
                     0% { transform: translateY(-40px); opacity: 0; }
                     100% { transform: translateY(0); opacity: 1; }
                  }
                  .sem-out { animation: sem-out 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
                  .sem-in { animation: sem-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
               `}</style>

               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                        <FiTrendingUp size={15} />
                     </div>
                     <div>
                        <h3 className="text-base font-bold">Növbəti semestr</h3>
                        <p className="text-xs opacity-40">Semestri bir pillə artırın</p>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                     <FiX size={15} />
                  </button>
               </div>

               {/* Semestr display + promote */}
               <div className="flex items-center justify-center gap-5 py-4">
                  {/* Big roman numeral — two layers for fall/rise */}
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-lg overflow-hidden flex items-center justify-center">
                     {animating && (
                        <span className="absolute text-white font-bold text-4xl sem-out">
                           {toRoman(target)}
                        </span>
                     )}
                     <span
                        key={target}
                        className={`absolute text-white font-bold text-4xl ${animating ? 'sem-in' : ''}`}
                     >
                        {toRoman(animating ? target + 1 : target)}
                     </span>
                  </div>

                  {/* Promote button */}
                  <button
                     onClick={promote}
                     disabled={atMax || animating}
                     className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all duration-200 ${atMax
                        ? 'bg-base-300 opacity-40 cursor-not-allowed'
                        : 'bg-gradient-to-br from-emerald-400 to-emerald-500 hover:scale-110 hover:shadow-lg'}`}
                  >
                     <FiArrowUp size={22} />
                  </button>
               </div>

               {/* Info text */}
               <div className="text-center text-xs opacity-50">
                  {atMax
                     ? 'Maksimum semestrə çatdınız (VI)'
                     : changed
                        ? `${toRoman(currentSemestr)} → ${toRoman(target)} semestrə keçid`
                        : `Hazırkı semestr: ${toRoman(currentSemestr)}`}
               </div>

               {error && <span className="text-red-400 text-xs text-center">{error}</span>}

               {/* Actions */}
               <div className="flex gap-3">
                  <button onClick={() => onSave(target)} disabled={submitting || !changed}
                     className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-40">
                     {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Yadda saxla'}
                  </button>
                  {changed && (
                     <button onClick={reset} disabled={submitting}
                        className="px-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200 flex items-center gap-2">
                        <FiRotateCcw size={14} /> Sıfırla
                     </button>
                  )}
                  {!changed && (
                     <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                        Bağla
                     </button>
                  )}
               </div>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default PromoteSemestrModal;