import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserStoreData } from '../../store/userStore.js';
import { FiArrowRight, FiUser, FiShield, FiUsers } from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

function ChooseRole() {
  const navigate = useNavigate();

  const moveToLogin = (role) => {
    setUserStoreData(role);
    navigate('/login');
  };

  const roles = [
    {
      key: 'parent',
      label: 'Valideyn',
      desc: 'Övladınızın qiymətlərinə baxın',
      icon: <FiUsers size={22} />,
      color: 'from-[#6366F1] to-[#8B5CF6]',
    },
    {
      key: 'student',
      label: 'Tələbə',
      desc: 'Cədvəlinizə və qiymətlərinizə baxın',
      icon: <PiStudent size={22} />,
      color: 'from-[#3B82F6] to-[#60A5FA]',
    },
    {
      key: 'teacher',
      label: 'Müəllim',
      desc: 'Dərslər və qruplarınızı idarə edin',
      icon: <FiUser size={22} />,
      color: 'from-[#8B5CF6] to-[#A78BFA]',
    },
    {
      key: 'admin',
      label: 'Admin',
      desc: 'Tam sistem idarəetməsi',
      icon: <FiShield size={22} />,
      color: 'from-[#8B5CF6] to-[#3B82F6]',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] shadow-lg mb-6">
          <span className="text-white font-bold text-3xl">EC</span>
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">
          Elektron Cədvəl
        </h1>
        <p className="text-base opacity-50 max-w-sm mx-auto leading-relaxed">
          Kollecimizin Elektron Cədvəl Proqramına xoş gəlmisiniz! Hesabınıza daxil olmaq üçün rolunuzu seçin.
        </p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        {roles.map(({ key, label, desc, icon, color }) => (
          <button
            key={key}
            onClick={() => moveToLogin(key)}
            className="group flex-1 bg-base-100 border border-base-200 rounded-2xl p-6 text-left shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
            <div className="font-semibold text-base mb-1">{label}</div>
            <div className="text-xs opacity-50 leading-relaxed mb-4">{desc}</div>
            <div
              className={`flex items-center gap-1 text-xs font-medium bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              Daxil ol <FiArrowRight size={12} className="opacity-70" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChooseRole;
