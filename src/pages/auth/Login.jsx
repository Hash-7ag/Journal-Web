import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { capitalize } from '../../scripts/capitalize.js'
import api from '../../scripts/api';
import { getUserStoreData } from '../../store/userStore.js';
import { FiUser, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi'

function Login() {
   const navigate = useNavigate();
   const userData = getUserStoreData();
   const role = userData.role

   const roleLabels = {
      student: "Şagird",
      admin: "Admin",
      teacher: "Müəllim"
   }
   const roleLabel = roleLabels[role] || capitalize(role);

   useEffect(() => {
      if (!role) navigate('/');
   }, [role, navigate])

   const [loading, setLoading] = useState(false)
   const [formValues, setFormValues] = useState({ username: '', password: '' });
   const [frontError, setFrontError] = useState('');
   const [serverError, setServerError] = useState('');
   const [success, setSuccess] = useState('');

   const roleColors = {
      student: 'from-[#3B82F6] to-[#60A5FA]',
      teacher: 'from-[#8B5CF6] to-[#A78BFA]',
      admin: 'from-[#8B5CF6] to-[#3B82F6]',
   }
   const gradientClass = roleColors[role] || 'from-[#8B5CF6] to-[#3B82F6]'

   const login = async () => {
      setFrontError('');
      setServerError('');
      setSuccess('');

      if (!formValues.username.trim() || !formValues.password.trim()) {
         setFrontError('İstifadəçi adı və şifrə doldurulmalıdır');
         return;
      }

      const homeRoutes = {
         admin: '/home',
         student: '/student/home',
         teacher: '/teacher/home',
      };

      try {
         setLoading(true);
         await api.post(`/${role}/loginAs${capitalize(role)}`, formValues);
         setSuccess('Uğurla daxil oldunuz!');
         const profileRes = await api.get(`/${role}/getMyProfile`);
         const { isChangePassword } = profileRes.data;
         navigate(isChangePassword ? homeRoutes[role] : '/changePassword');
      } catch (error) {
         setServerError(
            error.response?.data?.message || 'Uğursuz giriş. Yenidən cəhd edin.'
         );
      } finally {
         setLoading(false);
      }
   }

   const changeValues = (e) => {
      const { name, value } = e.target;
      setFormValues(prev => ({ ...prev, [name]: value }))
      setFrontError('');
   }

   if (!role) return null;

   return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
         <div className="w-full max-w-sm flex flex-col gap-4">

            {/* Card */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">

               {/* Top gradient bar */}
               <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass}`} />

               <div className="p-8 flex flex-col gap-6">

                  {/* Header */}
                  <div className="flex flex-col items-center gap-2 text-center">
                     <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-md`}>
                        <FiUser size={20} />
                     </div>
                     <h2 className="text-xl font-bold">
                        {roleLabel} kimi daxil ol
                     </h2>
                     <p className="text-xs opacity-40">
                        Hesabınıza daxil olmaq üçün məlumatları doldrun
                     </p>
                  </div>

                  {/* Fields */}
                  <div className="flex flex-col gap-3">

                     {/* Username */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-60 ml-1">
                           İstifadəçi adı
                        </label>
                        <div className="relative">
                           <FiUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                           <input
                              name="username"
                              value={formValues.username}
                              onChange={(e) => changeValues(e)}
                              type="text"
                              placeholder="Username"
                              className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] focus:bg-base-100 transition-all duration-200 text-sm"
                           />
                        </div>
                     </div>

                     {/* Password */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-60 ml-1">
                           Şifrə
                        </label>
                        <div className="relative">
                           <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                           <input
                              name="password"
                              value={formValues.password}
                              onChange={(e) => changeValues(e)}
                              type="password"
                              placeholder="••••••••"
                              className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] focus:bg-base-100 transition-all duration-200 text-sm"
                           />
                        </div>
                     </div>

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
                     onClick={login}
                     disabled={loading}
                     className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${gradientClass} text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60`}
                  >
                     {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                     ) : (
                        <>Daxil ol <FiArrowRight size={15} /></>
                     )}
                  </button>

               </div>
            </div>

            {/* Server error alert */}
            {serverError && (
               <div role="alert" className="alert alert-error rounded-xl shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{serverError}</span>
               </div>
            )}

            {/* Success alert */}
            {success && (
               <div role="alert" className="alert alert-success rounded-xl shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
               </div>
            )}

         </div>
      </div>
   )
}

export default Login