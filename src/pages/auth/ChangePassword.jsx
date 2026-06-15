import React, { useState } from 'react';
import { capitalize } from '../../scripts/capitalize.js';
import api from '../../scripts/api';
import { getUserStoreData } from '../../store/userStore.js';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiAlertCircle, FiArrowRight, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';

function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [frontError, setFrontError] = useState('');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const toggleShow = (name) => setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }));

  const [formValues, setFormValues] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const homeRoutes = {
    admin: '/home',
    student: '/student/home',
    teacher: '/teacher/home',
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFrontError('');
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    setFrontError('');
  };

  const handleSubmit = async () => {
    setFrontError('');
    setServerError('');
    setSuccess('');

    if (!formValues.oldPassword.trim() || !formValues.newPassword.trim() || !confirmPassword.trim()) {
      setFrontError('Bütün sahələr doldurulmalıdır');
      return;
    }
    if (formValues.newPassword !== confirmPassword) {
      setFrontError('Yeni parollar uyğun gəlmir');
      return;
    }

    try {
      setLoading(true);
      const userData = getUserStoreData();
      const role = userData.role;
      if (!role) throw new Error('Role not found');

      await api.post(`/${role}/changePasswordAs${capitalize(role)}`, formValues);
      setSuccess('Parol uğurla dəyişdirildi!');
      setFormValues({ oldPassword: '', newPassword: '' });
      setConfirmPassword('');
      setTimeout(() => navigate(homeRoutes[role] ?? '/home'), 1000);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'oldPassword', label: 'Köhnə şifrə', value: formValues.oldPassword, onChange: handleFormChange },
    { name: 'newPassword', label: 'Yeni şifrə', value: formValues.newPassword, onChange: handleFormChange },
    { name: 'confirmPassword', label: 'Yeni şifrə (təsdiq)', value: confirmPassword, onChange: handleConfirmChange },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {/* Card */}
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

          <div className="p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiShield size={20} />
              </div>
              <h2 className="text-xl font-bold">Parolu dəyişdir</h2>
              <p className="text-xs opacity-40">Təhlükəsizlik üçün yeni parol təyin edin</p>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              {fields.map(({ name, label, value, onChange }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-60 ml-1">{label}</label>
                  <div className="relative">
                    <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                    <input
                      type={showPasswords[name] ? 'text' : 'password'}
                      name={name}
                      value={value}
                      onChange={onChange}
                      placeholder="••••••••"
                      className="input w-full pl-9 pr-9 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] focus:bg-base-100 transition-all duration-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(name)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity"
                    >
                      {showPasswords[name] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Front-end error */}
              {frontError && (
                <span className="flex items-center gap-1.5 text-red-400 text-xs ml-1">
                  <FiAlertCircle size={13} />
                  {frontError}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  Parolu dəyiş <FiArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Server error alert */}
        {serverError && (
          <div role="alert" className="alert alert-error rounded-xl shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        {/* Success alert */}
        {success && (
          <div role="alert" className="alert alert-success rounded-xl shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePassword;
