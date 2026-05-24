import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiClock, FiBook, FiChevronLeft, FiChevronRight, FiX, FiEdit2, FiCheck, FiSearch } from 'react-icons/fi';

// ── Subject Info & Edit Modal ───────────────────────────
function SubjectModal({ subject, teachers, onClose, onUpdated }) {
   const [editMode, setEditMode] = useState(false);
   const [teacherMode, setTeacherMode] = useState(false);
   const [formData, setFormData] = useState({
      subject: subject.subject ?? '',
      semestr: subject.semestr ?? '',
      kredit: subject.kredit ?? '',
      totalHours: subject.totalHours ?? '',
   });
   const [submitting, setSubmitting] = useState(false);
   const [switchingTeacher, setSwitchingTeacher] = useState(false);
   const [error, setError] = useState('');
   const [teacherSearch, setTeacherSearch] = useState('');

   const currentTeacher = teachers.find(t => t._id === subject.teacherId?._id || t._id === subject.teacherId);
   const availableTeachers = teachers.filter(t => t._id !== (subject.teacherId?._id ?? subject.teacherId));
   const filteredTeachers = availableTeachers.filter(t =>
      `${t.name} ${t.surname}`.toLowerCase().includes(teacherSearch.toLowerCase())
   );

   const handleUpdate = async () => {
      try {
         setSubmitting(true);
         setError('');
         await api.patch(`/admin/updateSubject/${subject._id}`, {
            subject: formData.subject,
            semestr: Number(formData.semestr),
            kredit: Number(formData.kredit),
            totalHours: Number(formData.totalHours),
         });
         onUpdated();
         setEditMode(false);
      } catch (err) {
         setError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSubmitting(false);
      }
   };

   const handleSwitchTeacher = async (teacherId) => {
      try {
         setSwitchingTeacher(teacherId);
         setError('');
         await api.patch(`/admin/switchSubjectTeacher/${subject._id}`, { teacherId });
         onUpdated();
         onClose();
      } catch (err) {
         setError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSwitchingTeacher(false);
      }
   };

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

               {/* Header */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
                        <FiBook size={16} />
                     </div>
                     <div>
                        <div className="font-bold text-base">{subject.subject}</div>
                        <div className="text-xs opacity-40">{subject.semestr}-ci semestr · {subject.kredit} kredit · {subject.totalHours} saat</div>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0">
                     <FiX size={15} />
                  </button>
               </div>

               {/* Teacher section */}
               {!teacherMode ? (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40 flex items-center gap-1"><FiUser size={11} /> Müəllim</span>
                        <button
                           onClick={() => setTeacherMode(true)}
                           className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-base-200 text-xs font-semibold opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                        >
                           <FiEdit2 size={11} /> Müəllimi Dəyiş
                        </button>
                     </div>
                     {currentTeacher ? (
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                              {currentTeacher.name?.charAt(0)}{currentTeacher.surname?.charAt(0)}
                           </div>
                           <div>
                              <div className="font-semibold text-sm">{currentTeacher.name} {currentTeacher.surname}</div>
                              <div className="text-xs opacity-40">{currentTeacher.fatherName}</div>
                           </div>
                        </div>
                     ) : (
                        <div className="text-sm opacity-30">Müəllim tapılmadı</div>
                     )}
                  </div>
               ) : (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40">Yeni müəllim seçin</span>
                        <button onClick={() => setTeacherMode(false)} className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                           <FiX size={14} />
                        </button>
                     </div>
                     {/* Search UI */}
                     <div className="relative">
                        <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <input
                           type="text"
                           value={teacherSearch}
                           onChange={e => setTeacherSearch(e.target.value)}
                           placeholder="Müəllim axtar..."
                           className="input w-full pl-8 pr-4 py-2 rounded-xl border border-base-200 bg-base-100 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                        />
                     </div>
                     <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {filteredTeachers.length === 0 ? (
                           <div className="text-center opacity-30 py-4 text-sm">Heç nə tapılmadı</div>
                        ) : filteredTeachers.map(t => (
                           <button
                              key={t._id}
                              onClick={() => handleSwitchTeacher(t._id)}
                              disabled={!!switchingTeacher}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-base-200 hover:border-[#8B5CF6]/40 hover:bg-gradient-to-r hover:from-[#8B5CF6]/10 hover:to-[#3B82F6]/10 text-left transition-all duration-200 disabled:opacity-50"
                           >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                                 {t.name?.charAt(0)}{t.surname?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="font-semibold text-sm truncate">{t.name} {t.surname}</div>
                                 <div className="text-xs opacity-40 truncate">{t.fatherName}</div>
                              </div>
                              {switchingTeacher === t._id && (
                                 <span className="loading loading-spinner loading-xs" style={{ color: '#8B5CF6' }} />
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Edit subject info */}
               {!editMode ? (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40">Fənn məlumatları</span>
                        <button
                           onClick={() => setEditMode(true)}
                           className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-base-200 text-xs font-semibold opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                        >
                           <FiEdit2 size={11} /> Redaktə Et
                        </button>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        {[
                           { label: 'Fənn adı', value: subject.subject },
                           { label: 'Semestr', value: subject.semestr },
                           { label: 'Kredit', value: subject.kredit },
                           { label: 'Saat', value: subject.totalHours },
                        ].map(({ label, value }) => (
                           <div key={label} className="flex flex-col gap-0.5">
                              <span className="text-xs opacity-40">{label}</span>
                              <span className="text-sm font-semibold">{value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40">Redaktə</span>
                        <button onClick={() => setEditMode(false)} className="text-xs opacity-40 hover:opacity-100 transition-opacity">
                           <FiX size={14} />
                        </button>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs opacity-50 ml-1">Fənn adı</label>
                        <input
                           type="text"
                           value={formData.subject}
                           onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-100 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                        />
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {[
                           { name: 'semestr', label: 'Semestr' },
                           { name: 'kredit', label: 'Kredit' },
                           { name: 'totalHours', label: 'Saat' },
                        ].map(({ name, label }) => (
                           <div key={name} className="flex flex-col gap-1">
                              <label className="text-xs opacity-50 ml-1">{label}</label>
                              <input
                                 type="number"
                                 value={formData[name]}
                                 onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))}
                                 className="input w-full pl-3 pr-2 py-2.5 rounded-xl border border-base-200 bg-base-100 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                 min={1}
                              />
                           </div>
                        ))}
                     </div>
                     {error && <span className="text-red-400 text-xs">{error}</span>}
                     <div className="flex gap-2">
                        <button
                           onClick={handleUpdate}
                           disabled={submitting}
                           className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                        >
                           {submitting ? <span className="loading loading-spinner loading-xs" /> : <><FiCheck size={13} /> Yadda saxla</>}
                        </button>
                        <button onClick={() => setEditMode(false)} className="flex-1 py-2 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                           Ləğv et
                        </button>
                     </div>
                  </div>
               )}

               {error && !editMode && <span className="text-red-400 text-xs text-center">{error}</span>}
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

function Subjects() {
   const [subjects, setSubjects] = useState([]);
   const [teachers, setTeachers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedSubject, setSelectedSubject] = useState(null);
   const [formData, setFormData] = useState({
      teacherId: '', subject: '', semestr: '', kredit: '', totalHours: '',
   });
   const [submitting, setSubmitting] = useState(false);

   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const pageSize = 10;

   const fetchSubjects = async (pageNum = 1) => {
      try {
         setLoading(true);
         const response = await api.get(`/admin/getAllSubjects?page=${pageNum}&pageSize=${pageSize}`);
         setSubjects(response.data.data);
         setTotalPages(response.data.totalPages);
         setTotal(response.data.total);
      } catch (err) {
         setError(err.message || 'Yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const fetchTeachers = async () => {
         try {
            const res = await api.get('/admin/getAllTeachers?pageSize=999');
            setTeachers(res.data.data);
         } catch (err) {
            console.error(err);
         }
      };
      fetchTeachers();
   }, []);

   useEffect(() => { fetchSubjects(page); }, [page]);

   const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleAddSubject = async () => {
      const required = ['teacherId', 'subject', 'semestr', 'kredit', 'totalHours'];
      const missing = required.filter(field => !String(formData[field]).trim());
      if (missing.length) {
         setError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
         return;
      }
      try {
         setSubmitting(true);
         await api.post('/admin/createSubject', {
            ...formData,
            semestr: Number(formData.semestr),
            kredit: Number(formData.kredit),
            totalHours: Number(formData.totalHours),
         });
         setIsModalOpen(false);
         setFormData({ teacherId: '', subject: '', semestr: '', kredit: '', totalHours: '' });
         setError('');
         fetchSubjects(page);
      } catch (err) {
         setError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSubmitting(false);
      }
   };

   const getTeacherName = (teacherId) => {
      const teacher = teachers.find(t => t._id === teacherId?._id || t._id === teacherId);
      return teacher ? `${teacher.name} ${teacher.surname}` : '—';
   };

   const subjectColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]', 'from-[#3B82F6] to-[#8B5CF6]',
   ];

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Fənlər</h1>
               <p className="text-xs opacity-40 mt-0.5">Cəmi {total} fənn · Səhifə {page} / {totalPages}</p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} /> Fənn əlavə et
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
         ) : subjects.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir fənn tapılmadı</div>
         ) : (
            <div className="flex flex-col gap-3">
               {subjects.map((subject, index) => {
                  const globalIndex = (page - 1) * pageSize + index;
                  const colorClass = subjectColors[globalIndex % subjectColors.length];
                  return (
                     <div
                        key={subject._id || index}
                        className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
                     >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}>
                           {subject.subject?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{subject.subject}</div>
                           <div className="flex items-center gap-1 text-xs opacity-40 mt-0.5">
                              <FiUser size={11} />
                              {getTeacherName(subject.teacherId)}
                           </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 shrink-0">
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs opacity-30">Semestr</span>
                              <span className="text-sm font-semibold">{subject.semestr}</span>
                           </div>
                           <div className="w-px h-8 bg-base-200" />
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs opacity-30">Kredit</span>
                              <span className="text-sm font-semibold">{subject.kredit}</span>
                           </div>
                           <div className="w-px h-8 bg-base-200" />
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs opacity-30 flex items-center gap-1"><FiClock size={10} /> Saat</span>
                              <span className="text-sm font-semibold">{subject.totalHours}</span>
                           </div>
                        </div>
                        <button
                           onClick={() => setSelectedSubject(subject)}
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

         {/* Subject Info Modal */}
         {selectedSubject && (
            <SubjectModal
               subject={selectedSubject}
               teachers={teachers}
               onClose={() => setSelectedSubject(null)}
               onUpdated={() => {
                  fetchSubjects(page);
                  setSelectedSubject(null);
               }}
            />
         )}

         {/* Create Modal */}
         {isModalOpen && (
            <div className="modal modal-open z-40" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8">
                  <div className="flex flex-col items-center gap-1 text-center">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                        <FiBook size={18} />
                     </div>
                     <h3 className="text-lg font-bold">Yeni fənn</h3>
                     <p className="text-xs opacity-40">Məlumatları doldurun</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Müəllim</label>
                        <select
                           name="teacherId" value={formData.teacherId} onChange={handleInputChange}
                           className="select w-full rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                        >
                           <option disabled value="">Müəllim seçin</option>
                           {teachers.map(teacher => (
                              <option key={teacher._id} value={teacher._id}>
                                 {teacher.name} {teacher.surname}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Fənnin adı</label>
                        <input
                           type="text" name="subject" value={formData.subject} onChange={handleInputChange}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder="Məs: Riyaziyyat"
                        />
                     </div>
                     <div className="flex gap-3">
                        {[
                           { name: 'semestr', label: 'Semestr', placeholder: '1' },
                           { name: 'kredit', label: 'Kredit', placeholder: '3' },
                           { name: 'totalHours', label: 'Saat', placeholder: '60' },
                        ].map(({ name, label, placeholder }) => (
                           <div key={name} className="flex flex-col gap-1 flex-1">
                              <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                              <input
                                 type="number" name={name} value={formData[name]} onChange={handleInputChange}
                                 className="input w-full pl-4 pr-2 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                 placeholder={placeholder} min={1}
                              />
                           </div>
                        ))}
                     </div>
                  </div>
                  {error && <span className="text-red-400 text-xs text-center">{error}</span>}
                  <div className="flex gap-3 pt-1">
                     <button onClick={handleAddSubject} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60">
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button onClick={() => { setIsModalOpen(false); setError(''); }} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                        Ləğv et
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default Subjects;