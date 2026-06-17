import React from 'react';
import { FiUser, FiEdit2 } from 'react-icons/fi';
import VerifyEmailButton from '../auth/VerifyEmailButton.jsx';

function ProfileCard({ userData, initials, infoFields, onEdit, onChangePassword, onVerifyDone }) {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
              {userData.picture ? (
                <img
                  src={userData.picture}
                  alt="profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials || <FiUser size={36} />
              )}
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">{userData.username}</div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-sm">
              {userData.roleLabel}
            </div>
          </div>
          <div className="hidden sm:block w-px self-stretch bg-base-200" />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {infoFields.map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 bg-base-200/50 rounded-xl px-4 py-3 border border-base-200"
              >
                <div className="flex items-center gap-1.5 text-xs opacity-40 font-medium">
                  {icon}
                  {label}
                </div>
                <div className="text-sm font-semibold">{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
        {/* Подтверждение email — слева от остальных кнопок */}
        <div className="sm:mr-auto">
          <VerifyEmailButton
            verified={!!userData.googleId}
            role={userData.role}
            email={userData.email}
            onDone={onVerifyDone}
          />
        </div>
        <button
          onClick={onChangePassword}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Parolu Yenilə
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
        >
          <FiEdit2 size={14} /> Profili Redaktə Et
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
