import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api.js';
import {
   FiArrowLeft, FiUser, FiBook, FiAlertCircle,
   FiPlus, FiCheck, FiX,
} from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

// Grade limits
const GRADE_LIMITS = {
   collegium1: 10,
   collegium2: 10,
   coursework: 20,
   attendence: 10,
   exam: 50,
};

function GradeCell({ value, max, color = 'text-blue-400' }) {
   if (value == null) return <span className="text-xs opacity-20 font-semibold">—/{max}</span>;
   return <span className={`text-xs font-bold ${color}`}>{value}/{max}</span>;
}

function TeacherGroupDetail() {
   const { group, subject } = useParams();
   const navigate = useNavigate();

   const [students, setStudents] = useState([]);
   const [grades, setGrades] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [activeTab, setActiveTab] = useState('grades');

   // Grade modal
   const [gradeModal, setGradeModal] = useState(false);
   const [gradeType, setGradeType] = useState('');
   const [selectedStudent, setSelectedStudent] = useState('');
   const [gradeValue, setGradeValue] = useState('');
   const [gradeDate, setGradeDate] = useState(() => {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
   });
   const [submitting, setSubmitting] = useState(false);
   const [modalError, setModalError] = useState('');

   const fetchAll = async () => {
      try {
         setLoading(true);
         const [studentsRes, gradesRes] = await Promise.all([
            api.get(`/teacher/getGroupStudents/${group}/${subject}`),
            api.get(`/teacher/getGrades/${group}/${subject}`),
         ]);

         // getGroupStudents returns array of group docs with populated students
         const groupDocs = studentsRes.data ?? [];
         const allStudents = groupDocs.flatMap(g => g.students ?? []).map(s => s.student ?? s);
         setStudents(allStudents);
         setGrades(gradesRes.data);
      } catch (err) {
         setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchAll();
   }, [group, subject]);

   const getStudentGrade = (studentId, type) => {
      if (!grades) return null;
      const map = {
         collegium1: grades.collegium1Grades,
         collegium2: grades.collegium2Grades,
         attendence: grades.attendenceGrades,
         coursework: grades.courseworkGrades,
         exam: grades.examGrades,
      };
      const list = map[type] ?? [];
      return list.find(g => g.student?.toString() === studentId?.toString() || g.student === studentId);
   };

   const calcTotal = (studentId) => {
      const col1 = getStudentGrade(studentId, 'collegium1')?.grade?.grade ?? 0;
      const col2 = getStudentGrade(studentId, 'collegium2')?.grade?.grade ?? 0;
      const cw = getStudentGrade(studentId, 'coursework')?.grade?.grade ?? 0;
      const att = getStudentGrade(studentId, 'attendence')?.grade?.grade ?? 0;
      const exam = getStudentGrade(studentId, 'exam')?.grade?.grade ?? 0;
      const hasAny = [col1, col2, cw, att, exam].some(v => v > 0);
      return hasAny ? col1 + col2 + cw + att + exam : null;
   };

   const totalColor = (total) => {
      if (total == null) return 'opacity-20';
      if (total >= 85) return 'text-emerald-500';
      if (total >= 60) return 'text-blue-400';
      if (total >= 51) return 'text-yellow-400';
      return 'text-red-400';
   };

   const gradeTypeEndpoint = {
      collegium1: '/teacher/createCollegium1',
      collegium2: '/teacher/createCollegium2',
      coursework: '/teacher/createCoursework',
      exam: '/teacher/createExam',
   };

   const gradeTypeLabel = {
      collegium1: 'Kollegium 1',
      collegium2: 'Kollegium 2',
      coursework: 'Kurswork',
      exam: 'İmtahan',
   };

   const openGradeModal = (type, studentId) => {
      setGradeType(type);
      setSelectedStudent(studentId);
      setGradeValue('');
      setModalError('');
      setGradeModal(true);
   };

   const handleSubmitGrade = async () => {
      if (!gradeValue || !gradeDate) {
         setModalError('Qiymət və tarixi doldurun');
         return;
      }
      const max = GRADE_LIMITS[gradeType];
      if (Number(gradeValue) < 0 || Number(gradeValue) > max) {
         setModalError(`Qiymət 0 - ${max} aralığında olmalıdır`);
         return;
      }
      try {
         setSubmitting(true);
         setModalError('');
         await api.post(gradeTypeEndpoint[gradeType], {
            student: selectedStudent,
            subject,
            group,
            grade: { grade: String(gradeValue), date: gradeDate },
         });
         setGradeModal(false);
         await fetchAll();
      } catch (err) {
         setModalError(err.response?.data?.message || 'Xəta baş verdi');
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

   const gradeColumns = [
      { key: 'collegium1', label: 'Kol. 1', max: 10, color: 'text-blue-400' },
      { key: 'collegium2', label: 'Kol. 2', max: 10, color: 'text-blue-400' },
      { key: 'coursework', label: 'Kurswork', max: 20, color: 'text-violet-400' },
      { key: 'attendence', label: 'Dav.', max: 10, color: 'text-emerald-400' },
      { key: 'exam', label: 'İmtahan', max: 50, color: 'text-orange-400' },
   ];

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Back */}
         <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200"
         >
            <FiArrowLeft size={15} />
            Geri
         </button>

         {/* Header */}
         <div className="mb-6">
            <h1 className="text-lg font-bold">Tələbə qiymətləri</h1>
            <p className="text-xs opacity-40 mt-0.5">{students.length} şagird</p>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 mb-6">
            <button
               onClick={() => setActiveTab('grades')}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'grades'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
                  }`}
            >
               <FiBook size={14} />
               Qiymətlər
            </button>
            <button
               onClick={() => setActiveTab('attendance')}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
                  }`}
            >
               <PiStudent size={14} />
               Qayıblar
            </button>
         </div>

         {/* Grades tab */}
         {activeTab === 'grades' && (
            <div>
               {students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                     <PiStudent size={28} />
                     <span className="text-sm">Heç bir şagird tapılmadı</span>
                  </div>
               ) : (
                  <div className="flex flex-col gap-3">
                     {students.map((student, index) => {
                        const sid = student._id ?? student;
                        const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                        const total = calcTotal(sid);
                        const isLimited = getStudentGrade(sid, 'attendence')?.limited;

                        const colors = [
                           'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
                           'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
                        ];

                        return (
                           <div
                              key={sid}
                              className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex flex-wrap items-center gap-4 hover:shadow-md transition-all duration-200"
                           >
                              {/* Avatar */}
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                                 {initials || <FiUser size={14} />}
                              </div>

                              {/* Name */}
                              <div className="w-36 shrink-0 min-w-0">
                                 <div className="font-semibold text-sm truncate">{student.name} {student.surname}</div>
                                 {student.fatherName && (
                                    <div className="text-xs opacity-40 truncate">{student.fatherName} oğlu</div>
                                 )}
                              </div>

                              <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />

                              {/* Grade columns */}
                              <div className="flex-1 flex flex-wrap items-center gap-3 lg:gap-5">
                                 {gradeColumns.map(col => {
                                    const g = getStudentGrade(sid, col.key);
                                    const hasGrade = g?.grade?.grade != null;
                                    const canAdd = !hasGrade && col.key !== 'attendence';
                                    return (
                                       <div key={col.key} className="flex flex-col items-center gap-1 min-w-[52px]">
                                          <span className="text-xs opacity-30">{col.label}</span>
                                          {hasGrade ? (
                                             <GradeCell value={g.grade.grade} max={col.max} color={col.key === 'attendence' && isLimited ? 'text-red-400' : col.color} />
                                          ) : canAdd ? (
                                             <button
                                                onClick={() => openGradeModal(col.key, sid)}
                                                className="w-6 h-6 rounded-lg border border-dashed border-base-300 flex items-center justify-center opacity-30 hover:opacity-70 hover:border-[#8B5CF6] transition-all duration-200"
                                             >
                                                <FiPlus size={11} />
                                             </button>
                                          ) : (
                                             <span className="text-xs opacity-20">—/{col.max}</span>
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>

                              <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />

                              {/* Limited */}
                              {isLimited && (
                                 <div className="flex items-center gap-1 text-red-400 text-xs shrink-0">
                                    <FiAlertCircle size={13} />
                                    <span className="hidden xl:block">Buraxılmayıb</span>
                                 </div>
                              )}

                              {/* Total */}
                              <div className="flex flex-col items-center shrink-0 min-w-[44px]">
                                 <span className="text-xs opacity-30">Yekun</span>
                                 <span className={`text-xl font-bold ${totalColor(total)}`}>
                                    {total != null ? total : '—'}
                                 </span>
                                 <span className="text-xs opacity-20">/100</span>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}

         {/* Attendance tab — empty for now */}
         {activeTab === 'attendance' && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
               <PiStudent size={36} />
               <span className="text-sm">Bu bölmə hazırlanır</span>
            </div>
         )}

         {/* Grade Modal */}
         {gradeModal && (
            <div className="modal modal-open" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-sm">
                  <div className="flex flex-col items-center gap-1 text-center">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                        <FiBook size={18} />
                     </div>
                     <h3 className="text-lg font-bold">{gradeTypeLabel[gradeType]}</h3>
                     <p className="text-xs opacity-40">Maks: {GRADE_LIMITS[gradeType]} bal</p>
                  </div>

                  <div className="flex flex-col gap-3">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Bal (0 – {GRADE_LIMITS[gradeType]})</label>
                        <input
                           type="number"
                           min={0}
                           max={GRADE_LIMITS[gradeType]}
                           value={gradeValue}
                           onChange={e => setGradeValue(e.target.value)}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder={`0 - ${GRADE_LIMITS[gradeType]}`}
                        />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Tarix (DD-MM-YYYY)</label>
                        <input
                           type="text"
                           value={gradeDate}
                           onChange={e => setGradeDate(e.target.value)}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder="DD-MM-YYYY"
                        />
                     </div>
                  </div>

                  {modalError && <span className="text-red-400 text-xs text-center">{modalError}</span>}

                  <div className="flex gap-3 pt-1">
                     <button
                        onClick={handleSubmitGrade}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                     >
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button
                        onClick={() => setGradeModal(false)}
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

export default TeacherGroupDetail;