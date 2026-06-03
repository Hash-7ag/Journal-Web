import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { FiPlus } from 'react-icons/fi';

import GroupCard from '../../components/group/GroupCard';
import EditGroupModal from '../../components/group/EditGroupModal';
import DraftModal from '../../components/group/DraftModal';
import CreateGroupModal from '../../components/group/CreateGroupModal';

const DRAFT_KEY = 'group_creation_draft';

function Groups() {
   const navigate = useNavigate();

   const [groups, setGroups] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const [subjects, setSubjects] = useState([]);
   const [subjectPage, setSubjectPage] = useState(1);
   const [subjectHasMore, setSubjectHasMore] = useState(true);
   const [subjectLoadingMore, setSubjectLoadingMore] = useState(false);

   const [students, setStudents] = useState([]);
   const [studentPage, setStudentPage] = useState(1);
   const [studentHasMore, setStudentHasMore] = useState(true);
   const [studentLoadingMore, setStudentLoadingMore] = useState(false);

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

   const [editModal, setEditModal] = useState(null);
   const [editForm, setEditForm] = useState({ profession: '', groupNumber: '', groupShifr: '' });
   const [editSubmitting, setEditSubmitting] = useState(false);
   const [editError, setEditError] = useState('');

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
      } catch (err) { console.error(err); }
      finally { setSubjectLoadingMore(false); }
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
      } catch (err) { console.error(err); }
      finally { setStudentLoadingMore(false); }
   }, [studentLoadingMore, studentHasMore, studentPage]);

   const handleOpenModal = () => {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
         try {
            const parsed = JSON.parse(raw);
            if (parsed?.profession || parsed?.groupNumber || parsed?.groupShifr) {
               setDraftData(parsed); setDraftModal(true); return;
            }
         }
         catch {
            //error
         }
      }
      openFreshModal();
   };

   const openFreshModal = () => {
      setFormData({ profession: '', groupNumber: '', groupShifr: '' });
      setSelectedSubjectIds([]); setSelectedStudentIds([]);
      setSubjectSearch(''); setStudentSearch('');
      setStep(1); setStepError('');
      setIsModalOpen(true);
   };

   const saveDraft = (overrides = {}) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
         profession: formData.profession, groupNumber: formData.groupNumber,
         groupShifr: formData.groupShifr, selectedSubjectIds, selectedStudentIds, step, ...overrides,
      }));
   };

   const closeModal = () => {
      if (step >= 2 || (formData.profession && formData.groupNumber && formData.groupShifr)) saveDraft();
      setIsModalOpen(false);
   };

   const handleStep1Next = () => {
      setStepError('');
      if (!String(formData.profession).trim() || !String(formData.groupNumber).trim() || !String(formData.groupShifr).trim()) {
         setStepError('Bütün sahələri doldurun'); return;
      }
      saveDraft({ step: 2 }); setStep(2);
   };

   const handleStep2Next = () => { setStep(3); saveDraft({ step: 3 }); };

   const handleSubmit = async () => {
      try {
         setSubmitting(true); setStepError('');
         const selectedSubjectsPayload = selectedSubjectIds.map(id => {
            const s = subjects.find(sub => sub._id === id);
            return { subject: id, teacher: s?.teacherId?._id ?? s?.teacherId };
         });
         await api.post('/admin/createGroup', {
            profession: formData.profession,
            groupNumber: String(formData.groupNumber),
            groupShifr: Number(formData.groupShifr),
            subjects: selectedSubjectsPayload,
            students: selectedStudentIds.map(id => ({ student: id })),
         });
         localStorage.removeItem(DRAFT_KEY);
         const groupsRes = await api.get('/admin/getAllGroups');
         setGroups(groupsRes.data.data);
         setIsModalOpen(false);
      } catch (err) { setStepError(err.response?.data?.message || 'Xəta baş verdi'); }
      finally { setSubmitting(false); }
   };

   const openEditGroup = (e, group) => {
      e.stopPropagation();
      setEditForm({ profession: group.profession ?? '', groupNumber: group.groupNumber ?? '', groupShifr: group.groupShifr ?? '' });
      setEditError(''); setEditModal(group);
   };

   const handleEditGroup = async () => {
      try {
         setEditSubmitting(true); setEditError('');
         await api.patch(`/admin/updateGroup/${editModal._id}`, editForm);
         const groupsRes = await api.get('/admin/getAllGroups');
         setGroups(groupsRes.data.data); setEditModal(null);
      } catch (err) { setEditError(err.response?.data?.message || 'Xəta baş verdi'); }
      finally { setEditSubmitting(false); }
   };

   const filteredSubjects = subjects.filter(s =>
      s.subject?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.teacherId?.name + ' ' + s.teacherId?.surname)?.toLowerCase().includes(subjectSearch.toLowerCase())
   );
   const filteredStudents = students.filter(s =>
      (s.name + ' ' + s.surname)?.toLowerCase().includes(studentSearch.toLowerCase())
   );

   if (loading) return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
         <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
      </div>
   );

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
         {error && <div role="alert" className="alert alert-error rounded-xl mb-4"><span>{error}</span></div>}

         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Qruplar</h1>
               <p className="text-xs opacity-40 mt-0.5">Bütün qrupların siyahısı</p>
            </div>
            <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200">
               <FiPlus size={16} /> Qrup əlavə et
            </button>
         </div>

         {groups.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir qrup tapılmadı</div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {groups.map((group, index) => (
                  <GroupCard
                     key={group._id || index}
                     group={group}
                     index={index}
                     onClick={() => navigate(`/groups/${group._id}`, { state: { group } })}
                     onEdit={openEditGroup}
                  />
               ))}
            </div>
         )}

         <EditGroupModal
            group={editModal}
            form={editForm}
            onFormChange={(field, val) => setEditForm(p => ({ ...p, [field]: val }))}
            onSave={handleEditGroup}
            onClose={() => setEditModal(null)}
            submitting={editSubmitting}
            error={editError}
         />

         <DraftModal
            draftData={draftModal ? draftData : null}
            onContinue={() => {
               if (!draftData) return;
               setFormData({ profession: draftData.profession ?? '', groupNumber: draftData.groupNumber ?? '', groupShifr: draftData.groupShifr ?? '' });
               setSelectedSubjectIds(draftData.selectedSubjectIds ?? []);
               setSelectedStudentIds(draftData.selectedStudentIds ?? []);
               setStep(draftData.step ?? 2);
               setStepError(''); setDraftModal(false); setIsModalOpen(true);
            }}
            onDiscard={() => { localStorage.removeItem(DRAFT_KEY); setDraftModal(false); openFreshModal(); }}
            onClose={() => setDraftModal(false)}
         />

         {isModalOpen && (
            <CreateGroupModal
               step={step}
               formData={formData}
               onFormChange={(field, val) => setFormData(p => ({ ...p, [field]: val }))}
               stepError={stepError}
               onClose={closeModal}
               selectedSubjectIds={selectedSubjectIds}
               subjectSearch={subjectSearch}
               onSubjectSearch={setSubjectSearch}
               filteredSubjects={filteredSubjects}
               onToggleSubject={id => setSelectedSubjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
               subjectLoadingMore={subjectLoadingMore}
               subjectHasMore={subjectHasMore}
               onLoadMoreSubjects={loadMoreSubjects}
               selectedStudentIds={selectedStudentIds}
               studentSearch={studentSearch}
               onStudentSearch={setStudentSearch}
               filteredStudents={filteredStudents}
               onToggleStudent={id => setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
               studentLoadingMore={studentLoadingMore}
               studentHasMore={studentHasMore}
               onLoadMoreStudents={loadMoreStudents}
               onStep1Next={handleStep1Next}
               onStep2Next={handleStep2Next}
               onBack={() => setStep(s => s - 1)}
               onSubmit={handleSubmit}
               submitting={submitting}
            />
         )}
      </div>
   );
}

export default Groups;