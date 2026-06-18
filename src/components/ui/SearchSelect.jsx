import React, { useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

// Серч с иконкой-кружком + спиннером + бесконечным скроллом.
// search/onSearch — строка поиска; loading — идёт ли запрос; children — список элементов;
// loadingMore/hasMore/onLoadMore — подгрузка при скролле вниз.
function SearchSelect({
  search,
  onSearch,
  loading,
  placeholder = 'Axtar...',
  children,
  loadingMore,
  hasMore,
  onLoadMore,
  emptyText = 'Heç nə tapılmadı',
  isEmpty,
}) {
  const listRef = useRef(null);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) onLoadMore?.();
  }, [loadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="flex flex-col gap-2">
      {/* Поле поиска */}
      <div className="relative flex items-center">
        <div className="absolute left-2 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-sm z-10">
          <FiSearch size={15} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-11 py-3 rounded-2xl border-2 border-base-content/15 bg-base-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[#8B5CF6] focus:bg-base-100 hover:border-base-content/30 focus:shadow-[0_4px_16px_-4px_rgba(139,92,246,0.25)] transition-all duration-200 text-sm font-medium placeholder:font-normal placeholder:opacity-40"
        />
        <div className="absolute right-3 flex items-center z-10">
          {loading ? (
            <span className="loading loading-spinner loading-sm text-[#8B5CF6]" />
          ) : search ? (
            <button
              onClick={() => onSearch('')}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-base-200 text-base-content/50 hover:text-base-content hover:bg-base-300 transition-all duration-200"
            >
              <FiX size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Список с бесконечным скроллом */}
      <div ref={listRef} className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {isEmpty ? (
          <div className="text-center opacity-30 py-8 text-sm">{emptyText}</div>
        ) : (
          <>
            {children}
            {loadingMore && (
              <div className="flex justify-center py-3">
                <span className="loading loading-spinner loading-sm text-[#8B5CF6]" />
              </div>
            )}
            {!hasMore && !loadingMore && <div className="text-center text-xs opacity-20 py-2">Hamısı yükləndi</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchSelect;
