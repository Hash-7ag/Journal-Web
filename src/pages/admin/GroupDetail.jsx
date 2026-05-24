import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import {
   FiArrowLeft, FiUsers, FiBook, FiUser,
   FiHash, FiLayers, FiPlus, FiTrash2, FiSearch, FiCheck, FiClock, FiX, FiPhone, FiMail,
} from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

function GroupDetail() {
   const { id } = useParams();
   const navigate = useNavigate();

   const [group, setGroup] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [activeTab, setActiveTab] = useState('students');

   const [allStudents, setAllStudents] = useState([]);
   const [allSubjects, setAllSubjects] = useState([]);

   const [studentModal, setStudentModal] = useState(false);
   const [subjectModal, setSubjectModal] = useState(false);

   const [selectedStudents, setSelectedStudents] = useState([]);
   const [selectedSubjects, setSelectedSubjects] = useState([]);

   const [studentSearch, setStudentSearch] = useState('');
   const [subjectSearch, setSubjectSearch] = useState('');

   const [studentPage, setStudentPage] = useState(1);
   const [studentHasMore, setStudentHasMore] = useState(true);
   const [studentLoadingMore, setStudentLoadingMore] = useState(false);

   const [subjectPage, setSubjectPage] = useState(1);
   const [subjectHasMore, setSubjectHasMore] = useState(true);
   const [subjectLoadingMore, setSubjectLoadingMore] = useState(false);

   const [addingStudent, setAddingStudent] = useState(false);
   const [addingSubject, setAddingSubject] = useState(false);
   const [deletingId, setDeletingId] = useState(null);
   const [modalError, setModalError] = useState('');
   const [infoModal, setInfoModal] = useState(null);

   const fetchGroup = async () => {
      try {
         setLoading(true);
         const [groupRes, studentsRes] = await Promise.all([
            api.get(`/admin/getGroupById/${id}`),
            api.get(`/admin/getAssignedyStudents/${id}?page=1&pageSize=999`),
         ]);
         setGroup({
            ...groupRes.data,
            students: (studentsRes.data.data ?? []).map(s => ({ student: s })),
         });
      } catch (err) {
         setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   const fetchAll = async () => {
      try {
         const [studentsRes, subjectsRes] = await Promise.all([
            api.get('/admin/getFreeStudents?page=1&pageSize=10'),
            api.get('/admin/getAllSubjects?page=1&pageSize=10'),
         ]);
         const studentsData = studentsRes.data.data ?? [];
         const subjectsData = subjectsRes.data.data ?? [];
         setAllStudents(studentsData);
         setStudentHasMore(studentsData.length === 10);
         setStudentPage(1);
         setAllSubjects(subjectsData);
         setSubjectHasMore(subjectsData.length === 10);
         setSubjectPage(1);
      } catch (err) {
         console.error(err);
      }
   };

   useEffect(() => {
      fetchGroup();
      fetchAll();
   }, [id]);

   const loadMoreStudents = async () => {
      if (studentLoadingMore || !studentHasMore) return;
      try {
         setStudentLoadingMore(true);
         const nextPage = studentPage + 1;
         const res = await api.get(`/admin/getFreeStudents?page=${nextPage}&pageSize=10`);
         const data = res.data.data ?? [];
         setAllStudents(prev => [...prev, ...data]);
         setStudentPage(nextPage);
         setStudentHasMore(data.length === 10);
      } catch (err) {
         console.error(err);
      } finally {
         setStudentLoadingMore(false);
      }
   };

   const loadMoreSubjects = async () => {
      if (subjectLoadingMore || !subjectHasMore) return;
      try {
         setSubjectLoadingMore(true);
         const nextPage = subjectPage + 1;
         const res = await api.get(`/admin/getAllSubjects?page=${nextPage}&pageSize=10`);
         const data = res.data.data ?? [];
         setAllSubjects(prev => [...prev, ...data]);
         setSubjectPage(nextPage);
         setSubjectHasMore(data.length === 10);
      } catch (err) {
         console.error(err);
      } finally {
         setSubjectLoadingMore(false);
      }
   };

   // ── Add multiple students ──
   const handleAddStudents = async () => {
      if (selectedStudents.length === 0) return;
      try {
         setAddingStudent(true);
         setModalError('');
         await Promise.all(
            selectedStudents.map(studentId =>
               api.patch('/admin/addStudentToGroup', { groupId: id, studentId })
            )
         );
         await fetchGroup();
         await fetchAll();
         setStudentModal(false);
         setSelectedStudents([]);
         setStudentSearch('');
      } catch (err) {
         setModalError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setAddingStudent(false);
      }
   };

   const handleDeleteStudent = async (studentId) => {
      try {
         setDeletingId(studentId);
         await api.patch('/admin/deleteStudentFromGroup', { groupId: id, studentId });
         await fetchGroup();
      } catch (err) {
         console.error(err);
      } finally {
         setDeletingId(null);
      }
   };

   // ── Add multiple subjects ──
   const handleAddSubjects = async () => {
      if (selectedSubjects.length === 0) return;
      try {
         setAddingSubject(true);
         setModalError('');
         await Promise.all(
            selectedSubjects.map(subjectId => {
               const subjectData = allSubjects.find(s => s._id === subjectId);
               const teacherId = subjectData?.teacherId?._id ?? subjectData?.teacherId;
               return api.patch('/admin/addSubjectToGroup', { groupId: id, subjectId, teacherId });
            })
         );
         await fetchGroup();
         setSubjectModal(false);
         setSelectedSubjects([]);
         setSubjectSearch('');
      } catch (err) {
         setModalError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setAddingSubject(false);
      }
   };

   const handleDeleteSubject = async (subjectId) => {
      try {
         setDeletingId(subjectId);
         await api.patch('/admin/deleteSubjectFromGroup', { groupId: id, subjectId });
         await fetchGroup();
      } catch (err) {
         console.error(err);
      } finally {
         setDeletingId(null);
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

   if (!group) return null;

   const students = group.students ?? [];
   const subjects = group.subjects ?? [];

   const existingStudentIds = students.map(item => {
      const s = item.student ?? item;
      return typeof s === 'object' ? s._id : s;
   });

   const existingSubjectIds = subjects.map(item => {
      const s = item.subject ?? item;
      return typeof s === 'object' ? s._id : s;
   });

   const filteredStudents = allStudents
      .filter(s => !existingStudentIds.includes(s._id))
      .filter(s =>
         `${s.name} ${s.surname} ${s.fatherName}`.toLowerCase().includes(studentSearch.toLowerCase())
      );

   const filteredSubjects = allSubjects
      .filter(s => !existingSubjectIds.includes(s._id))
      .filter(s =>
         s.subject?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
         `${s.teacherId?.name} ${s.teacherId?.surname}`.toLowerCase().includes(subjectSearch.toLowerCase())
      );

   const toggleStudent = (id) => {
      setSelectedStudents(prev =>
         prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
   };

   const toggleSubject = (id) => {
      setSelectedSubjects(prev =>
         prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
   };

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200"
         >
            <FiArrowLeft size={15} /> Geri
         </button>

         {/* Hero card */}
         <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden mb-6">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">
                  {group.groupNumber}
               </div>
               <div className="flex-1 flex flex-col gap-3 w-full">
                  <div>
                     <h1 className="text-xl font-bold">{group.profession}</h1>
                     <div className="text-xs opacity-30 font-mono tracking-widest mt-0.5">#{group.groupShifr}</div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     <InfoCard icon={<FiLayers size={13} />} label="Qrup nömrəsi" value={group.groupNumber} />
                     <InfoCard icon={<FiHash size={13} />} label="Şifrə" value={group.groupShifr} />
                     <InfoCard icon={<FiUsers size={13} />} label="Şagird / Fən" value={`${students.length} / ${subjects.length}`} />
                  </div>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 mb-5">
            <TabBtn active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<PiStudent size={15} />} label="Şagirdlər" count={students.length} />
            <TabBtn active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<FiBook size={15} />} label="Dərslər" count={subjects.length} />
         </div>

         {/* ── STUDENTS TAB ── */}
         {activeTab === 'students' && (
            <div>
               <div className="flex justify-end mb-4">
                  <button
                     onClick={() => { setStudentModal(true); setModalError(''); setSelectedStudents([]); setStudentSearch(''); }}
                     className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                  >
                     <FiPlus size={15} /> Şagird əlavə et
                  </button>
               </div>
               {students.length === 0 ? (
                  <EmptyState icon={<PiStudent size={28} />} text="Heç bir şagird tapılmadı" />
               ) : (
                  <div className="flex flex-col gap-2">
                     {students.map((item, index) => {
                        const s = item.student ?? item;
                        const sid = typeof s === 'object' ? s._id : s;
                        const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                        const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                        return (
                           <div key={sid ?? index} className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                                 {initials || <FiUser size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="font-semibold text-sm truncate">{s.name} {s.surname}</div>
                                 {s.fatherName && <div className="text-xs opacity-40 mt-0.5 truncate">{s.fatherName}</div>}
                              </div>
                              <div className="hidden md:flex items-center gap-4 shrink-0">
                                 {s.email && (
                                    <div className="flex items-center gap-1.5 text-xs opacity-40">
                                       <FiMail size={12} />{s.email}
                                    </div>
                                 )}
                                 {s.phoneNumber && (
                                    <div className="flex items-center gap-1.5 text-xs opacity-40">
                                       <FiPhone size={12} />{s.phoneNumber}
                                    </div>
                                 )}
                              </div>
                              <button
                                 onClick={() => setInfoModal(s)}
                                 className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                 </svg>
                              </button>
                              <button
                                 onClick={() => handleDeleteStudent(sid)}
                                 disabled={deletingId === sid}
                                 className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-red-50 hover:border-red-200 hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 disabled:opacity-50"
                              >
                                 {deletingId === sid ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 size={14} />}
                              </button>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}

         {/* ── SUBJECTS TAB ── */}
         {activeTab === 'subjects' && (
            <div>
               <div className="flex justify-end mb-4">
                  <button
                     onClick={() => { setSubjectModal(true); setModalError(''); setSelectedSubjects([]); setSubjectSearch(''); }}
                     className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                  >
                     <FiPlus size={15} /> Fənn əlavə et
                  </button>
               </div>
               {subjects.length === 0 ? (
                  <EmptyState icon={<FiBook size={28} />} text="Heç bir fənn tapılmadı" />
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     {subjects.map((item, index) => {
                        const s = item.subject ?? item;
                        const sid = typeof s === 'object' ? s._id : s;
                        const teacher = item.teacher ?? s.teacherId;
                        return (
                           <div key={sid ?? index} className="group/card bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
                                    <FiBook size={16} />
                                 </div>
                                 <span className="text-sm font-semibold leading-tight flex-1">{s.subject ?? s.name ?? '—'}</span>
                                 <button
                                    onClick={() => handleDeleteSubject(sid)}
                                    disabled={deletingId === sid}
                                    className="opacity-0 group-hover/card:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 disabled:opacity-50"
                                 >
                                    {deletingId === sid ? <span className="loading loading-spinner loading-xs" /> : <FiTrash2 size={13} />}
                                 </button>
                              </div>
                              {teacher && (
                                 <>
                                    <div className="w-full h-px bg-base-200" />
                                    <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                                          <FiUser size={11} />
                                       </div>
                                       <span className="text-xs opacity-60 truncate">{teacher.name} {teacher.surname}</span>
                                    </div>
                                 </>
                              )}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}

         {/* ── STUDENT MODAL ── */}
         {studentModal && (
            <SelectModal
               title="Şagird əlavə et"
               icon={<PiStudent size={18} />}
               search={studentSearch}
               onSearch={setStudentSearch}
               searchPlaceholder="Şagird axtar..."
               onClose={() => setStudentModal(false)}
               onConfirm={handleAddStudents}
               loading={addingStudent}
               error={modalError}
               selectedCount={selectedStudents.length}
               confirmLabel="Əlavə et"
               onLoadMore={loadMoreStudents}
               hasMore={studentHasMore}
               loadingMore={studentLoadingMore}
            >
               {filteredStudents.length === 0 ? (
                  <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
               ) : filteredStudents.map((s, index) => {
                  const isSelected = selectedStudents.includes(s._id);
                  const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                  const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                  return (
                     <button
                        key={s._id}
                        onClick={() => toggleStudent(s._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected
                           ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm'
                           : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'
                           }`}
                     >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : `bg-gradient-to-br ${colors[index % colors.length]}`}`}>
                           {isSelected ? <FiCheck size={15} /> : initials}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{s.name} {s.surname}</div>
                           {s.fatherName && <div className="text-xs opacity-40 truncate">{s.fatherName}</div>}
                        </div>
                        {s.email && <span className="text-xs opacity-30 hidden sm:block truncate max-w-[120px]">{s.email}</span>}
                     </button>
                  );
               })}
            </SelectModal>
         )}

         {/* ── SUBJECT MODAL ── */}
         {subjectModal && (
            <SelectModal
               title="Fənn əlavə et"
               icon={<FiBook size={18} />}
               search={subjectSearch}
               onSearch={setSubjectSearch}
               searchPlaceholder="Fənn və ya müəllim axtar..."
               onClose={() => setSubjectModal(false)}
               onConfirm={handleAddSubjects}
               loading={addingSubject}
               error={modalError}
               selectedCount={selectedSubjects.length}
               confirmLabel="Əlavə et"
               onLoadMore={loadMoreSubjects}
               hasMore={subjectHasMore}
               loadingMore={subjectLoadingMore}
            >
               {filteredSubjects.length === 0 ? (
                  <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
               ) : filteredSubjects.map(s => {
                  const isSelected = selectedSubjects.includes(s._id);
                  const teacher = s.teacherId;
                  return (
                     <button
                        key={s._id}
                        onClick={() => toggleSubject(s._id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected
                           ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm'
                           : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'
                           }`}
                     >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : 'bg-base-300'}`}>
                           {isSelected
                              ? <FiCheck size={16} />
                              : <span className="text-base-content/60 text-sm">{s.subject?.charAt(0).toUpperCase()}</span>
                           }
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{s.subject}</div>
                           {teacher && (
                              <div className="flex items-center gap-1 text-xs opacity-50 mt-0.5">
                                 <FiUser size={10} />{teacher.name} {teacher.surname}
                              </div>
                           )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                           {s.semestr && <span className="text-xs opacity-40">{s.semestr}-ci semestr</span>}
                           <div className="flex items-center gap-2">
                              {s.kredit && <span className="text-xs opacity-40">{s.kredit} kredit</span>}
                              {s.totalHours && (
                                 <div className="flex items-center gap-0.5 text-xs opacity-40">
                                    <FiClock size={10} />{s.totalHours}h
                                 </div>
                              )}
                           </div>
                        </div>
                     </button>
                  );
               })}
            </SelectModal>
         )}

         {/* ── STUDENT INFO MODAL ── */}
         {infoModal && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                  <div className="p-6 flex flex-col gap-5">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                              {infoModal.name?.charAt(0)}{infoModal.surname?.charAt(0)}
                           </div>
                           <div>
                              <div className="font-bold text-base">{infoModal.name} {infoModal.surname}</div>
                              <div className="text-xs opacity-40">{infoModal.fatherName}</div>
                           </div>
                        </div>
                        <button
                           onClick={() => setInfoModal(null)}
                           className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                        >
                           <FiX size={15} />
                        </button>
                     </div>
                     <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs opacity-40 flex items-center gap-1"><FiUser size={11} /> Ad Soyad Ata adı</span>
                           <span className="text-sm font-semibold">{infoModal.name} {infoModal.surname} {infoModal.fatherName}</span>
                        </div>
                        <div className="w-full h-px bg-base-200" />
                        <div className="flex flex-col gap-1">
                           <span className="text-xs opacity-40 flex items-center gap-1"><FiPhone size={11} /> Telefon</span>
                           <span className="text-sm font-semibold">{infoModal.phoneNumber || '—'}</span>
                        </div>
                        <div className="w-full h-px bg-base-200" />
                        <div className="flex flex-col gap-1">
                           <span className="text-xs opacity-40 flex items-center gap-1"><FiMail size={11} /> Email</span>
                           <span className="text-sm font-semibold">{infoModal.email || '—'}</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="modal-backdrop" onClick={() => setInfoModal(null)} />
            </div>
         )}

      </div>
   );
}

// ── Reusable Select Modal ───────────────────────────────
function SelectModal({ title, icon, search, onSearch, searchPlaceholder, onClose, onConfirm, loading, error, selectedCount, confirmLabel, children, onLoadMore, hasMore, loadingMore }) {
   const containerRef = useRef(null);

   const handleScroll = useCallback(() => {
      const el = containerRef.current;
      if (!el || loadingMore || !hasMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
         onLoadMore?.();
      }
   }, [loadingMore, hasMore, onLoadMore]);

   useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
   }, [handleScroll]);

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                     {icon}
                  </div>
                  <div>
                     <h3 className="text-base font-bold">{title}</h3>
                     <p className="text-xs opacity-40">{selectedCount} seçilib</p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
               >
                  <FiX size={15} />
               </button>
            </div>

            {/* Search */}
            <div className="px-6 pb-3">
               <div className="relative">
                  <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                     type="text"
                     value={search}
                     onChange={e => onSearch(e.target.value)}
                     placeholder={searchPlaceholder}
                     className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
               </div>
            </div>

            {/* List */}
            <div ref={containerRef} className="px-6 flex flex-col gap-2 max-h-72 overflow-y-auto pb-2">
               {children}

               {/* Loading more */}
               {loadingMore && (
                  <div className="flex justify-center py-3">
                     <span className="loading loading-spinner loading-sm" style={{ color: '#8B5CF6' }} />
                  </div>
               )}

               {/* End of list */}
               {!hasMore && !loadingMore && (
                  <div className="text-center text-xs opacity-20 py-2">Hamısı yükləndi</div>
               )}
            </div>

            {error && (
               <div className="px-6 pt-2">
                  <span className="text-red-400 text-xs">{error}</span>
               </div>
            )}

            {/* Footer */}
            <div className="px-6 py-5 flex gap-3 border-t border-base-200 mt-3">
               <button
                  onClick={onConfirm}
                  disabled={loading || selectedCount === 0}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-40"
               >
                  {loading ? <span className="loading loading-spinner loading-xs" /> : confirmLabel}
               </button>
               <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
               >
                  Ləğv et
               </button>
            </div>
         </div>
      </div>
   );
}

function InfoCard({ icon, label, value }) {
   return (
      <div className="flex flex-col gap-1 bg-base-200/50 rounded-xl px-4 py-3 border border-base-200">
         <div className="flex items-center gap-1.5 text-xs opacity-40 font-medium">{icon}{label}</div>
         <div className="text-sm font-semibold">{value}</div>
      </div>
   );
}

function TabBtn({ active, onClick, icon, label, count }) {
   return (
      <button
         onClick={onClick}
         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${active
            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
            : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
            }`}
      >
         {icon}{label}
         <span className={`text-xs px-1.5 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-base-300'}`}>{count}</span>
      </button>
   );
}

function EmptyState({ icon, text }) {
   return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
         {icon}<span className="text-sm">{text}</span>
      </div>
   );
}

export default GroupDetail;