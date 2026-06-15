import React from 'react';
import { FiArrowLeft, FiX } from 'react-icons/fi';

const AZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];

function AttendanceCalendarModal({ viewDate, onChangeViewDate, allBusyDates, onPickDay, onClose }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const mm = String(month + 1).padStart(2, '0');

  const busyDays = new Set(
    [...allBusyDates].filter((key) => key.endsWith(`-${mm}-${year}`)).map((key) => parseInt(key.split('-')[0], 10)),
  );

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleClick = (day) => {
    if (!day || busyDays.has(day)) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(year, month, day);
    picked.setHours(0, 0, 0, 0);
    if (picked > today) return;
    const dd = String(day).padStart(2, '0');
    const mm2 = String(month + 1).padStart(2, '0');
    onPickDay(`${dd}-${mm2}-${year}`, { month: month + 1, year });
  };

  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Tarix seçin</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => onChangeViewDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiArrowLeft size={14} />
            </button>
            <span className="text-sm font-semibold">
              {AZ_MONTHS[month]} {year}
            </span>
            <button
              onClick={() => onChangeViewDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiArrowLeft size={14} className="rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'].map((d) => (
              <div key={d} className="text-center text-xs opacity-30 font-semibold py-1">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const thisDay = day ? new Date(year, month, day) : null;
              const isFuture = thisDay && thisDay > today;
              const isBusy = day && busyDays.has(day);
              const isDisabled = !day || isBusy || isFuture;
              return (
                <button
                  key={i}
                  disabled={isDisabled}
                  onClick={() => handleClick(day)}
                  className={`aspect-square rounded-xl text-sm font-semibold transition-all duration-150 ${!day ? 'invisible' : ''} ${isBusy || isFuture ? 'opacity-25 cursor-not-allowed bg-base-200' : 'hover:bg-gradient-to-br hover:from-[#8B5CF6] hover:to-[#3B82F6] hover:text-white hover:shadow-md cursor-pointer'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="text-xs opacity-30 text-center">Boz rəngli günlər artıq mövcuddur</p>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default AttendanceCalendarModal;
