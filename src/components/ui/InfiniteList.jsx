import React, { useRef, useEffect, useCallback } from 'react';

function InfiniteList({ children, loadingMore, hasMore, onLoadMore }) {
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
      <div ref={containerRef} className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
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
   );
}

export default InfiniteList;