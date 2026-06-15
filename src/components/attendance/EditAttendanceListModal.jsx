import React from 'react';
import { FiX, FiEdit2, FiUsers } from 'react-icons/fi';

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

function EditAttendanceListModal({
  availableMonths,
  selectedMonth,
  onSelectMonth,
  attendanceData,
  attendanceLoading,
  onEditDay,
  onClose,
}) {
  const sortedDays = [...attendanceData].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Davamiyyəti dəyiş</h3>
              <p className="text-xs opacity-40 mt-0.5">Düzəliş etmək üçün günü seçin</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Months */}
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

          {/* Day cards */}
          {attendanceLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
            </div>
          ) : sortedDays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-30">
              <FiUsers size={28} />
              <span className="text-sm">Bu ay üçün davamiyyət yoxdur</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedDays.map((doc, index) => {
                const d = new Date(doc.date);
                const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                const total = doc.students?.length ?? 0;
                const present = doc.students?.filter((s) => s.attendence === true).length ?? 0;
                const absent = total - present;
                const colors = [
                  'from-[#8B5CF6] to-[#3B82F6]',
                  'from-[#3B82F6] to-[#60A5FA]',
                  'from-[#8B5CF6] to-[#A78BFA]',
                  'from-[#6366F1] to-[#8B5CF6]',
                ];
                return (
                  <div
                    key={doc._id}
                    className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex flex-col items-center justify-center text-white shadow-md shrink-0`}
                    >
                      <span className="font-bold text-base leading-none">{String(d.getDate()).padStart(2, '0')}</span>
                      <span className="text-[10px] opacity-80 mt-0.5">{AZ_MONTHS[d.getMonth()].slice(0, 3)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{dateStr}</div>
                      <div className="text-xs opacity-50 mt-0.5">
                        Ümumi: {total} · İştirak: <span className="text-emerald-500 font-semibold">{present} edib</span>{' '}
                        / <span className="text-red-400 font-semibold">{absent} etməyib</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditDay(doc)}
                      className="w-9 h-9 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                    >
                      <FiEdit2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default EditAttendanceListModal;
