import React from 'react';
import { FiUser, FiPlus } from 'react-icons/fi';

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
const colors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
];

function AttendanceTable({
  students,
  days,
  dayMap,
  availableMonths,
  selectedMonth,
  attendanceLoading,
  attError,
  attSuccess,
  getAttendenceForStudent,
  onSelectMonth,
  onOpenCalendar,
  actionLabel,
}) {
  return (
    <div className="flex flex-col gap-5">
      {availableMonths.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableMonths.map((m) => (
            <button
              key={`${m.month}-${m.year}`}
              onClick={() => onSelectMonth(m)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedMonth?.month === m.month && selectedMonth?.year === m.year
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
              }`}
            >
              {AZ_MONTHS[m.month - 1]} {m.year}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold opacity-60">
          {selectedMonth ? `${AZ_MONTHS[selectedMonth.month - 1]} ${selectedMonth.year}` : ''}
        </h2>
        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
        >
          <FiPlus size={15} /> <span className="hidden sm:inline">{actionLabel ?? 'Davamiyyət əlavə et'}</span>
        </button>
      </div>

      {attError && <span className="text-red-400 text-xs">{attError}</span>}
      {attSuccess && <span className="text-emerald-400 text-xs">{attSuccess}</span>}

      {!attendanceLoading && days.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-30">
          <FiUser size={28} />
          <span className="text-sm">Bu ay üçün davamiyyət yoxdur</span>
        </div>
      )}

      {attendanceLoading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
        </div>
      ) : days.length > 0 ? (
        <div
          className="overflow-x-auto rounded-2xl border border-base-200 shadow-sm w-full p-4"
          style={{ maxWidth: '100%' }}
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}
        >
          <table className="text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content' }}>
            <thead>
              <tr className="border-b border-base-200 bg-base-100">
                <th className="sticky left-0 top-0 z-20 bg-base-100 text-left px-4 py-3 font-semibold text-xs opacity-50 min-w-[180px] border-r border-base-200">
                  Şagird
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="py-3 text-center text-xs font-semibold opacity-50 w-10 min-w-[40px] bg-base-100 sticky top-0 z-[5]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const sid = student._id;
                const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                return (
                  <tr
                    key={sid}
                    className="border-b border-base-200 last:border-0 bg-base-100 hover:bg-base-200/30 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-base-100 px-4 py-2.5 border-r border-base-200">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}
                        >
                          {initials || <FiUser size={11} />}
                        </div>
                        <span className="font-medium text-xs whitespace-nowrap">
                          {student.name} {student.surname}
                        </span>
                      </div>
                    </td>
                    {days.map((day) => {
                      const att = getAttendenceForStudent(dayMap[day], sid);
                      return (
                        <td key={day} className="py-2.5 text-center w-10">
                          {att === null ? (
                            <span className="text-xs opacity-20">—</span>
                          ) : att === true ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-sm">
                              +
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm">
                              q
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default AttendanceTable;
