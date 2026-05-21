import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api.js';
import {
   FiArrowLeft, FiUser, FiBook, FiAlertCircle, FiPlus, FiCheck, FiX, FiSave
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

const parseMonthStr = (str) => {
   const [mm, yyyy] = str.split('-');
   return { month: Number(mm), year: Number(yyyy) };
};

const AZ_MONTHS = [
   'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
   'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

function GradeCell({ value, max, color = 'text-blue-400' }) {
   if (value == null) return <span className="text-xs opacity-20 font-semibold">—/{max}</span>;
   return <span className={`text-xs font-bold ${color}`}>{value}/{max}</span>;
}

function TeacherGroupDetail() {
   const { group, subject } = useParams();
   const navigate = useNavigate();

   const [students, setStudents] = useState([]);
   const [studentModal, setStudentModal] = useState(null);
   const [grades, setGrades] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [activeTab, setActiveTab] = useState('grades');

   const [calendarModal, setCalendarModal] = useState(false);
   const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
   const [allBusyDates, setAllBusyDates] = useState(new Set());

   // Attendance state
   const [attendanceData, setAttendanceData] = useState([]); // all fetched attendence docs
   const [selectedMonth, setSelectedMonth] = useState(null); // { month: 9, year: 2024 }
   const [availableMonths, setAvailableMonths] = useState([]); // [{ month, year }]
   const [attendanceLoading, setAttendanceLoading] = useState(false);

   // New attendance date input
   const [newAttDate, setNewAttDate] = useState(() => {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
   });
   const [newAttStudents, setNewAttStudents] = useState({}); // { studentId: true/false }
   const [savingAtt, setSavingAtt] = useState(false);
   const [attError, setAttError] = useState('');
   const [attSuccess, setAttSuccess] = useState('');
   const [showNewRow, setShowNewRow] = useState(false);

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
         const groupDocs = studentsRes.data ?? [];
         const allStudents = groupDocs.flatMap(g => g.students ?? []).map(s => s.student ?? s);
         setStudents(allStudents);
         setGrades(gradesRes.data);

         // init new attendance — default true (gəldi) for all
         const initMap = {};
         allStudents.forEach(s => { initMap[s._id] = true; });
         setNewAttStudents(initMap);
      } catch (err) {
         setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
      } finally {
         setLoading(false);
      }
   };

   // Fetch attendance for a specific month
   const fetchAttendance = async (month, year) => {
      try {
         setAttendanceLoading(true);
         const monthStr = `${String(month).padStart(2, '0')}-${year}`;
         const res = await api.get(`/teacher/getAttendence/${group}/${subject}?date=${monthStr}`);
         setAttendanceData(res.data ?? []);
      } catch (err) {
         if (err.response?.status === 404) {
            setAttendanceData([]);
         }
      } finally {
         setAttendanceLoading(false);
      }
   };

   // When switching to attendance tab — fetch available months from existing data
   const handleAttendanceTab = async () => {
      setActiveTab('attendance');

      try {
         const res = await api.get(`/teacher/months/${group}/${subject}`);
         const monthStrings = res.data ?? []; // ["09-2024", "10-2024", ...]

         const parsed = monthStrings.map(parseMonthStr);
         setAvailableMonths(parsed);

         try {
            const allResults = await Promise.all(
               parsed.map(({ month, year }) => {
                  const monthStr = `${String(month).padStart(2, '0')}-${year}`;
                  return api.get(`/teacher/getAttendence/${group}/${subject}?date=${monthStr}`);
               })
            );
            const busySet = new Set();
            allResults.forEach(res => {
               (res.data ?? []).forEach(doc => {
                  const d = new Date(doc.date);
                  const key = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                  busySet.add(key);
               });
            });
            setAllBusyDates(busySet);
         } catch (err) { setError(err.message); }

         if (parsed.length > 0) {
            const latest = parsed[parsed.length - 1];
            setSelectedMonth(latest);
            await fetchAttendance(latest.month, latest.year);
         } else {
            const now = new Date();
            const cur = { month: now.getMonth() + 1, year: now.getFullYear() };
            setSelectedMonth(cur);
            setAttendanceData([]);
         }
      } catch (err) {
         setError(err.response?.data?.message);
         const now = new Date();
         const months = [];
         for (let i = -6; i <= 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
         }

         const results = await Promise.allSettled(
            months.map(({ month, year }) => {
               const monthStr = `${String(month).padStart(2, '0')}-${year}`;
               return api.get(`/teacher/getAttendence/${group}/${subject}?date=${monthStr}`);
            })
         );

         const available = months
            .filter((_, i) => results[i].status === 'fulfilled')
            .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

         setAvailableMonths(available);

         if (available.length > 0) {
            const latest = available[available.length - 1];
            setSelectedMonth(latest);
            const idx = months.findIndex(m => m.month === latest.month && m.year === latest.year);
            if (results[idx].status === 'fulfilled') {
               setAttendanceData(results[idx].value.data ?? []);
            }
         } else {
            const cur = { month: now.getMonth() + 1, year: now.getFullYear() };
            setSelectedMonth(cur);
            setAttendanceData([]);
         }
      }
   };

   useEffect(() => {
      fetchAll();
   }, [group, subject]);

   // Build attendance table data
   // attendanceData: [ { date, students: [ { student, attendence } ] } ]
   const buildTable = () => {
      // collect all unique days from docs
      const dayMap = {}; // day number → doc
      attendanceData.forEach(doc => {
         const d = new Date(doc.date);
         const day = d.getDate();
         dayMap[day] = doc;
      });
      const days = Object.keys(dayMap).map(Number).sort((a, b) => a - b);
      return { days, dayMap };
   };

   const getAttendenceForStudent = (dayDoc, studentId) => {
      if (!dayDoc) return null;
      const found = dayDoc.students?.find(
         s => s.student?.toString() === studentId?.toString() || s.student === studentId
      );
      return found?.attendence ?? null; // true = gəldi, false = qayıb
   };

   const handleSaveAttendance = async () => {
      try {
         setSavingAtt(true);
         setAttError('');
         setAttSuccess('');

         const studentsPayload = students.map(s => ({
            student: s._id,
            attendence: newAttStudents[s._id] ?? true,
         }));

         await api.post('/teacher/addAttendence', {
            date: newAttDate,
            subject,
            group,
            students: studentsPayload,
         });

         setAttSuccess('Davamiyyət əlavə edildi!');
         setAllBusyDates(prev => {
            const next = new Set(prev);
            next.add(newAttDate);
            return next;
         });
         setShowNewRow(false);

         await Promise.all([
            fetchAttendance(selectedMonth.month, selectedMonth.year),
            fetchAll(),
         ]);

         const exists = availableMonths.find(m => m.month === selectedMonth.month && m.year === selectedMonth.year);
         if (!exists) {
            setAvailableMonths(prev =>
               [...prev, selectedMonth].sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year;
                  return a.month - b.month;
               })
            );
         }
      } catch (err) {
         setAttError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSavingAtt(false);
      }
   };

   // Grades tab helpers
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
      if (!gradeValue || !gradeDate) { setModalError('Qiymət və tarixi doldurun'); return; }
      const max = GRADE_LIMITS[gradeType];
      if (Number(gradeValue) < 0 || Number(gradeValue) > max) {
         setModalError(`Qiymət 0 - ${max} aralığında olmalıdır`); return;
      }
      try {
         setSubmitting(true);
         setModalError('');
         await api.post(gradeTypeEndpoint[gradeType], {
            student: selectedStudent, subject, group,
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
            <div role="alert" className="alert alert-error max-w-sm rounded-xl"><span>{error}</span></div>
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

   const { days, dayMap } = buildTable();

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Back */}
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200">
            <FiArrowLeft size={15} /> Geri
         </button>

         <div className="mb-6">
            <h1 className="text-lg font-bold">Tələbə qiymətləri</h1>
            <p className="text-xs opacity-40 mt-0.5">{students.length} şagird</p>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 mb-6">
            {[
               { key: 'grades', label: 'Qiymətlər', icon: <FiBook size={14} /> },
               { key: 'attendance', label: 'Qayıblar', icon: <PiStudent size={14} /> },
            ].map(tab => (
               <button
                  key={tab.key}
                  onClick={() => tab.key === 'attendance' ? handleAttendanceTab() : setActiveTab('grades')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key
                     ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                     : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
                     }`}
               >
                  {tab.icon}{tab.label}
               </button>
            ))}
         </div>

         {/* ── GRADES TAB ── */}
         {activeTab === 'grades' && (
            <div className="flex flex-col gap-3">
               {students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                     <PiStudent size={28} /><span className="text-sm">Heç bir şagird tapılmadı</span>
                  </div>
               ) : students.map((student, index) => {
                  const sid = student._id ?? student;
                  const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                  const total = calcTotal(sid);
                  const isLimited = getStudentGrade(sid, 'attendence')?.limited;
                  const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                  return (
                     <div key={sid} className={`bg-base-100 border rounded-2xl shadow-sm px-5 py-4 flex flex-wrap items-center gap-2 hover:shadow-md transition-all duration-200 ${isLimited
                        ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-base-200'
                        }`}
                     >
                        {isLimited && (
                           <div className="flex items-center gap-1.5 shrink-0 mt-2">
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                 <FiAlertCircle size={16} className="text-red-500 dark:text-red-400" />
                                 <span className="hidden xl:block text-xs font-semibold text-red-500 dark:text-red-400">
                                    Bu Şagird Limitdədir
                                 </span>
                              </div>
                           </div>
                        )}
                        <div className='w-full flex flex-wrap items-center gap-4'>
                           <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                              {initials || <FiUser size={14} />}
                           </div>
                           <div className="w-36 shrink-0 min-w-0">
                              <div className="font-semibold text-sm truncate">{student.name} {student.surname}</div>
                              {student.fatherName && <div className="text-xs opacity-40 truncate">{student.fatherName}</div>}
                           </div>
                           {/* Info button */}
                           <button
                              onClick={() => setStudentModal(student)}
                              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                 <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                           </button>
                           <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
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
                                          <button onClick={() => openGradeModal(col.key, sid)} className="w-6 h-6 rounded-lg border border-dashed border-base-300 flex items-center justify-center opacity-30 hover:opacity-70 hover:border-[#8B5CF6] transition-all duration-200">
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
                           <div className="flex flex-col items-center shrink-0 min-w-[44px]">
                              <span className="text-xs opacity-30">Yekun</span>
                              <span className={`text-xl font-bold ${totalColor(total)}`}>{total != null ? total : '—'}</span>
                              <span className="text-xs opacity-20">/100</span>
                           </div>
                        </div>
                     </div>

                  );
               })}
            </div>
         )}

         {/* ── ATTENDANCE TAB ── */}
         {activeTab === 'attendance' && (
            <div className="flex flex-col gap-5">

               {/* Month selector */}
               {availableMonths.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                     {availableMonths.map(m => (
                        <button
                           key={`${m.month}-${m.year}`}
                           onClick={() => {
                              setSelectedMonth(m);
                              fetchAttendance(m.month, m.year);
                           }}
                           className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedMonth?.month === m.month && selectedMonth?.year === m.year
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                              : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
                              }`}
                        >
                           {AZ_MONTHS[m.month - 1]} {m.year}
                        </button>
                     ))}
                  </div>
               )}

               {/* Add attendance button */}
               <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold opacity-60">
                     {selectedMonth ? `${AZ_MONTHS[selectedMonth.month - 1]} ${selectedMonth.year}` : ''}
                  </h2>
                  {!showNewRow && (
                     <button
                        onClick={() => {
                           setCalendarViewDate(new Date());
                           setCalendarModal(true);
                           setAttError('');
                           setAttSuccess('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                     >
                        <FiPlus size={15} /> Davamiyyət əlavə et
                     </button>
                  )}
               </div>

               {attError && <span className="text-red-400 text-xs">{attError}</span>}
               {attSuccess && <span className="text-emerald-400 text-xs">{attSuccess}</span>}

               {/* Journal table */}
               {attendanceLoading ? (
                  <div className="flex justify-center py-10">
                     <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
                  </div>
               ) : (
                  <div className="overflow-x-auto rounded-2xl border border-base-200 shadow-sm w-full p-4" style={{ maxWidth: '100%' }}>
                     <table className="text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', minWidth: '100%' }}>
                        <thead>
                           <tr className="border-b border-base-200 bg-base-100">
                              {/* Sticky student column header */}
                              <th className="sticky left-0 z-10 bg-base-100 text-left px-4 py-3 font-semibold text-xs opacity-50 min-w-[180px] border-r border-base-200">
                                 Şagird
                              </th>
                              {/* Existing days */}
                              {days.map(day => (
                                 <th key={day} className="py-3 text-center text-xs font-semibold opacity-50 w-10 min-w-[40px]">
                                    {day}
                                 </th>
                              ))}
                              {/* New date column */}
                              {showNewRow && (
                                 <th className="py-3 text-center w-16 min-w-[64px]">
                                    <div className="inline-flex flex-col items-center gap-0.5">
                                       <span className="text-xs font-bold text-[#8B5CF6]">
                                          {newAttDate.split('-')[0]}
                                       </span>
                                       <span className="text-[10px] opacity-40">
                                          {newAttDate.split('-')[1]}/{newAttDate.split('-')[2]?.slice(2)}
                                       </span>
                                    </div>
                                 </th>
                              )}
                           </tr>
                        </thead>
                        <tbody>
                           {students.map((student, index) => {
                              const sid = student._id;
                              const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                              const colors = [
                                 'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
                                 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'
                              ];
                              return (
                                 <tr key={sid} className={`border-b border-base-200 last:border-0 transition-colors ${showNewRow ? 'bg-violet-50/40 dark:bg-violet-900/10' : 'hover:bg-base-200/30'}`}>
                                    {/* Sticky student name */}
                                    <td className="sticky left-0 z-10 bg-base-100 px-4 py-2.5 border-r border-base-200 flex items-center justify-between">
                                       <div className="flex items-center gap-2.5">
                                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                                             {initials || <FiUser size={11} />}
                                          </div>
                                          <span className="font-medium text-xs whitespace-nowrap">
                                             {student.name} {student.surname}
                                          </span>
                                       </div>
                                       {/* Info button */}
                                       <button
                                          onClick={() => setStudentModal(student)}
                                          className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                                       >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                             <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                          </svg>
                                       </button>
                                    </td>

                                    {/* Existing days */}
                                    {days.map(day => {
                                       const att = getAttendenceForStudent(dayMap[day], sid);
                                       return (
                                          <td key={day} className="py-2.5 text-center w-10">
                                             {att === null ? (
                                                <span className="text-xs opacity-20">—</span>
                                             ) : att === true ? (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400 text-white text-xs font-bold shadow-sm">
                                                   +
                                                </span>
                                             ) : (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 dark:bg-red-900/30 dark:text-red-400 text-white text-xs font-bold shadow-sm">
                                                   q
                                                </span>
                                             )}
                                          </td>
                                       );
                                    })}

                                    {/* New attendance cell */}
                                    {showNewRow && (
                                       <td className="py-2.5 text-center w-24">
                                          <button
                                             onClick={() => setNewAttStudents(prev => ({ ...prev, [sid]: !prev[sid] }))}
                                             className={`w-8 h-8 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-sm ${newAttStudents[sid]
                                                ? 'bg-emerald-400 hover:bg-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                                                : 'bg-red-400 hover:bg-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                                                }`}
                                          >
                                             {newAttStudents[sid] ? '+' : 'q'}
                                          </button>
                                       </td>
                                    )}
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>

                     {/* No data */}
                     {days.length === 0 && !showNewRow && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-30">
                           <PiStudent size={28} />
                           <span className="text-sm">Bu ay üçün davamiyyət yoxdur</span>
                        </div>
                     )}
                  </div>
               )}

               {/* Save / Cancel new attendance row */}
               {showNewRow && (
                  <div className="flex gap-3">
                     <button
                        onClick={handleSaveAttendance}
                        disabled={savingAtt}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                     >
                        {savingAtt ? <span className="loading loading-spinner loading-xs" /> : <><FiSave size={14} /> Yadda saxla</>}
                     </button>
                     <button
                        onClick={() => { setShowNewRow(false); setAttError(''); }}
                        className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                     >
                        Ləğv et
                     </button>
                  </div>
               )}
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
                        <input type="number" min={0} max={GRADE_LIMITS[gradeType]} value={gradeValue} onChange={e => setGradeValue(e.target.value)}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder={`0 - ${GRADE_LIMITS[gradeType]}`} />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Tarix (DD-MM-YYYY)</label>
                        <input type="text" value={gradeDate} onChange={e => setGradeDate(e.target.value)}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder="DD-MM-YYYY" />
                     </div>
                  </div>
                  {modalError && <span className="text-red-400 text-xs text-center">{modalError}</span>}
                  <div className="flex gap-3 pt-1">
                     <button onClick={handleSubmitGrade} disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60">
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button onClick={() => setGradeModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                        Ləğv et
                     </button>
                  </div>
               </div>
            </div>
         )}
         {/* Student info modal */}
         {studentModal && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">

                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

                  <div className="p-6 flex flex-col gap-5">

                     {/* Header */}
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                              {studentModal.name?.charAt(0)}{studentModal.surname?.charAt(0)}
                           </div>
                           <div>
                              <div className="font-bold text-base">
                                 {studentModal.name} {studentModal.surname}
                              </div>
                              <div className="text-xs opacity-40">{studentModal.fatherName} oğlu</div>
                           </div>
                        </div>
                        <button
                           onClick={() => setStudentModal(null)}
                           className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                        >
                           <FiX size={15} />
                        </button>
                     </div>

                     {/* Info fields */}
                     <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs opacity-40 flex items-center gap-1">
                              <FiUser size={11} /> Ad Soyad Ata adı
                           </span>
                           <span className="text-sm font-semibold">
                              {studentModal.name} {studentModal.surname} {studentModal.fatherName}
                           </span>
                        </div>
                        <div className="w-full h-px bg-base-200" />
                        <div className="flex flex-col gap-1">
                           <span className="text-xs opacity-40 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                 <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              Telefon
                           </span>
                           <span className="text-sm font-semibold">
                              {studentModal.phoneNumber || '—'}
                           </span>
                        </div>
                        <div className="w-full h-px bg-base-200" />
                        <div className="flex flex-col gap-1">
                           <span className="text-xs opacity-40 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                 <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                              </svg>
                              Email
                           </span>
                           <span className="text-sm font-semibold">
                              {studentModal.email || '—'}
                           </span>
                        </div>
                     </div>

                  </div>
               </div>
               <div className="modal-backdrop" onClick={() => setStudentModal(null)} />
            </div>
         )}
         {calendarModal && (() => {
            const year = calendarViewDate.getFullYear();
            const month = calendarViewDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startOffset = (firstDay + 6) % 7; // Пн = 0

            const mm = String(month + 1).padStart(2, '0');
            const busyDays = new Set(
               [...allBusyDates]
                  .filter(key => key.endsWith(`-${mm}-${year}`))
                  .map(key => parseInt(key.split('-')[0], 10))
            );

            const cells = [];
            for (let i = 0; i < startOffset; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);

            const handlePickDay = async (day) => {
               if (!day || busyDays.has(day)) return;

               const dd = String(day).padStart(2, '0');
               const mm = String(month + 1).padStart(2, '0');
               const pickedDate = `${dd}-${mm}-${year}`;

               const pickedMonthMatches =
                  selectedMonth?.month === month + 1 && selectedMonth?.year === year;

               const monthExists = availableMonths.some(
                  m => m.month === month + 1 && m.year === year
               );

               if (!pickedMonthMatches && monthExists) {
                  alert(`Zəhmət olmasa ${AZ_MONTHS[month]} ${year} ayına keçin`);
                  return;
               }

               setNewAttDate(pickedDate);
               const resetMap = {};
               students.forEach(s => { resetMap[s._id] = true; });
               setNewAttStudents(resetMap);
               setShowNewRow(true);
               setCalendarModal(false);

               if (!monthExists) {
                  const newMonth = { month: month + 1, year };
                  setSelectedMonth(newMonth);
                  setAttendanceData([]);
                  setAvailableMonths(prev =>
                     [...prev, newMonth].sort((a, b) =>
                        a.year !== b.year ? a.year - b.year : a.month - b.month
                     )
                  );
               }
            };

            const prevMonth = () => setCalendarViewDate(new Date(year, month - 1, 1));
            const nextMonth = () => setCalendarViewDate(new Date(year, month + 1, 1));

            return (
               <div className="modal modal-open z-50" role="dialog">
                  <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">

                     <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

                     <div className="p-6 flex flex-col gap-4">

                        {/* Заголовок */}
                        <div className="flex items-center justify-between">
                           <h3 className="text-base font-bold">Tarix seçin</h3>
                           <button
                              onClick={() => setCalendarModal(false)}
                              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                           >
                              <FiX size={15} />
                           </button>
                        </div>

                        {/* Навигация по месяцам */}
                        <div className="flex items-center justify-between">
                           <button
                              onClick={prevMonth}
                              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                           >
                              <FiArrowLeft size={14} />
                           </button>
                           <span className="text-sm font-semibold">
                              {AZ_MONTHS[month]} {year}
                           </span>
                           <button
                              onClick={nextMonth}
                              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                           >
                              <FiArrowLeft size={14} className="rotate-180" />
                           </button>
                        </div>

                        {/* Дни недели */}
                        <div className="grid grid-cols-7 gap-1">
                           {['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'].map(d => (
                              <div key={d} className="text-center text-xs opacity-30 font-semibold py-1">{d}</div>
                           ))}

                           {/* Ячейки */}
                           {cells.map((day, i) => {
                              const isBusy = day && busyDays.has(day);
                              const isEmpty = !day;
                              return (
                                 <button
                                    key={i}
                                    disabled={!day || isBusy}
                                    onClick={() => handlePickDay(day)}
                                    className={`
                              aspect-square rounded-xl text-sm font-semibold transition-all duration-150
                              ${isEmpty ? 'invisible' : ''}
                              ${isBusy
                                          ? 'opacity-25 cursor-not-allowed text-base-content bg-base-200'
                                          : day
                                             ? 'hover:bg-gradient-to-br hover:from-[#8B5CF6] hover:to-[#3B82F6] hover:text-white hover:shadow-md cursor-pointer'
                                             : ''
                                       }
                           `}
                                 >
                                    {day}
                                 </button>
                              );
                           })}
                        </div>

                        {/* Подсказка */}
                        <p className="text-xs opacity-30 text-center">
                           Boz rəngli günlər artıq mövcuddur
                        </p>
                     </div>
                  </div>
                  <div className="modal-backdrop" onClick={() => setCalendarModal(false)} />
               </div>
            );
         })()}
      </div>
   );
}

export default TeacherGroupDetail;