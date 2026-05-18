import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import {
   FiArrowLeft, FiUsers, FiBook, FiUser,
   FiHash, FiLayers, FiPlus, FiTrash2,
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

   const [selectedStudent, setSelectedStudent] = useState('');
   const [selectedSubject, setSelectedSubject] = useState('');

   const [addingStudent, setAddingStudent] = useState(false);
   const [addingSubject, setAddingSubject] = useState(false);
   const [deletingId, setDeletingId] = useState(null);
   const [modalError, setModalError] = useState('');

   // Qrupu ID ilə yüklə
   const fetchGroup = async () => {
      try {
         setLoading(true);
         const res = await api.get(`/admin/getGroupById/${id}`);
         setGroup(res.data);
      } catch (err) {
         setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   // Modal üçün bütün tələbə və fənləri yüklə
   const fetchAll = async () => {
      try {
         const [studentsRes, subjectsRes] = await Promise.all([
            api.get('/admin/getAllStudents'),
            api.get('/admin/getAllSubjects'),
         ]);
         setAllStudents(studentsRes.data.data ?? studentsRes.data);
         setAllSubjects(subjectsRes.data.data ?? subjectsRes.data);
      } catch (err) {
         console.error(err);
      }
   };

   useEffect(() => {
      fetchGroup();
      fetchAll();
   }, [id]);

   const handleAddStudent = async () => {
      if (!selectedStudent) return;
      try {
         setAddingStudent(true);
         setModalError('');
         await api.patch('/admin/addStudentToGroup', { groupId: id, studentId: selectedStudent });
         await fetchGroup(); // yenilənmiş qrupu gətir
         setStudentModal(false);
         setSelectedStudent('');
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

   const handleAddSubject = async () => {
      if (!selectedSubject) return;
      try {
         setAddingSubject(true);
         setModalError('');
         const subjectData = allSubjects.find(s => s._id === selectedSubject);
         const teacherId = subjectData?.teacherId?._id ?? subjectData?.teacherId;
         await api.patch('/admin/addSubjectToGroup', { groupId: id, subjectId: selectedSubject, teacherId });
         await fetchGroup();
         setSubjectModal(false);
         setSelectedSubject('');
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

   // Artıq qrupda olan ID-lər — modal filtri üçün
   const existingStudentIds = students.map(item => {
      const s = item.student ?? item;
      return typeof s === 'object' ? s._id : s;
   });

   const existingSubjectIds = subjects.map(item => {
      const s = item.subject ?? item;
      return typeof s === 'object' ? s._id : s;
   });

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Geri */}
         <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200"
         >
            <FiArrowLeft size={15} />
            Geri
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
                  <button
                     onClick={() => { setStudentModal(true); setModalError(''); setSelectedStudent(''); }}
                     className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                  >
                     <FiPlus size={15} />
                     Şagird əlavə et
                  </button>
               </div>
               {students.length === 0 ? (
                  <EmptyState icon={<PiStudent size={28} />} text="Heç bir şagird tapılmadı" />
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                     {students.map((item, index) => {
                        // getGroupById populate edir: item.student — tam obyekt
                        const s = item.student ?? item;
                        const sid = typeof s === 'object' ? s._id : s;
                        const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                        return (
                           <div key={sid ?? index} className="group/card bg-base-100 border border-base-200 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                                 {initials || <FiUser size={14} />}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                 <span className="text-sm font-semibold truncate">{s.name} {s.surname}</span>
                                 {s.email && <span className="text-xs opacity-40 truncate">{s.email}</span>}
                              </div>
                              <button
                                 onClick={() => handleDeleteStudent(sid)}
                                 disabled={deletingId === sid}
                                 className="opacity-0 group-hover/card:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 disabled:opacity-50"
                              >
                                 {deletingId === sid
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : <FiTrash2 size={13} />}
                              </button>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}

         {/* Subjects tab */}
         {activeTab === 'subjects' && (
            <div>
               <div className="flex justify-end mb-4">
                  <button
                     onClick={() => { setSubjectModal(true); setModalError(''); setSelectedSubject(''); }}
                     className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                  >
                     <FiPlus size={15} />
                     Fənn əlavə et
                  </button>
               </div>
               {subjects.length === 0 ? (
                  <EmptyState icon={<FiBook size={28} />} text="Heç bir fən tapılmadı" />
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     {subjects.map((item, index) => {
                        // getGroupById populate edir: item.subject — tam obyekt, item.teacher — müəllim
                        const s = item.subject ?? item;
                        const sid = typeof s === 'object' ? s._id : s;
                        const teacher = item.teacher ?? s.teacherId;
                        return (
                           <div key={sid ?? index} className="group/card bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
                                    <FiBook size={16} />
                                 </div>
                                 <span className="text-sm font-semibold leading-tight flex-1">
                                    {s.subject ?? s.name ?? '—'}
                                 </span>
                                 <button
                                    onClick={() => handleDeleteSubject(sid)}
                                    disabled={deletingId === sid}
                                    className="opacity-0 group-hover/card:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 disabled:opacity-50"
                                 >
                                    {deletingId === sid
                                       ? <span className="loading loading-spinner loading-xs" />
                                       : <FiTrash2 size={13} />}
                                 </button>
                              </div>
                              {teacher && (
                                 <>
                                    <div className="w-full h-px bg-base-200" />
                                    <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                                          <FiUser size={11} />
                                       </div>
                                       <span className="text-xs opacity-60 truncate">
                                          {teacher.name} {teacher.surname}
                                       </span>
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

         {/* Şagird əlavə et modal */}
         {studentModal && (
            <Modal
               title="Şagird əlavə et"
               icon={<PiStudent size={18} />}
               onClose={() => setStudentModal(false)}
               onConfirm={handleAddStudent}
               loading={addingStudent}
               error={modalError}
            >
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-50 ml-1">Şagird seçin</label>
                  <select
                     value={selectedStudent}
                     onChange={e => setSelectedStudent(e.target.value)}
                     className="select w-full rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  >
                     <option value="">— Seçin —</option>
                     {allStudents
                        .filter(s => !existingStudentIds.includes(s._id))
                        .map(s => (
                           <option key={s._id} value={s._id}>{s.name} {s.surname}</option>
                        ))}
                  </select>
               </div>
            </Modal>
         )}

         {/* Fənn əlavə et modal */}
         {subjectModal && (
            <Modal
               title="Fənn əlavə et"
               icon={<FiBook size={18} />}
               onClose={() => setSubjectModal(false)}
               onConfirm={handleAddSubject}
               loading={addingSubject}
               error={modalError}
            >
               <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-50 ml-1">Fənn seçin</label>
                  <select
                     value={selectedSubject}
                     onChange={e => setSelectedSubject(e.target.value)}
                     className="select w-full rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  >
                     <option value="">— Seçin —</option>
                     {allSubjects
                        .filter(s => !existingSubjectIds.includes(s._id))
                        .map(s => (
                           <option key={s._id} value={s._id}>{s.subject}</option>
                        ))}
                  </select>
               </div>
            </Modal>
         )}

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
         <span className={`text-xs px-1.5 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-base-300'}`}>
            {count}
         </span>
      </button>
   );
}

function EmptyState({ icon, text }) {
   return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
         {icon}
         <span className="text-sm">{text}</span>
      </div>
   );
}

function Modal({ title, icon, onClose, onConfirm, loading, error, children }) {
   return (
      <div className="modal modal-open" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-sm">
            <div className="flex flex-col items-center gap-1 text-center">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                  {icon}
               </div>
               <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <div className="flex flex-col gap-3 w-full">{children}</div>
            {error && <span className="text-red-400 text-xs text-center">{error}</span>}
            <div className="flex gap-3 pt-1">
               <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
               >
                  {loading ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
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

export default GroupDetail;