import React from 'react';
import { FiX, FiSave } from 'react-icons/fi';

const colors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
];

function AttendanceModal({ date, students, attStudents, onToggle, onSave, onClose, saving, error }) {
  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Davamiyyət əlavə et</h3>
              <p className="text-xs opacity-40 mt-0.5">{date}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {students.map((student, index) => {
              const sid = student._id;
              const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
              const isPresent = attStudents[sid] ?? true;
              return (
                <div
                  key={sid}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-base-200 hover:bg-base-200/30 transition-all duration-200"
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {student.name} {student.surname}
                    </div>
                    {student.fatherName && <div className="text-xs opacity-40 truncate">{student.fatherName}</div>}
                  </div>
                  <button
                    onClick={() => onToggle(sid)}
                    className={`w-9 h-9 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-sm shrink-0 ${isPresent ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-red-400 hover:bg-red-500'}`}
                  >
                    {isPresent ? '+' : 'q'}
                  </button>
                </div>
              );
            })}
          </div>
          {error && <span className="text-red-400 text-xs text-center">{error}</span>}
          <div className="flex gap-3 pt-1 border-t border-base-200">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <FiSave size={14} /> Yadda saxla
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
            >
              Ləğv et
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default AttendanceModal;
