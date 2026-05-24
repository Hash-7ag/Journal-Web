import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiUser, FiPhone, FiMail, FiUsers, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import { capitalize } from '../../scripts/capitalize.js';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

function StudentHome() {
   const [userData, setUserData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [editModal, setEditModal] = useState(false);
   const [editForm, setEditForm] = useState({ email: '', phoneNumber: '' });
   const [submitting, setSubmitting] = useState(false);
   const [editError, setEditError] = useState('');

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

   useEffect(() => { fetchData(); }, []);

   const openEdit = () => {
      setEditForm({
         email: userData.email ?? '',
         phoneNumber: formatPhone(userData.phoneNumber ?? ''),
      });
      setEditError('');
      setEditModal(true);
   };

   const handleEditSubmit = async () => {
      try {
         setSubmitting(true);
         setEditError('');
         await api.patch('/student/updateMyInfo', {
            email: editForm.email,
            phoneNumber: phoneToRaw(editForm.phoneNumber),
         });
         await fetchData();
         setEditModal(false);
      } catch (err) {
         setEditError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSubmitting(false);
      }
   };

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
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                     {infoFields.map(({ icon, label, value }) => (
                        <div key={label} className="flex flex-col gap-1 bg-base-200/50 rounded-xl px-4 py-3 border border-base-200">
                           <div className="flex items-center gap-1.5 text-xs opacity-40 font-medium">{icon}{label}</div>
                           <div className="text-sm font-semibold">{value || '—'}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
               <button
                  onClick={() => window.location.href = '/changePassword'}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Parolu Yenilə
               </button>
               <button
                  onClick={openEdit}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
               >
                  <FiEdit2 size={14} /> Profili Redaktə Et
               </button>
            </div>
         </div>

         {/* Edit Modal */}
         {editModal && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                  <div className="p-6 flex flex-col gap-5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                              <FiEdit2 size={15} />
                           </div>
                           <div>
                              <h3 className="text-base font-bold">Profili Redaktə Et</h3>
                              <p className="text-xs opacity-40">Email və telefon</p>
                           </div>
                        </div>
                        <button onClick={() => setEditModal(false)} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                           <FiX size={15} />
                        </button>
                     </div>

                     <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                           <label className="text-xs font-medium opacity-50 ml-1">Email</label>
                           <div className="relative">
                              <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                              <input
                                 type="email"
                                 value={editForm.email}
                                 onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                 className="input w-full pl-8 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           <label className="text-xs font-medium opacity-50 ml-1">Telefon</label>
                           <div className="relative">
                              <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                              <input
                                 type="tel"
                                 value={editForm.phoneNumber || '+994 '}
                                 onChange={e => setEditForm(p => ({ ...p, phoneNumber: formatPhone(e.target.value) }))}
                                 onFocus={() => {
                                    if (!editForm.phoneNumber) setEditForm(p => ({ ...p, phoneNumber: '+994 ' }));
                                 }}
                                 placeholder="+994 xx xxx xx xx"
                                 className="input w-full pl-8 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                        </div>
                     </div>

                     {editError && <span className="text-red-400 text-xs text-center">{editError}</span>}

                     <div className="flex gap-3">
                        <button
                           onClick={handleEditSubmit}
                           disabled={submitting}
                           className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                        >
                           {submitting ? <span className="loading loading-spinner loading-xs" /> : <><FiCheck size={14} /> Yadda saxla</>}
                        </button>
                        <button onClick={() => setEditModal(false)} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                           Ləğv et
                        </button>
                     </div>
                  </div>
               </div>
               <div className="modal-backdrop" onClick={() => setEditModal(false)} />
            </div>
         )}
      </div>
   );
}

export default StudentHome;