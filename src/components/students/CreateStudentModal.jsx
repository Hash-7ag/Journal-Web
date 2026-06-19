import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiX,
  FiCheck,
  FiUserPlus,
} from 'react-icons/fi';
import FormInput from '../ui/FormInput';
import PhoneInput from '../ui/PhoneInput';
import StepIndicator from '../ui/StepIndicator';

const EMPTY = { name: '', surname: '', fatherName: '', email: '', phone: '', username: '', password: '' };

function CreateStudentModal({ onClose, onSubmit, submitting, error }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [stepError, setStepError] = useState('');

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setStepError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.surname.trim() || !form.fatherName.trim()) {
        setStepError('Bütün sahələri doldurun');
        return false;
      }
    }
    if (step === 2) {
      if (!form.email.trim()) {
        setStepError('Email daxil edin');
        return false;
      }
      if (form.phone.length < 9) {
        setStepError('Telefon nömrəsi tam deyil');
        return false;
      }
    }
    if (step === 3) {
      if (!form.username.trim()) {
        setStepError('İstifadəçi adı daxil edin');
        return false;
      }
      if (form.password.trim().length < 8) {
        setStepError('Parol ən azı 8 simvol olmalıdır');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const back = () => {
    setStepError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = () => {
    // собираем payload: phone 9 цифр → +994...
    onSubmit({
      name: form.name.trim(),
      surname: form.surname.trim(),
      fatherName: form.fatherName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      phoneNumber: `+994${form.phone}`,
    });
  };

  return (
    <div className="modal modal-open z-40" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden max-h-[90vh] w-[calc(100%-2rem)] mx-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-7 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiUserPlus size={19} />
              </div>
              <div>
                <h3 className="text-base font-bold">Yeni şagird</h3>
                <p className="text-xs opacity-40 mt-0.5">
                  {step === 1 && 'Ümumi məlumat'}
                  {step === 2 && 'Əlaqə məlumatları'}
                  {step === 3 && 'Hesab məlumatları'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Шаги */}
          <div className="flex flex-col gap-4 min-h-[180px]">
            {step === 1 && (
              <>
                <FormInput
                  label="Ad"
                  icon={<FiUser size={15} />}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Məs: Əli"
                  onEnter={next}
                  autoFocus
                />
                <FormInput
                  label="Soyad"
                  icon={<FiUser size={15} />}
                  value={form.surname}
                  onChange={(e) => set('surname', e.target.value)}
                  placeholder="Məs: Məmmədov"
                  onEnter={next}
                />
                <FormInput
                  label="Ata adı"
                  icon={<FiUser size={15} />}
                  value={form.fatherName}
                  onChange={(e) => set('fatherName', e.target.value)}
                  placeholder="Məs: Hüseyn"
                  onEnter={next}
                />
              </>
            )}
            {step === 2 && (
              <>
                <FormInput
                  label="Email"
                  type="email"
                  icon={<FiMail size={15} />}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@mail.com"
                  onEnter={next}
                  autoFocus
                />
                <PhoneInput value={form.phone} onChange={(v) => set('phone', v)} onEnter={next} />
              </>
            )}
            {step === 3 && (
              <>
                <FormInput
                  label="İstifadəçi adı"
                  icon={<FiUser size={15} />}
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                  placeholder="username"
                  onEnter={next}
                  autoFocus
                />
                <FormInput
                  label="Şifrə"
                  type={showPassword ? 'text' : 'password'}
                  icon={<FiLock size={15} />}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  onEnter={next}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="opacity-40 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  }
                />
              </>
            )}
          </div>

          {(stepError || error) && <span className="text-red-400 text-xs text-center -mt-2">{stepError || error}</span>}

          {/* Навигация */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={back}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                >
                  <FiArrowLeft size={14} /> Geri
                </button>
              )}
              <button
                onClick={next}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : step < 3 ? (
                  <>
                    Davam <FiArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <FiCheck size={15} /> Əlavə et
                  </>
                )}
              </button>
            </div>
            <StepIndicator total={3} current={step} />
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default CreateStudentModal;
