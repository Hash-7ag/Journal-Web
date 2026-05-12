import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiUser, FiPhone, FiMail, FiUsers } from 'react-icons/fi';
import { capitalize } from '../../scripts/capitalize.js';

function StudentHome() {
   const [userData, setUserData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const response = await api.get('/student/getMyProfile');
            setUserData(response.data);
         } catch (err) {
            setError(err.message || 'Yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <div role="alert" className="alert alert-error max-w-sm rounded-xl">
               <span>{error}</span>
            </div>
         </div>
      );
   }

   if (!userData) return null;

   const initials = `${userData.name?.charAt(0) || ''}${userData.surname?.charAt(0) || ''}`.toUpperCase();

   const infoFields = [
      { icon: <FiUser size={16} />, label: 'Ad', value: userData.name },
      { icon: <FiUser size={16} />, label: 'Soyad', value: userData.surname },
      { icon: <FiUser size={16} />, label: 'Ata adı', value: userData.fatherName },
      { icon: <FiPhone size={16} />, label: 'Telefon', value: userData.phoneNumber },
      { icon: <FiMail size={16} />, label: 'Email', value: userData.email },
      { icon: <FiUsers size={16} />, label: 'Qrup', value: userData.group?.groupNumber ?? '—' },
   ];

   return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
         <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
               <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
               <div className="p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start">

                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                     <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {initials || <FiUser size={36} />}
                     </div>
                     <div className="text-center">
                        <div className="font-semibold text-base">{userData.username}</div>
                        <div className="text-xs opacity-40 mt-0.5">{capitalize(userData.role)}</div>
                     </div>
                     <div className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white shadow-sm">
                        Şagird
                     </div>
                  </div>

                  <div className="hidden sm:block w-px self-stretch bg-base-200" />

                  {/* Info */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                     {infoFields.map(({ icon, label, value }) => (
                        <div key={label} className="flex flex-col gap-1 bg-base-200/50 rounded-xl px-4 py-3 border border-base-200">
                           <div className="flex items-center gap-1.5 text-xs opacity-40 font-medium">
                              {icon}{label}
                           </div>
                           <div className="text-sm font-semibold">{value || '—'}</div>
                        </div>
                     ))}
                  </div>

               </div>
            </div>
         </div>
      </div>
   );
}

export default StudentHome;