import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiMail, FiPhone, FiLock, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff, FiX, FiBook, FiUsers, FiEdit2, FiCheck } from 'react-icons/fi';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

// ── Reset Password Block ────────────────────────────────
function ResetPasswordBlock({ id, role }) {
   const [loading, setLoading] = useState(false);
   const [newPassword, setNewPassword] = useState('');
   const [copied, setCopied] = useState(false);
   const [error, setError] = useState('');
   const [confirm, setConfirm] = useState(false);

   const handleReset = async () => {
      try {
         setLoading(true);
         setError('');
         setNewPassword('');
         setCopied(false);
         setConfirm(false);
         const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
         let pwd = '';
         for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
         const endpoint = role === 'teacher'
            ? `/admin/resetTeacherPassword/${id}`
            : `/admin/resetStudentPassword/${id}`;
         await api.patch(endpoint, { password: pwd });
         setNewPassword(pwd);
      } catch (err) {
         setError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setLoading(false);
      }
   };

   const handleCopy = () => {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
      <div className="flex flex-col gap-2 pt-1 border-t border-base-200">
         {!newPassword && !confirm && (
            <button
               onClick={() => setConfirm(true)}
               className="w-full py-2.5 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all duration-200"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
               </svg>
               Parolu Sıfırla
            </button>
         )}

         {confirm && !newPassword && (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
               <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 mt-0.5">
                     <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div className="flex flex-col gap-0.5">
                     <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Əminsiniz?</span>
                     <span className="text-xs text-amber-600 dark:text-amber-500 opacity-80">
                        Parolu sıfırlasanız bu istifadəçi bütün cihazlardan çıxarılacaq.
                     </span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button
                     onClick={handleReset}
                     disabled={loading}
                     className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                  >
                     {loading
                        ? <><span className="loading loading-spinner loading-xs" /> Sıfırlanır...</>
                        : 'Bəli, sıfırla'
                     }
                  </button>
                  <button
                     onClick={() => setConfirm(false)}
                     disabled={loading}
                     className="flex-1 py-2 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200 disabled:opacity-60"
                  >
                     Ləğv et
                  </button>
               </div>
            </div>
         )}

         {newPassword && (
            <div className="flex flex-col gap-2">
               <span className="text-xs opacity-50 ml-1">Yeni parol:</span>
               <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50">
                  <span className="flex-1 text-sm font-mono font-semibold tracking-wider">{newPassword}</span>
                  <button
                     onClick={handleCopy}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${copied
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-base-300 hover:bg-base-200 border border-base-200'
                        }`}
                  >
                     {copied
                        ? <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Kopyalandı</>
                        : <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Kopyala</>
                     }
                  </button>
               </div>
            </div>
         )}

         {error && <span className="text-red-400 text-xs text-center">{error}</span>}
      </div>
   );
}

// ── Teacher Info Modal ──────────────────────────────────
function TeacherInfoModal({ teacher, onClose }) {
   const [groups, setGroups] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!teacher) return;
      setLoading(true);
      setGroups([]);
      api.get(`/admin/getTeacherInfo/${teacher._id}`)
         .then(res => setGroups(res.data ?? []))
         .catch(() => setGroups([]))
         .finally(() => setLoading(false));
   }, [teacher]);

   if (!teacher) return null;

   const initials = `${teacher.name?.charAt(0) ?? ''}${teacher.surname?.charAt(0) ?? ''}`.toUpperCase();

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
                  <span className="text-xs opacity-40">Yüklənir...</span>
               </div>
            ) : (
               <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                           {initials || <FiUser size={18} />}
                        </div>
                        <div>
                           <div className="font-bold text-base">{teacher.name} {teacher.surname}</div>
                           <div className="text-xs opacity-40">{teacher.fatherName}</div>
                        </div>
                     </div>
                     <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                     >
                        <FiX size={15} />
                     </button>
                  </div>

                  {/* Contact info */}
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-40 flex items-center gap-1"><FiUser size={11} /> Ad Soyad Ata adı</span>
                        <span className="text-sm font-semibold">{teacher.name} {teacher.surname} {teacher.fatherName}</span>
                     </div>
                     <div className="w-full h-px bg-base-200" />
                     <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-40 flex items-center gap-1"><FiPhone size={11} /> Telefon</span>
                        <span className="text-sm font-semibold">{teacher.phoneNumber || '—'}</span>
                     </div>
                     <div className="w-full h-px bg-base-200" />
                     <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-40 flex items-center gap-1"><FiMail size={11} /> Email</span>
                        <span className="text-sm font-semibold">{teacher.email || '—'}</span>
                     </div>
                  </div>

                  {/* Groups & subjects */}
                  <div className="flex flex-col gap-2">
                     <div className="text-xs font-semibold opacity-40 flex items-center gap-1">
                        <FiUsers size={11} /> Qruplar və fənlər
                     </div>
                     {groups.length === 0 ? (
                        <div className="text-center opacity-30 py-6 text-sm">Heç bir qrup tapılmadı</div>
                     ) : groups.map((group, gi) => {
                        const groupColors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                        const mySubjects = group.subjects?.filter(item =>
                           item.teacher?.toString() === teacher._id ||
                           item.teacher?._id?.toString() === teacher._id
                        ) ?? [];

                        return (
                           <div key={group._id} className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
                              <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200">
                                 <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${groupColors[gi % groupColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                                    {group.groupNumber}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{group.profession}</div>
                                    <div className="text-xs opacity-30 font-mono">#{group.groupShifr}</div>
                                 </div>
                              </div>
                              <div className="p-3 flex flex-col gap-2">
                                 {mySubjects.length === 0 ? (
                                    <div className="text-xs opacity-30 text-center py-2">Fənn tapılmadı</div>
                                 ) : mySubjects.map((item, si) => {
                                    const subject = item.subject ?? item;
                                    const subColors = ['from-[#8B5CF6] to-[#A78BFA]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#6366F1] to-[#8B5CF6]'];
                                    return (
                                       <div key={subject._id ?? si} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-base-200 bg-base-200/30">
                                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${subColors[si % subColors.length]} flex items-center justify-center text-white shrink-0`}>
                                             <FiBook size={12} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="text-sm font-semibold truncate">{subject.subject ?? '—'}</div>
                                             <div className="flex items-center gap-2 mt-0.5">
                                                {subject.semestr && <span className="text-xs opacity-40">{subject.semestr}-ci semestr</span>}
                                                {subject.kredit && <span className="text-xs opacity-40">{subject.kredit} kredit</span>}
                                                {subject.totalHours && <span className="text-xs opacity-40">{subject.totalHours} saat</span>}
                                             </div>
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
         {!loading && <div className="modal-backdrop" onClick={onClose} />}
      </div>
   );
}

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
   const [infoModal, setInfoModal] = useState(null);
   const [editModal, setEditModal] = useState(null);
   const [editForm, setEditForm] = useState({});
   const [editSubmitting, setEditSubmitting] = useState(false);
   const [editError, setEditError] = useState('');

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

   const openEditTeacher = (teacher) => {
      setEditForm({
         name: teacher.name ?? '',
         surname: teacher.surname ?? '',
         fatherName: teacher.fatherName ?? '',
         username: teacher.username ?? '',
         email: teacher.email ?? '',
         phone: teacher.phoneNumber?.replace('+994', '') ?? '',
      });
      setEditError('');
      setEditModal(teacher);
   };

   const handleEditTeacher = async () => {
      try {
         setEditSubmitting(true);
         setEditError('');
         await api.patch(`/admin/updateTeacherInfo/${editModal._id}`, editForm);
         await fetchTeachers(page);
         setEditModal(null);
      } catch (err) {
         setEditError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setEditSubmitting(false);
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
         setError(err.response?.data?.message || 'Xəta baş verdi');
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

         {error && (
            <div role="alert" className="alert alert-error rounded-xl mb-4">
               <span>{error}</span>
            </div>
         )}

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
                        <div className="w-11 h-11 shrink-0 relative flex items-center justify-center">
                           <div className={`absolute w-9 h-9 bg-gradient-to-br ${colorClass} rotate-45 rounded-lg shadow-md`} />
                           <span className="relative z-10 text-white font-bold text-sm">{initials || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{teacher.name} {teacher.surname}</div>
                           <div className="text-xs opacity-40 mt-0.5 truncate">{teacher.fatherName}</div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                           {teacher.email && <div className="flex items-center gap-1.5 text-xs opacity-40"><FiMail size={12} />{teacher.email}</div>}
                           {teacher.phoneNumber && <div className="flex items-center gap-1.5 text-xs opacity-40"><FiPhone size={12} />{teacher.phoneNumber}</div>}
                        </div>
                        <button
                           onClick={() => openEditTeacher(teacher)}
                           className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
                        >
                           <FiEdit2 size={15} />
                        </button>
                        <button
                           onClick={() => setInfoModal(teacher)}
                           className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                           </svg>
                        </button>
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

         {/* Teacher Info Modal */}
         <TeacherInfoModal teacher={infoModal} onClose={() => setInfoModal(null)} />

         {/* Edit Teacher Modal */}
         {editModal && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-lg overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                  <div className="p-6 flex flex-col gap-5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                              <FiEdit2 size={15} />
                           </div>
                           <div>
                              <h3 className="text-base font-bold">Müəllimi Redaktə Et</h3>
                              <p className="text-xs opacity-40">{editModal.name} {editModal.surname}</p>
                           </div>
                        </div>
                        <button onClick={() => setEditModal(null)} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                           <FiX size={15} />
                        </button>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {[
                           { name: 'name', label: 'Ad' },
                           { name: 'surname', label: 'Soyad' },
                           { name: 'fatherName', label: 'Ata adı' },
                           { name: 'username', label: 'İstifadəçi adı' },
                           { name: 'email', label: 'Email' },
                           { name: 'phone', label: 'Telefon (son 9 rəqəm)' },
                        ].map(({ name, label }) => (
                           <div key={name} className="flex flex-col gap-1">
                              <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                              <input
                                 type={name === 'email' ? 'email' : 'text'}
                                 value={editForm[name] ?? ''}
                                 onChange={e => setEditForm(p => ({ ...p, [name]: e.target.value }))}
                                 className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                        ))}
                     </div>
                     {editError && <span className="text-red-400 text-xs text-center">{editError}</span>}
                     <div className="flex gap-3">
                        <button
                           onClick={handleEditTeacher}
                           disabled={editSubmitting}
                           className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                        >
                           {editSubmitting ? <span className="loading loading-spinner loading-xs" /> : <><FiCheck size={14} /> Yadda saxla</>}
                        </button>
                        <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                           Ləğv et
                        </button>
                     </div>

                     {/* Reset password */}
                     <ResetPasswordBlock id={editModal?._id} role="teacher" />
                  </div>
               </div>
               <div className="modal-backdrop" onClick={() => setEditModal(null)} />
            </div>
         )}

         {/* Create modal */}
         {isModalOpen && (
            <div className="modal modal-open z-40" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-lg">
                  <div className="flex flex-col items-center gap-1 text-center">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                        <FiUser size={18} />
                     </div>
                     <h3 className="text-lg font-bold">Yeni müəllim</h3>
                     <p className="text-xs opacity-40">Məlumatları doldurun</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
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
                           <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity">
                              {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                           </button>
                        </div>
                     </div>

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
                              placeholder="+994 xx xxx xx xx"
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