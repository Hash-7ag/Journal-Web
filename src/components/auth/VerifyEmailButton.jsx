import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useGoogleConnect } from '../../scripts/useGoogleConnect.js';

// verified = есть ли googleId; role = текущая роль; onDone = колбэк после успеха
function VerifyEmailButton({ verified, role, email, onDone }) {
  const { connect, loading, error } = useGoogleConnect(role, onDone);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => connect()}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-60
               ${
                 verified
                   ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                   : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30'
               }`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs" />
        ) : verified ? (
          <>
            <FiCheckCircle size={15} /> Email təsdiqlənib
          </>
        ) : (
          <>
            <FiAlertCircle size={15} /> Email təsdiqlə
          </>
        )}
      </button>
      {verified && email && <span className="text-xs opacity-40 text-center">{email}</span>}
      {error && <span className="text-red-400 text-xs text-center">{error}</span>}
    </div>
  );
}

export default VerifyEmailButton;
