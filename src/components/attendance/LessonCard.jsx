import React from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

// Универсальная карточка урока (тема + сводка посещаемости).
// Используется в wizard (шаг 4, превью) и в таблице (клик по иконке).
function LessonCard({ title, type, date, hour, total, present, absent }) {
  const typeLabel = type === 'P' ? 'Praktiki' : 'Nəzəri';

  return (
    <div className="rounded-2xl border border-base-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-base">{title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-lg bg-white/20 font-semibold">{typeLabel}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs opacity-90">
          <span className="flex items-center gap-1">
            <FiCalendar size={11} />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={11} />
            {hour} saat
          </span>
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
