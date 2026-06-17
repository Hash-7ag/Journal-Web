import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import VerifyEmailButton from './VerifyEmailButton.jsx';

function VerifyEmailModal({ role, email, onClose, onDone }) {
  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-500" />
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 shrink-0">
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold">Email təsdiqlənməyib</h3>
                <p className="text-xs opacity-40 mt-0.5">Hesabınızın təhlükəsizliyi üçün</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
            >
              <FiX size={15} />
            </button>
          </div>

          <p className="text-sm opacity-60 leading-relaxed">
            Şifrənizi unutduğunuz halda bərpa edə bilmək üçün Google hesabınızla emailinizi təsdiqləyin.
          </p>

          <VerifyEmailButton
            verified={false}
            role={role}
            email={email}
            onDone={() => {
              onDone?.();
              onClose();
            }}
          />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default VerifyEmailModal;
