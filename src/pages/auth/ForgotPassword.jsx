import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { getUserStoreData } from '../../store/userStore.js';
import { setResetAccess } from '../../scripts/resetAccess.js';
import { FiMail, FiArrowRight, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi';

const OTP_SECONDS = 120;

function ForgotPassword() {
  const navigate = useNavigate();
  const role = getUserStoreData()?.role;

  const [step, setStep] = useState(1); // 1 = email, 2 = код
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // если роль не выбрана — на выбор роли
  useEffect(() => {
    if (!role) navigate('/choose-role');
  }, [role, navigate]);

  // таймер
  useEffect(() => {
    if (secondsLeft <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [secondsLeft]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendCode = async () => {
    setError('');
    if (!email.trim()) {
      setError('Email daxil edin');
      return;
    }
    try {
      setLoading(true);
      await api.post('/sendOtpToMail', { role, email: email.trim() });
      setStep(2);
      setSecondsLeft(OTP_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || 'Kod göndərilə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Kodu daxil edin');
      return;
    }
    try {
      setLoading(true);
      await api.post('/verifyOtp', { email: email.trim(), otp: otp.trim() });
      // код верный — выдаём временный доступ к смене пароля
      setResetAccess({ email: email.trim(), role, otp: otp.trim(), verified: true });
      navigate('/reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'Kod yanlışdır və ya vaxtı bitib');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    try {
      setLoading(true);
      await api.post('/sendOtpToMail', { role, email: email.trim() });
      setSecondsLeft(OTP_SECONDS);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Kod göndərilə bilmədi');
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiShield size={20} />
              </div>
              <h2 className="text-xl font-bold">Şifrəni bərpa et</h2>
              <p className="text-xs opacity-40">
                {step === 1 ? 'Email ünvanınızı daxil edin' : 'Emailə gələn kodu daxil edin'}
              </p>
            </div>

            {/* Шаг 1 — email */}
            {step === 1 && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-60 ml-1">Email</label>
                  <div className="relative">
                    <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <input
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && !loading && sendCode()}
                      type="email"
                      placeholder="email@example.com"
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
                  onClick={sendCode}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      Kod göndər <FiArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Шаг 2 — код */}
            {step === 2 && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-60 ml-1">Təsdiq kodu</label>
                  <input
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && verifyCode()}
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    className="input w-full text-center tracking-[0.5em] font-bold text-lg pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200"
                  />
                </div>

                {/* таймер / повтор */}
                <div className="flex items-center justify-between text-xs ml-1">
                  {secondsLeft > 0 ? (
                    <span className="opacity-50">
                      Kodun qüvvədə olma müddəti:{' '}
                      <span className="font-semibold text-[#8B5CF6]">{fmt(secondsLeft)}</span>
                    </span>
                  ) : (
                    <span className="opacity-50">Kodun vaxtı bitdi</span>
                  )}
                  <button
                    onClick={resend}
                    disabled={loading || secondsLeft > 0}
                    className="text-[#8B5CF6] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
                  >
                    Yenidən göndər
                  </button>
                </div>

                {error && (
                  <span className="flex items-center gap-1.5 text-red-400 text-xs ml-1">
                    <FiAlertCircle size={13} /> {error}
                  </span>
                )}

                <button
                  onClick={verifyCode}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      Təsdiqlə <FiArrowRight size={15} />
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setSecondsLeft(0);
                  }}
                  className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1 justify-center transition-all duration-200"
                >
                  <FiArrowLeft size={12} /> Emaili dəyiş
                </button>
              </div>
            )}

            <button
              onClick={() => navigate('/login')}
              className="text-xs opacity-50 hover:opacity-100 transition-all duration-200 text-center"
            >
              Girişə qayıt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
