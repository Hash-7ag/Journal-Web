import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { getResetAccess, clearResetAccess } from '../../scripts/resetAccess.js';
import { FiLock, FiArrowRight, FiAlertCircle, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

function ResetPassword() {
  const navigate = useNavigate();
  const access = getResetAccess();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // защита: без подтверждённого доступа — на главную
  useEffect(() => {
    if (!access?.verified) navigate('/', { replace: true });
  }, [access, navigate]);

  const submit = async () => {
    setError('');
    if (password.length < 8) {
      setError('Parol ən azı 8 simvoldan ibarət olmalıdır');
      return;
    }
    if (password !== confirm) {
      setError('Parollar uyğun gəlmir');
      return;
    }
    try {
      setLoading(true);
      await api.patch('/resetPasswordWithOtp', {
        email: access.email,
        role: access.role,
        otp: access.otp,
        newPassword: password,
      });
      clearResetAccess();
      setDone(true);
      // через пару секунд — на главную (там выбор роли / логин)
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Şifrə dəyişdirilə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  if (!access?.verified) return null;

  if (done) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 p-8 max-w-sm flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
            <FiCheckCircle size={28} />
          </div>
          <h2 className="text-lg font-bold">Şifrə dəyişdirildi!</h2>
          <p className="text-xs opacity-50">İndi yeni şifrə ilə daxil ola bilərsiniz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiLock size={20} />
              </div>
              <h2 className="text-xl font-bold">Yeni şifrə</h2>
              <p className="text-xs opacity-40">Yeni şifrənizi təyin edin</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-60 ml-1">Yeni şifrə</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && submit()}
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input w-full pl-9 pr-9 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity"
                  >
                    {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-60 ml-1">Şifrəni təsdiqlə</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && submit()}
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {error && (
                <span className="flex items-center gap-1.5 text-red-400 text-xs ml-1">
                  <FiAlertCircle size={13} /> {error}
                </span>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    Şifrəni yenilə <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
