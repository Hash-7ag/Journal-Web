import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiMail, FiPhone, FiLock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Students() {
   const [students, setStudents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      name: '', surname: '', fatherName: '',
      username: '', password: '', phoneNumber: '', email: '',
   });
   const [submitting, setSubmitting] = useState(false);

   // Pagination
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const pageSize = 5;

   const fetchStudents = async (pageNum = 1) => {
      try {
         setLoading(true);
         const response = await api.get(`/admin/getAllStudents?page=${pageNum}&pageSize=${pageSize}`);
         setStudents(response.data.data);
         setTotalPages(response.data.totalPages);
         setTotal(response.data.total);
      } catch (err) {
         console.error('Yüklənmə zamanı xəta:', err);
         setError(err.message || 'yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchStudents(page);
   }, [page]);

   const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleAddStudent = async () => {
      const required = ['name', 'surname', 'fatherName', 'username', 'password', 'phoneNumber', 'email'];
      const missing = required.filter(field => !formData[field].trim());
      if (missing.length) {
         setError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
         return;
      }
      try {
         setSubmitting(true);
         await api.post('/admin/createStudent', formData);
         setIsModalOpen(false);
         setFormData({ name: '', surname: '', fatherName: '', username: '', password: '', phoneNumber: '', email: '' });
         setError('');
         // перезагружаем текущую страницу
         fetchStudents(page);
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to create student');
      } finally {
         setSubmitting(false);
      }
   };

   const studentColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]', 'from-[#3B82F6] to-[#8B5CF6]',
   ];

   const fields = [
      { name: 'name', label: 'Ad', type: 'text', placeholder: 'Məs: Əli', icon: <FiUser size={14} /> },
      { name: 'surname', label: 'Soyad', type: 'text', placeholder: 'Məs: Məmmədov', icon: <FiUser size={14} /> },
      { name: 'fatherName', label: 'Ata adı', type: 'text', placeholder: 'Məs: Hüseyn', icon: <FiUser size={14} /> },
      { name: 'username', label: 'İstifadəçi adı', type: 'text', placeholder: 'username', icon: <FiUser size={14} /> },
      { name: 'password', label: 'Şifrə', type: 'password', placeholder: '••••••••', icon: <FiLock size={14} /> },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'email@mail.com', icon: <FiMail size={14} /> },
      { name: 'phoneNumber', label: 'Telefon', type: 'tel', placeholder: '+994 xx xxx xx xx', icon: <FiPhone size={14} /> },
   ];

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Page header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Şagirdlər</h1>
               <p className="text-xs opacity-40 mt-0.5">
                  Cəmi {total} şagird · Səhifə {page} / {totalPages}
               </p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} />
               Şagird əlavə et
            </button>
         </div>

         {/* List */}
         {loading ? (
            <div className="flex justify-center items-center py-20">
               <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
            </div>
         ) : students.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir şagird tapılmadı</div>
         ) : (
            <div className="flex flex-col gap-3">
               {students.map((student, index) => {
                  // глобальный индекс для цвета чтобы не сбрасывался при смене страницы
                  const globalIndex = (page - 1) * pageSize + index;
                  const colorClass = studentColors[globalIndex % studentColors.length];
                  const initials = `${student.name?.charAt(0) || ''}${student.surname?.charAt(0) || ''}`.toUpperCase();
                  return (
                     <div
                        key={student._id || index}
                        className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
                     >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                           {initials || <FiUser size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{student.name} {student.surname}</div>
                           <div className="text-xs opacity-40 mt-0.5 truncate">
                              {student.fatherName && `${student.fatherName} oğlu`}
                           </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                           {student.email && (
                              <div className="flex items-center gap-1.5 text-xs opacity-40">
                                 <FiMail size={12} />{student.email}
                              </div>
                           )}
                           {student.phoneNumber && (
                              <div className="flex items-center gap-1.5 text-xs opacity-40">
                                 <FiPhone size={12} />{student.phoneNumber}
                              </div>
                           )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <button className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                           </button>
                           <button className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                 <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* Pagination */}
         {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">

               {/* Prev */}
               <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
               >
                  <FiChevronLeft size={16} />
               </button>

               {/* Page numbers */}
               {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                     key={p}
                     onClick={() => handlePageChange(p)}
                     className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${p === page
                           ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                           : 'border border-base-200 opacity-50 hover:opacity-100 hover:bg-base-200'
                        }`}
                  >
                     {p}
                  </button>
               ))}

               {/* Next */}
               <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
               >
                  <FiChevronRight size={16} />
               </button>
            </div>
         )}

         {/* Modal */}
         {isModalOpen && (
            <div className="modal modal-open" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-lg">
                  <div className="flex flex-col items-center gap-1 text-center">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                        <FiUser size={18} />
                     </div>
                     <h3 className="text-lg font-bold">Yeni şagird</h3>
                     <p className="text-xs opacity-40">Məlumatları doldurun</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                     {fields.map(({ name, label, type, placeholder, icon }) => (
                        <div key={name} className="flex flex-col gap-1">
                           <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">{icon}</span>
                              <input
                                 type={type} name={name} value={formData[name]}
                                 onChange={handleInputChange} placeholder={placeholder}
                                 className="input w-full pl-8 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                        </div>
                     ))}
                  </div>
                  {error && <span className="text-red-400 text-xs text-center">{error}</span>}
                  <div className="flex gap-3 pt-1">
                     <button
                        onClick={handleAddStudent} disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                     >
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button
                        onClick={() => { setIsModalOpen(false); setError(''); }}
                        className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                     >
                        Ləğv et
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default Students;