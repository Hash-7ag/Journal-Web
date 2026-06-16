import React from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

// Универсальная карточка урока (тема + сводка посещаемости).
// Используется в wizard (шаг 4, превью) и в таблице (клик по иконке).
function LessonCard({ title, type, date, hour, total, present, absent, onEdit }) {
  const typeLabel = type === 'P' ? 'Praktiki' : 'Nəzəri';

  return (
    <div className="rounded-2xl border border-base-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-base truncate">{title}</h4>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-lg bg-white/20 font-semibold">{typeLabel}</span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-xl bg-base-200/50">
            <span className="text-xs opacity-40">Cəmi</span>
            <span className="text-lg font-bold">{total}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <span className="text-xs opacity-40">Gəldi</span>
            <span className="text-lg font-bold text-emerald-500">{present}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
            <span className="text-xs opacity-40">Gəlmədi</span>
            <span className="text-lg font-bold text-red-500">{absent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonCard;
