import React from 'react';
import { FiBook, FiClock, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

function SubjectInfoPanel({ subjectInfo, teacher, studentCount }) {
  const teacherInitials = `${teacher?.name?.charAt(0) ?? ''}${teacher?.surname?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <div className="lg:w-72 shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
              <FiBook size={16} />
            </div>
            <div>
              <div className="font-bold text-base">{subjectInfo.subject ?? '—'}</div>
              <div className="text-xs opacity-40">Fənn məlumatları</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Semestr', value: subjectInfo.semestr ? `${subjectInfo.semestr}-ci` : '—' },
              { label: 'Kredit', value: subjectInfo.kredit ?? '—' },
              { label: 'Saat', value: subjectInfo.totalHours ?? '—' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-base-200 last:border-0"
              >
                <span className="text-xs opacity-40 flex items-center gap-1">
                  <FiClock size={10} /> {label}
                </span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {teacher && (
        <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                {teacherInitials || <FiUser size={18} />}
              </div>
              <div>
                <div className="font-bold text-sm">
                  {teacher.name} {teacher.surname}
                </div>
                <div className="text-xs opacity-40">{teacher.fatherName}</div>
              </div>
            </div>
            <div className="bg-base-200/50 rounded-xl p-3 border border-base-200 flex flex-col gap-2">
              {teacher.phoneNumber && (
                <div className="flex items-center gap-2">
                  <FiPhone size={11} className="opacity-40 shrink-0" />
                  <span className="text-xs font-semibold">{teacher.phoneNumber}</span>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center gap-2">
                  <FiMail size={11} className="opacity-40 shrink-0" />
                  <span className="text-xs font-semibold truncate">{teacher.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5">
        <div className="text-xs font-semibold opacity-40 mb-3 flex items-center gap-1">
          <PiStudent size={12} /> Şagird sayı
        </div>
        <div className="text-3xl font-bold">{studentCount}</div>
      </div>
    </div>
  );
}

export default SubjectInfoPanel;
