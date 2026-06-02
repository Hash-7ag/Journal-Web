import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { FiArrowLeft, FiUsers, FiBook, FiHash, FiLayers, FiPlus, FiCheck, FiClock, FiUser, FiX } from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

import InfoCard from '../../components/ui/InfoCard';
import TabBtn from '../../components/ui/TabBtn';
import EmptyState from '../../components/ui/EmptyState';
import SelectModal from '../../components/ui/SelectModal';
import StudentRow from '../../components/group/StudentRow';
import SubjectCard from '../../components/group/SubjectCard';
import StudentInfoModal from '../../components/group/StudentInfoModal';

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
      } catch (err) { console.error(err); }
   };

   useEffect(() => { fetchGroup(); fetchAll(); }, [id]);

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
      } catch (err) { console.error(err); }
      finally { setStudentLoadingMore(false); }
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
      } catch (err) { console.error(err); }
      finally { setSubjectLoadingMore(false); }
   };

   const handleAddStudents = async () => {
      if (selectedStudents.length === 0) return;
      try {
         setAddingStudent(true);
         setModalError('');
         await Promise.all(selectedStudents.map(studentId => api.patch('/admin/addStudentToGroup', { groupId: id, studentId })));
         await fetchGroup(); await fetchAll();
         setStudentModal(false); setSelectedStudents([]); setStudentSearch('');
      } catch (err) { setModalError(err.response?.data?.message || 'Xəta baş verdi'); }
      finally { setAddingStudent(false); }
   };

   const handleDeleteStudent = async (studentId) => {
      try {
         setDeletingId(studentId);
         await api.patch('/admin/deleteStudentFromGroup', { groupId: id, studentId });
         await fetchGroup();
      } catch (err) { console.error(err); }
      finally { setDeletingId(null); }
   };

   const handleAddSubjects = async () => {
      if (selectedSubjects.length === 0) return;
      try {
         setAddingSubject(true);
         setModalError('');
         await Promise.all(selectedSubjects.map(subjectId => {
            const subjectData = allSubjects.find(s => s._id === subjectId);
            const teacherId = subjectData?.teacherId?._id ?? subjectData?.teacherId;
            return api.patch('/admin/addSubjectToGroup', { groupId: id, subjectId, teacherId });
         }));
         await fetchGroup();
         setSubjectModal(false); setSelectedSubjects([]); setSubjectSearch('');
      } catch (err) { setModalError(err.response?.data?.message || 'Xəta baş verdi'); }
      finally { setAddingSubject(false); }
   };

   const handleDeleteSubject = async (subjectId) => {
      try {
         setDeletingId(subjectId);
         await api.patch('/admin/deleteSubjectFromGroup', { groupId: id, subjectId });
         await fetchGroup();
      } catch (err) { console.error(err); }
      finally { setDeletingId(null); }
   };

   if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]"><span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} /></div>;
   if (error) return <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]"><div role="alert" className="alert alert-error max-w-sm rounded-xl"><span>{error}</span></div></div>;
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
      .filter(s => `${s.name} ${s.surname} ${s.fatherName}`.toLowerCase().includes(studentSearch.toLowerCase()));

   const filteredSubjects = allSubjects
      .filter(s => !existingSubjectIds.includes(s._id))
      .filter(s => s.subject?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
         `${s.teacherId?.name} ${s.teacherId?.surname}`.toLowerCase().includes(subjectSearch.toLowerCase()));

   const toggleStudent = (sid) => setSelectedStudents(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
   const toggleSubject = (sid) => setSelectedSubjects(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200">
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

         {/* Students tab */}
         {activeTab === 'students' && (
            <div>
               <div className="flex justify-end mb-4">
                  <button onClick={() => { setStudentModal(true); setModalError(''); setSelectedStudents([]); setStudentSearch(''); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200">
                     <FiPlus size={15} /> Şagird əlavə et
                  </button>
               </div>
               {students.length === 0 ? (
                  <EmptyState icon={<PiStudent size={28} />} text="Heç bir şagird tapılmadı" />
               ) : (
                  <div className="flex flex-col gap-2">
                     {students.map((item, index) => (
                        <StudentRow key={index} student={item} index={index} deletingId={deletingId} onInfo={setInfoModal} onDelete={handleDeleteStudent} />
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* Subjects tab */}
         {activeTab === 'subjects' && (
            <div>
               <div className="flex justify-end mb-4">
                  <button onClick={() => { setSubjectModal(true); setModalError(''); setSelectedSubjects([]); setSubjectSearch(''); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200">
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
                        return <SubjectCard key={sid ?? index} item={item} deletingId={deletingId} onDelete={handleDeleteSubject} onClick={() => navigate(`/groups/${id}/${sid}`)} />;
                     })}
                  </div>
               )}
            </div>
         )}

         {/* Student modal */}
         {studentModal && (
            <SelectModal title="Şagird əlavə et" icon={<PiStudent size={18} />} search={studentSearch} onSearch={setStudentSearch} searchPlaceholder="Şagird axtar..." onClose={() => setStudentModal(false)} onConfirm={handleAddStudents} loading={addingStudent} error={modalError} selectedCount={selectedStudents.length} confirmLabel="Əlavə et" onLoadMore={loadMoreStudents} hasMore={studentHasMore} loadingMore={studentLoadingMore}>
               {filteredStudents.length === 0 ? (
                  <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
               ) : filteredStudents.map((s, index) => {
                  const isSelected = selectedStudents.includes(s._id);
                  const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                  const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                  return (
                     <button key={s._id} onClick={() => toggleStudent(s._id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}>
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

         {/* Subject modal */}
         {subjectModal && (
            <SelectModal title="Fənn əlavə et" icon={<FiBook size={18} />} search={subjectSearch} onSearch={setSubjectSearch} searchPlaceholder="Fənn və ya müəllim axtar..." onClose={() => setSubjectModal(false)} onConfirm={handleAddSubjects} loading={addingSubject} error={modalError} selectedCount={selectedSubjects.length} confirmLabel="Əlavə et" onLoadMore={loadMoreSubjects} hasMore={subjectHasMore} loadingMore={subjectLoadingMore}>
               {filteredSubjects.length === 0 ? (
                  <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
               ) : filteredSubjects.map(s => {
                  const isSelected = selectedSubjects.includes(s._id);
                  const teacher = s.teacherId;
                  return (
                     <button key={s._id} onClick={() => toggleSubject(s._id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : 'bg-base-300'}`}>
                           {isSelected ? <FiCheck size={16} /> : <span className="text-base-content/60 text-sm">{s.subject?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{s.subject}</div>
                           {teacher && <div className="flex items-center gap-1 text-xs opacity-50 mt-0.5"><FiUser size={10} />{teacher.name} {teacher.surname}</div>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                           {s.semestr && <span className="text-xs opacity-40">{s.semestr}-ci semestr</span>}
                           <div className="flex items-center gap-2">
                              {s.kredit && <span className="text-xs opacity-40">{s.kredit} kredit</span>}
                              {s.totalHours && <div className="flex items-center gap-0.5 text-xs opacity-40"><FiClock size={10} />{s.totalHours}h</div>}
                           </div>
                        </div>
                     </button>
                  );
               })}
            </SelectModal>
         )}

         <StudentInfoModal student={infoModal} onClose={() => setInfoModal(null)} />
      </div>
   );
}

export default GroupDetail;