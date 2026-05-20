import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiMail, FiPhone, FiLock, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

function Teachers() {
   const [teachers, setTeachers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      name: '', surname: '', fatherName: '',
      username: '', password: '', phoneNumber: '', email: '',
   });
   const [submitting, setSubmitting] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const pageSize = 10;

   const fetchTeachers = async (pageNum = 1) => {
      try {
         setLoading(true);
         const response = await api.get(`/admin/getAllTeachers?page=${pageNum}&pageSize=${pageSize}`);
         setTeachers(response.data.data);
         setTotalPages(response.data.totalPages);
         setTotal(response.data.total);
      } catch (err) {
         setError(err.message || 'Yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchTeachers(page); }, [page]);

   const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name === 'phoneNumber') {
         setFormData(prev => ({ ...prev, phoneNumber: formatPhone(value) }));
      } else {
         setFormData(prev => ({ ...prev, [name]: value }));
      }
   };

   const handleAddTeacher = async () => {
      const required = ['name', 'surname', 'fatherName', 'username', 'password', 'phoneNumber', 'email'];
      const missing = required.filter(field => !formData[field].trim());
      if (missing.length) {
         setError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
         return;
      }
      try {
         setSubmitting(true);
         await api.post('/admin/createTeacher', {
            ...formData,
            phoneNumber: phoneToRaw(formData.phoneNumber),
         });
         setIsModalOpen(false);
         setFormData({ name: '', surname: '', fatherName: '', username: '', password: '', phoneNumber: '', email: '' });
         setShowPassword(false);
         setError('');
         fetchTeachers(page);
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to create teacher');
      } finally {
         setSubmitting(false);
      }
   };

   const teacherColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]', 'from-[#3B82F6] to-[#8B5CF6]',
   ];

   if (loading && teachers.length === 0) {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
         </div>
      );
   }

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Müəllimlər</h1>
               <p className="text-xs opacity-40 mt-0.5">Cəmi {total} müəllim · Səhifə {page} / {totalPages}</p>
            </div>
            <button
               onClick={() => { setIsModalOpen(true); setShowPassword(false); }}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} /> Müəllim əlavə et
            </button>
         </div>

         {loading ? (
            <div className="flex justify-center items-center py-20">
               <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
            </div>
         ) : teachers.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir müəllim tapılmadı</div>
         ) : (
            <div className="flex flex-col gap-3">
               {teachers.map((teacher, index) => {
                  const globalIndex = (page - 1) * pageSize + index;
                  const colorClass = teacherColors[globalIndex % teacherColors.length];
                  const initials = `${teacher.name?.charAt(0) || ''}${teacher.surname?.charAt(0) || ''}`.toUpperCase();
                  return (
                     <div key={teacher._id || index} className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                           {initials || <FiUser size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{teacher.name} {teacher.surname}</div>
                           <div className="text-xs opacity-40 mt-0.5 truncate">{teacher.fatherName && `${teacher.fatherName} oğlu`}</div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                           {teacher.email && <div className="flex items-center gap-1.5 text-xs opacity-40"><FiMail size={12} />{teacher.email}</div>}
                           {teacher.phoneNumber && <div className="flex items-center gap-1.5 text-xs opacity-40"><FiPhone size={12} />{teacher.phoneNumber}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <button className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
               <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="w-9 h-9 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200">
                  <FiChevronLeft size={16} />
               </button>
               {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => handlePageChange(p)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${p === page ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md' : 'border border-base-200 opacity-50 hover:opacity-100 hover:bg-base-200'}`}>
                     {p}
                  </button>
               ))}
               <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="w-9 h-9 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200">
                  <FiChevronRight size={16} />
               </button>
            </div>
         )}

         {isModalOpen && (
            <div className="modal modal-open" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-lg">
                  <div className="flex flex-col items-center gap-1 text-center">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                        <FiUser size={18} />
                     </div>
                     <h3 className="text-lg font-bold">Yeni müəllim</h3>
                     <p className="text-xs opacity-40">Məlumatları doldurun</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
                     {/* Name */}
                     {['name', 'surname', 'fatherName', 'username', 'email'].map(name => (
                        <div key={name} className="flex flex-col gap-1">
                           <label className="text-xs font-medium opacity-50 ml-1">
                              {{ name: 'Ad', surname: 'Soyad', fatherName: 'Ata adı', username: 'İstifadəçi adı', email: 'Email' }[name]}
                           </label>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">
                                 {name === 'email' ? <FiMail size={14} /> : <FiUser size={14} />}
                              </span>
                              <input
                                 type={name === 'email' ? 'email' : 'text'}
                                 name={name}
                                 value={formData[name]}
                                 onChange={handleInputChange}
                                 placeholder={{ name: 'Məs: Əli', surname: 'Məs: Məmmədov', fatherName: 'Məs: Hüseyn', username: 'username', email: 'email@mail.com' }[name]}
                                 className="input w-full pl-8 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                        </div>
                     ))}

                     {/* Password с глазом */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Şifrə</label>
                        <div className="relative">
                           <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                           <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="••••••••"
                              className="input w-full pl-8 pr-9 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           />
                           <button
                              type="button"
                              onClick={() => setShowPassword(p => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity"
                           >
                              {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                           </button>
                        </div>
                     </div>

                     {/* Phone с форматированием */}
                     <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-medium opacity-50 ml-1">Telefon</label>
                        <div className="relative">
                           <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                           <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber || '+994 '}
                              onChange={handleInputChange}
                              onFocus={() => { if (!formData.phoneNumber) setFormData(prev => ({ ...prev, phoneNumber: '+994 ' })); }}
                              placeholder="+994 55 428 23 44"
                              className="input w-full pl-8 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           />
                        </div>
                     </div>
                  </div>

                  {error && <span className="text-red-400 text-xs text-center">{error}</span>}

                  <div className="flex gap-3 pt-1">
                     <button onClick={handleAddTeacher} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60">
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button onClick={() => { setIsModalOpen(false); setError(''); setShowPassword(false); }} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                        Ləğv et
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default Teachers;