import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { FiPlus, FiUsers, FiBook, FiArrowRight, FiSearch, FiCheck, FiUser, FiClock, FiX, FiAlertCircle } from 'react-icons/fi';

const DRAFT_KEY = 'group_creation_draft';

// ── Infinite scroll list ────────────────────────────────
function InfiniteList({ children, loadingMore, hasMore, onLoadMore }) {
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
      <div ref={containerRef} className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
         {children}
         {loadingMore && (
            <div className="flex justify-center py-3">
               <span className="loading loading-spinner loading-sm" style={{ color: '#8B5CF6' }} />
            </div>
         )}
         {!hasMore && !loadingMore && (
            <div className="text-center text-xs opacity-20 py-2">Hamısı yükləndi</div>
         )}
      </div>
   );
}

function Groups() {
   const navigate = useNavigate();

   const [groups, setGroups] = useState([]);

   const [subjects, setSubjects] = useState([]);
   const [subjectPage, setSubjectPage] = useState(1);
   const [subjectHasMore, setSubjectHasMore] = useState(true);
   const [subjectLoadingMore, setSubjectLoadingMore] = useState(false);

   const [students, setStudents] = useState([]);
   const [studentPage, setStudentPage] = useState(1);
   const [studentHasMore, setStudentHasMore] = useState(true);
   const [studentLoadingMore, setStudentLoadingMore] = useState(false);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [step, setStep] = useState(1);
   const [submitting, setSubmitting] = useState(false);

   const [formData, setFormData] = useState({ profession: '', groupNumber: '', groupShifr: '' });
   const [stepError, setStepError] = useState('');

   const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
   const [subjectSearch, setSubjectSearch] = useState('');

   const [selectedStudentIds, setSelectedStudentIds] = useState([]);
   const [studentSearch, setStudentSearch] = useState('');

   const [draftModal, setDraftModal] = useState(false);
   const [draftData, setDraftData] = useState(null);

   // ── Initial fetch ──
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [groupsRes, subjectsRes, studentsRes] = await Promise.all([
               api.get('/admin/getAllGroups'),
               api.get('/admin/getAllSubjects?page=1&pageSize=10'),
               api.get('/admin/getFreeStudents?page=1&pageSize=10'),
            ]);
            setGroups(groupsRes.data.data);

            const subjectsData = subjectsRes.data.data ?? [];
            setSubjects(subjectsData);
            setSubjectHasMore(subjectsData.length === 10);

            const studentsData = studentsRes.data.data ?? [];
            setStudents(studentsData);
            setStudentHasMore(studentsData.length === 10);
         } catch (err) {
            setError(err.message || 'Yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   // ── Load more ──
   const loadMoreSubjects = useCallback(async () => {
      if (subjectLoadingMore || !subjectHasMore) return;
      try {
         setSubjectLoadingMore(true);
         const nextPage = subjectPage + 1;
         const res = await api.get(`/admin/getAllSubjects?page=${nextPage}&pageSize=10`);
         const data = res.data.data ?? [];
         setSubjects(prev => [...prev, ...data]);
         setSubjectPage(nextPage);
         setSubjectHasMore(data.length === 10);
      } catch (err) {
         console.error(err);
      } finally {
         setSubjectLoadingMore(false);
      }
   }, [subjectLoadingMore, subjectHasMore, subjectPage]);

   const loadMoreStudents = useCallback(async () => {
      if (studentLoadingMore || !studentHasMore) return;
      try {
         setStudentLoadingMore(true);
         const nextPage = studentPage + 1;
         const res = await api.get(`/admin/getFreeStudents?page=${nextPage}&pageSize=10`);
         const data = res.data.data ?? [];
         setStudents(prev => [...prev, ...data]);
         setStudentPage(nextPage);
         setStudentHasMore(data.length === 10);
      } catch (err) {
         console.error(err);
      } finally {
         setStudentLoadingMore(false);
      }
   }, [studentLoadingMore, studentHasMore, studentPage]);

   // ── Draft ──
   const handleOpenModal = () => {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
         try {
            const parsed = JSON.parse(raw);
            if (parsed?.profession || parsed?.groupNumber || parsed?.groupShifr) {
               setDraftData(parsed);
               setDraftModal(true);
               return;
            }
         } catch { }
      }
      openFreshModal();
   };

   const openFreshModal = () => {
      setFormData({ profession: '', groupNumber: '', groupShifr: '' });
      setSelectedSubjectIds([]);
      setSelectedStudentIds([]);
      setSubjectSearch('');
      setStudentSearch('');
      setStep(1);
      setStepError('');
      setIsModalOpen(true);
   };

   const continueDraft = () => {
      if (!draftData) return;
      setFormData({
         profession: draftData.profession ?? '',
         groupNumber: draftData.groupNumber ?? '',
         groupShifr: draftData.groupShifr ?? '',
      });
      setSelectedSubjectIds(draftData.selectedSubjectIds ?? []);
      setSelectedStudentIds(draftData.selectedStudentIds ?? []);
      setStep(draftData.step ?? 2);
      setStepError('');
      setDraftModal(false);
      setIsModalOpen(true);
   };

   const discardDraft = () => {
      localStorage.removeItem(DRAFT_KEY);
      setDraftModal(false);
      openFreshModal();
   };

   const saveDraft = (overrides = {}) => {
      const draft = {
         profession: formData.profession,
         groupNumber: formData.groupNumber,
         groupShifr: formData.groupShifr,
         selectedSubjectIds,
         selectedStudentIds,
         step,
         ...overrides,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
   };

   const closeModal = () => {
      if (step >= 2 || (formData.profession && formData.groupNumber && formData.groupShifr)) {
         saveDraft();
      }
      setIsModalOpen(false);
   };

   // ── Steps ──
   const handleStep1Next = () => {
      setStepError('');
      if (!String(formData.profession).trim() || !String(formData.groupNumber).trim() || !String(formData.groupShifr).trim()) {
         setStepError('Bütün sahələri doldurun');
         return;
      }
      saveDraft({ step: 2 });
      setStep(2);
   };

   const handleStep2Next = () => {
      setStep(3);
      saveDraft({ step: 3 });
   };

   // ── Submit ──
   const handleSubmit = async () => {
      try {
         setSubmitting(true);
         setStepError('');

         const selectedSubjectsPayload = selectedSubjectIds.map(id => {
            const s = subjects.find(sub => sub._id === id);
            return {
               subject: id,
               teacher: s?.teacherId?._id ?? s?.teacherId,
            };
         });

         const payload = {
            profession: formData.profession,
            groupNumber: String(formData.groupNumber),
            groupShifr: Number(formData.groupShifr),
            subjects: selectedSubjectsPayload,
            students: selectedStudentIds.map(id => ({ student: id })),
         };

         await api.post('/admin/createGroup', payload);
         localStorage.removeItem(DRAFT_KEY);

         const groupsRes = await api.get('/admin/getAllGroups');
         setGroups(groupsRes.data.data);
         setIsModalOpen(false);
      } catch (err) {
         setStepError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSubmitting(false);
      }
   };

   const toggleSubject = (id) => {
      setSelectedSubjectIds(prev =>
         prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
   };

   const toggleStudent = (id) => {
      setSelectedStudentIds(prev =>
         prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
   };

   const filteredSubjects = subjects.filter(s =>
      s.subject?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.teacherId?.name + ' ' + s.teacherId?.surname)?.toLowerCase().includes(subjectSearch.toLowerCase())
   );

   const filteredStudents = students.filter(s =>
      (s.name + ' ' + s.surname)?.toLowerCase().includes(studentSearch.toLowerCase())
   );

   const groupColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#3B82F6] to-[#8B5CF6]', 'from-[#A78BFA] to-[#60A5FA]',
   ];

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
         </div>
      );
   }

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {error && (
            <div role="alert" className="alert alert-error rounded-xl mb-4">
               <span>{error}</span>
            </div>
         )}

         {/* Page header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Qruplar</h1>
               <p className="text-xs opacity-40 mt-0.5">Bütün qrupların siyahısı</p>
            </div>
            <button
               onClick={handleOpenModal}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} />
               Qrup əlavə et
            </button>
         </div>

         {/* Grid */}
         {groups.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir qrup tapılmadı</div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {groups.map((group, index) => {
                  const colorClass = groupColors[index % groupColors.length];
                  return (
                     <div
                        key={group._id || index}
                        onClick={() => navigate(`/groups/${group._id}`, { state: { group } })}
                        className="group bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                     >
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                           {group.groupNumber}
                        </div>
                        <div className="text-sm font-semibold text-center leading-tight">{group.profession}</div>
                        <div className="text-xs opacity-30 tracking-widest font-mono">#{group.groupShifr}</div>
                        <div className="w-full h-px bg-base-200" />
                        <div className="flex gap-4 w-full justify-center items-center">
                           <div className="flex items-center gap-1 text-xs opacity-50">
                              <FiUsers size={12} />{group.students?.length ?? 0}
                           </div>
                           <div className="flex items-center gap-1 text-xs opacity-50">
                              <FiBook size={12} />{group.subjects?.length ?? 0}
                           </div>
                           <FiArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity duration-200" />
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* ── DRAFT MODAL ── */}
         {draftModal && draftData && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-sm">
                  <div className="flex flex-col items-center gap-2 text-center">
                     <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 mb-1">
                        <FiAlertCircle size={20} />
                     </div>
                     <h3 className="text-base font-bold">Yarımçıq qrup var</h3>
                     <p className="text-xs opacity-50">Əvvəl başladığınız qrup saxlanılıb. Davam etmək istəyirsiniz?</p>
                  </div>
                  <div className="bg-base-200/60 rounded-xl border border-base-200 p-4 flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <span className="text-xs opacity-40">İxtisas</span>
                        <span className="text-sm font-semibold">{draftData.profession || '—'}</span>
                     </div>
                     <div className="w-full h-px bg-base-200" />
                     <div className="flex items-center justify-between">
                        <span className="text-xs opacity-40">Qrup №</span>
                        <span className="text-sm font-semibold">{draftData.groupNumber || '—'}</span>
                     </div>
                     <div className="w-full h-px bg-base-200" />
                     <div className="flex items-center justify-between">
                        <span className="text-xs opacity-40">Şifrə</span>
                        <span className="text-sm font-semibold font-mono">{draftData.groupShifr || '—'}</span>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button onClick={continueDraft} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all duration-200">
                        Davam et
                     </button>
                     <button onClick={discardDraft} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                        Yenidən başla
                     </button>
                  </div>
               </div>
               <div className="modal-backdrop" onClick={() => setDraftModal(false)} />
            </div>
         )}

         {/* ── CREATION MODAL ── */}
         {isModalOpen && (
            <div className="modal modal-open z-40" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col p-0 max-w-lg overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

                  <div className="flex flex-col gap-0 flex-1">

                     {/* Header */}
                     <div className="flex items-center justify-between px-8 pt-7 pb-4">
                        <div>
                           <h3 className="text-lg font-bold">
                              {step === 1 && 'Yeni qrup'}
                              {step === 2 && 'Fənlər seçin'}
                              {step === 3 && 'Şagirdlər seçin'}
                           </h3>
                           <p className="text-xs opacity-40 mt-0.5">
                              {step === 1 && 'Əsas məlumatları doldurun'}
                              {step === 2 && `${selectedSubjectIds.length} fənn seçilib`}
                              {step === 3 && `${selectedStudentIds.length} şagird seçilib`}
                           </p>
                        </div>
                        <button onClick={closeModal} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                           <FiX size={15} />
                        </button>
                     </div>

                     {/* ── STEP 1 ── */}
                     {step === 1 && (
                        <div className="px-8 pb-2 flex flex-col gap-3">
                           <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium opacity-50 ml-1">İxtisas</label>
                              <input
                                 type="text"
                                 value={formData.profession}
                                 onChange={e => setFormData(p => ({ ...p, profession: e.target.value }))}
                                 className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                 placeholder="İxtisas adı"
                              />
                           </div>
                           <div className="flex gap-3">
                              <div className="flex flex-col gap-1 flex-1">
                                 <label className="text-xs font-medium opacity-50 ml-1">Qrup nömrəsi</label>
                                 <input
                                    type="number"
                                    value={formData.groupNumber}
                                    onChange={e => setFormData(p => ({ ...p, groupNumber: e.target.value }))}
                                    className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                    placeholder="Məs: 101"
                                 />
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                 <label className="text-xs font-medium opacity-50 ml-1">Şifrə</label>
                                 <input
                                    type="number"
                                    value={formData.groupShifr}
                                    onChange={e => setFormData(p => ({ ...p, groupShifr: e.target.value }))}
                                    className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                    placeholder="Məs: 240101"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {/* ── STEP 2 — Subjects ── */}
                     {step === 2 && (
                        <div className="px-8 pb-2 flex flex-col gap-3">
                           <div className="relative">
                              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                              <input
                                 type="text"
                                 value={subjectSearch}
                                 onChange={e => setSubjectSearch(e.target.value)}
                                 placeholder="Fənn və ya müəllim axtar..."
                                 className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                           <InfiniteList loadingMore={subjectLoadingMore} hasMore={subjectHasMore} onLoadMore={loadMoreSubjects}>
                              {filteredSubjects.length === 0 ? (
                                 <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
                              ) : filteredSubjects.map(s => {
                                 const isSelected = selectedSubjectIds.includes(s._id);
                                 const teacher = s.teacherId;
                                 return (
                                    <button
                                       key={s._id}
                                       onClick={() => toggleSubject(s._id)}
                                       className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}
                                    >
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : 'bg-base-300'}`}>
                                          {isSelected ? <FiCheck size={16} /> : <span className="text-base-content/50 text-sm">{s.subject?.charAt(0).toUpperCase()}</span>}
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
                           </InfiniteList>
                        </div>
                     )}

                     {/* ── STEP 3 — Students ── */}
                     {step === 3 && (
                        <div className="px-8 pb-2 flex flex-col gap-3">
                           <div className="relative">
                              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                              <input
                                 type="text"
                                 value={studentSearch}
                                 onChange={e => setStudentSearch(e.target.value)}
                                 placeholder="Şagird axtar..."
                                 className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              />
                           </div>
                           <InfiniteList loadingMore={studentLoadingMore} hasMore={studentHasMore} onLoadMore={loadMoreStudents}>
                              {filteredStudents.length === 0 ? (
                                 <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
                              ) : filteredStudents.map((s, index) => {
                                 const isSelected = selectedStudentIds.includes(s._id);
                                 const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                                 const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                                 return (
                                    <button
                                       key={s._id}
                                       onClick={() => toggleStudent(s._id)}
                                       className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}
                                    >
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : `bg-gradient-to-br ${colors[index % colors.length]}`}`}>
                                          {isSelected ? <FiCheck size={16} /> : initials}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-sm truncate">{s.name} {s.surname}</div>
                                          {s.fatherName && <div className="text-xs opacity-40 truncate">{s.fatherName}</div>}
                                       </div>
                                       {s.email && <span className="text-xs opacity-30 hidden sm:block truncate max-w-[120px]">{s.email}</span>}
                                    </button>
                                 );
                              })}
                           </InfiniteList>
                        </div>
                     )}

                     {/* Error */}
                     {stepError && (
                        <div className="px-8 pt-2">
                           <span className="text-red-400 text-xs flex items-center gap-1">
                              <FiAlertCircle size={12} />{stepError}
                           </span>
                        </div>
                     )}

                     {/* Footer */}
                     <div className="px-8 pt-4 pb-7 flex flex-col gap-5 mt-auto">
                        <div className="flex gap-3">
                           {step > 1 && (
                              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                                 Geri
                              </button>
                           )}
                           {step < 3 && (
                              <button
                                 onClick={step === 1 ? handleStep1Next : handleStep2Next}
                                 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                              >
                                 Davam
                              </button>
                           )}
                           {step === 3 && (
                              <button
                                 onClick={handleSubmit}
                                 disabled={submitting}
                                 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                              >
                                 {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Qrup yarat'}
                              </button>
                           )}
                        </div>

                        {/* Step indicators */}
                        <div className="flex items-center justify-center gap-2">
                           {[1, 2, 3].map(n => (
                              <div
                                 key={n}
                                 className={`rounded-full transition-all duration-300 ${n === step ? 'w-6 h-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : n < step ? 'w-2.5 h-2.5 bg-[#8B5CF6] opacity-60' : 'w-2.5 h-2.5 bg-base-300'}`}
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="modal-backdrop" onClick={closeModal} />
            </div>
         )}
      </div>
   );
}

export default Groups;