import React, { useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

function SelectModal({ title, icon, search, onSearch, searchPlaceholder, onClose, onConfirm, loading, error, selectedCount, confirmLabel, children, onLoadMore, hasMore, loadingMore }) {
   const containerRef = useRef(null);

   const handleScroll = useCallback(() => {
      const el = containerRef.current;
      if (!el || loadingMore || !hasMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
         onLoadMore?.();
      }
   }, [loadingMore, hasMore, onLoadMore]);

   useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
   }, [handleScroll]);

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                     {icon}
                  </div>
                  <div>
                     <h3 className="text-base font-bold">{title}</h3>
                     <p className="text-xs opacity-40">{selectedCount} seçilib</p>
                  </div>
               </div>
               <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                  <FiX size={15} />
               </button>
            </div>
            <div className="px-6 pb-3">
               <div className="relative">
                  <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                     type="text"
                     value={search}
                     onChange={e => onSearch(e.target.value)}
                     placeholder={searchPlaceholder}
                     className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
               </div>
            </div>
            <div ref={containerRef} className="px-6 flex flex-col gap-2 max-h-72 overflow-y-auto pb-2">
               {children}
               {loadingMore && (
                  <div className="flex justify-center py-3">
                     <span className="loading loading-spinner loading-sm" style={{ color: '#8B5CF6' }} />
                  </div>
               )}
               {!hasMore && !loadingMore && (
                  <div className="text-center text-xs opacity-20 py-2">Hamısı yükləndi</div>
               )}
            </div>
            {error && <div className="px-6 pt-2"><span className="text-red-400 text-xs">{error}</span></div>}
            <div className="px-6 py-5 flex gap-3 border-t border-base-200 mt-3">
               <button
                  onClick={onConfirm}
                  disabled={loading || selectedCount === 0}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-40"
               >
                  {loading ? <span className="loading loading-spinner loading-xs" /> : confirmLabel}
               </button>
               <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                  Ləğv et
               </button>
            </div>
         </div>
      </div>
   );
}

export default SelectModal;