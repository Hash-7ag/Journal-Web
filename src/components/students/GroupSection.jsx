import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiUsers, FiMail, FiPhone, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Pagination from '../ui/Pagination';

const groupColors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#3B82F6] to-[#8B5CF6]',
  'from-[#A78BFA] to-[#60A5FA]',
];
const studentColors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#A78BFA] to-[#60A5FA]',
  'from-[#3B82F6] to-[#8B5CF6]',
];
const pageSize = 10;

function GroupSection({ group, index, onInfo, onEdit }) {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const colorClass = groupColors[index % groupColors.length];

  const fetchStudents = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/getAssignedyStudents/${group._id}?page=${p}&pageSize=${pageSize}`);
      const data = res.data.data ?? [];
      setStudents(data);
      setTotal(res.data.total ?? 0);
      setTotalPages(data.length < pageSize && p === 1 ? 1 : (res.data.totalPages ?? 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(page);
  }, [page]);

  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full px-5 py-4 flex items-center gap-4 border-b border-base-200 hover:bg-base-200/30 transition-all duration-200"
      >
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0`}
        >
          {group.groupNumber}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="font-semibold text-sm">{group.profession}</div>
          <div className="text-xs opacity-30 font-mono tracking-widest mt-0.5">#{group.groupShifr}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiUsers size={13} />
            {total} şagird
          </div>
          <div className="w-7 h-7 rounded-lg border border-base-200 flex items-center justify-center opacity-40">
            {collapsed ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
          </div>
        </div>
      </button>

      {!collapsed && (
        <div className="p-4 flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center opacity-30 py-6 text-sm">Bu qrupda şagird yoxdur</div>
          ) : (
            <>
              {students.map((student, i) => {
                const colorIdx = ((page - 1) * pageSize + i) % studentColors.length;
                const initials = `${student.name?.charAt(0) || ''}${student.surname?.charAt(0) || ''}`.toUpperCase();
                return (
                  <div
                    key={student._id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-base-200/40 hover:bg-base-200/70 transition-all duration-200"
                  >
                    <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
                      <div
                        className={`absolute w-7 h-7 bg-gradient-to-br ${studentColors[colorIdx]} rotate-45 rounded-lg shadow-sm`}
                      />
                      <span className="relative z-10 text-white font-bold text-xs">{initials || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {student.name} {student.surname}
                      </div>
                      <div className="text-xs opacity-40 truncate">{student.fatherName}</div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                      {student.email && (
                        <div className="flex items-center gap-1.5 text-xs opacity-40">
                          <FiMail size={11} />
                          {student.email}
                        </div>
                      )}
                      {student.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-xs opacity-40">
                          <FiPhone size={11} />
                          {student.phoneNumber}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onEdit(student)}
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
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onInfo(student)}
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
                  </div>
                );
              })}
              <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GroupSection;
