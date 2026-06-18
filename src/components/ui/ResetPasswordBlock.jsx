import React, { useState } from 'react';
import api from '../../scripts/api.js';

function ResetPasswordBlock({ id, role }) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      setError('');
      setNewPassword('');
      setCopied(false);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
      let pwd = '';
      for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
      const endpoints = {
        teacher: `/admin/resetTeacherPassword/${id}`,
        student: `/admin/resetStudentPassword/${id}`,
        parent: `/admin/resetParentPassword/${id}`,
      };
      const endpoint = endpoints[role] ?? endpoints.student;
      await api.patch(endpoint, { password: pwd });
      setNewPassword(pwd);
      setConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 pt-1 border-t border-base-200">
      {!newPassword && !confirm && (
        <button
          onClick={() => setConfirm(true)}
          className="w-full py-2.5 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-200"
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
          Parolu Sıfırla
        </button>
      )}
      {confirm && !newPassword && (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500 shrink-0 mt-0.5"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Əminsiniz?</span>
              <span className="text-xs text-amber-600 dark:text-amber-500 opacity-80">
                Parolu sıfırlasanız bu istifadəçi bütün cihazlardan çıxarılacaq.
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" /> Sıfırlanır...
                </>
              ) : (
                'Bəli, sıfırla'
              )}
            </button>
            <button
              onClick={() => setConfirm(false)}
              disabled={loading}
              className="flex-1 py-2 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200 disabled:opacity-60"
            >
              Ləğv et
            </button>
          </div>
        </div>
      )}
      {newPassword && (
        <div className="flex flex-col gap-2">
          <span className="text-xs opacity-50 ml-1">Yeni parol:</span>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50">
            <span className="flex-1 text-sm font-mono font-semibold tracking-wider">{newPassword}</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                copied
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-base-300 hover:bg-base-200 border border-base-200'
              }`}
            >
              {copied ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>{' '}
                  Kopyalandı
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>{' '}
                  Kopyala
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {error && <span className="text-red-400 text-xs text-center">{error}</span>}
    </div>
  );
}

export default ResetPasswordBlock;
