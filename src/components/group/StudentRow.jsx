import React from 'react';
import { FiUser, FiMail, FiPhone, FiTrash2 } from 'react-icons/fi';

const colors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
];

function StudentRow({ student, index, deletingId, onInfo, onDelete }) {
  const s = student.student ?? student;
  const sid = typeof s === 'object' ? s._id : s;
  const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <div
      key={sid ?? index}
      className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
      >
        {initials || <FiUser size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {s.name} {s.surname}
        </div>
        {s.fatherName && <div className="text-xs opacity-40 mt-0.5 truncate">{s.fatherName}</div>}
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {s.email && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiMail size={12} />
            {s.email}
          </div>
        )}
        {s.phoneNumber && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiPhone size={12} />
            {s.phoneNumber}
          </div>
        )}
      </div>
      <button
        onClick={() => onInfo(s)}
        className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(sid)}
        disabled={deletingId === sid}
        className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-red-50 hover:border-red-200 hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 disabled:opacity-50"
      >
        {deletingId === sid ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 size={14} />}
      </button>
    </div>
  );
}

export default StudentRow;
