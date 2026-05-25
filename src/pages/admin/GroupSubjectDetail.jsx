import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api.js';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiBook, FiClock, FiX, FiPlus, FiSave } from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

const GRADE_LIMITS = {
   collegium1: 10,
   collegium2: 10,
   coursework: 20,
   attendence: 10,
   exam: 50,
};

function GradeCell({ label, value, max, color, editable, onEdit }) {
   const [hovered, setHovered] = useState(false);

   return (
      <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
         <span className="text-xs opacity-30">{label}</span>
         {value != null ? (
            <div
               className="relative"
               onMouseEnter={() => setHovered(true)}
               onMouseLeave={() => setHovered(false)}
            >
               <span className={`text-xs font-bold ${color}`}>{value}/{max}</span>
               {editable && hovered && (
                  <button
                     onClick={onEdit}
                     className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white border border-[#3B82F6] rounded-lg px-2 py-1 text-[11px] font-semibold whitespace-nowrap z-10 shadow-md"
                  >
                     Dəyiş
                  </button>
               )}
            </div>
         ) : (
            <span className="text-xs opacity-20">—/{max}</span>
         )}
      </div>
   );
}
function GroupSubjectDetail() {
   const { id, subjectId } = useParams();
   const navigate = useNavigate();

   const [subject, setSubject] = useState(null);
   const [students, setStudents] = useState([]);
   const [grades, setGrades] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [gradeEdit, setGradeEdit] = useState(null); // { studentId, type, currentValue }
   const [gradeEditValue, setGradeEditValue] = useState('');
   const [gradeEditSubmitting, setGradeEditSubmitting] = useState(false);
   const [gradeEditError, setGradeEditError] = useState('');

   const [activeTab, setActiveTab] = useState('grades');

   // Attendance
   const [attendanceData, setAttendanceData] = useState([]);
   const [availableMonths, setAvailableMonths] = useState([]);
   const [selectedMonth, setSelectedMonth] = useState(null);
   const [attendanceLoading, setAttendanceLoading] = useState(false);
   const [allBusyDates, setAllBusyDates] = useState(new Set());
   const [calendarModal, setCalendarModal] = useState(false);
   const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
   const [attModal, setAttModal] = useState(false);
   const [newAttDate, setNewAttDate] = useState('');
   const [newAttStudents, setNewAttStudents] = useState({});
   const [savingAtt, setSavingAtt] = useState(false);
   const [attError, setAttError] = useState('');
   const [attSuccess, setAttSuccess] = useState('');

   const AZ_MONTHS = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
      'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
   ];

   const parseMonthStr = (str) => {
      const [mm, yyyy] = str.split('-');
      return { month: Number(mm), year: Number(yyyy) };
   };

   const fetchAttendance = async (month, year) => {
      try {
         setAttendanceLoading(true);
         const monthStr = `${String(month).padStart(2, '0')}-${year}`;
         const res = await api.get(`/teacher/getAttendence/${id}/${subjectId}?date=${monthStr}`);
         setAttendanceData(res.data ?? []);
      } catch (err) {
         if (err.response?.status === 404) setAttendanceData([]);
      } finally {
         setAttendanceLoading(false);
      }
   };

   const handleAttendanceTab = async () => {
      setActiveTab('attendance');
      try {
         const res = await api.get(`/teacher/months/${id}/${subjectId}`);
         const parsed = (res.data ?? []).map(parseMonthStr);
         setAvailableMonths(parsed);

         const allResults = await Promise.all(
            parsed.map(({ month, year }) => {
               const monthStr = `${String(month).padStart(2, '0')}-${year}`;
               return api.get(`/teacher/getAttendence/${id}/${subjectId}?date=${monthStr}`).catch(() => ({ data: [] }));
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

         if (parsed.length > 0) {
            const latest = parsed[parsed.length - 1];
            setSelectedMonth(latest);
            await fetchAttendance(latest.month, latest.year);
         } else {
            const now = new Date();
            setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
            setAttendanceData([]);
         }
      } catch (err) {
         const now = new Date();
         setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
         setAttendanceData([]);
      }
   };

   const buildTable = () => {
      const dayMap = {};
      attendanceData.forEach(doc => {
         const d = new Date(doc.date);
         dayMap[d.getDate()] = doc;
      });
      const days = Object.keys(dayMap).map(Number).sort((a, b) => a - b);
      return { days, dayMap };
   };

   const getAttendenceForStudent = (dayDoc, studentId) => {
      if (!dayDoc) return null;
      const found = dayDoc.students?.find(
         s => s.student?.toString() === studentId?.toString() || s.student === studentId
      );
      return found?.attendence ?? null;
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
            subject: subjectId,
            group: id,
            students: studentsPayload,
         });
         setAttSuccess('Davamiyyət əlavə edildi!');
         setAllBusyDates(prev => { const next = new Set(prev); next.add(newAttDate); return next; });
         setAttModal(false);
         await fetchAttendance(selectedMonth.month, selectedMonth.year);
         const exists = availableMonths.find(m => m.month === selectedMonth.month && m.year === selectedMonth.year);
         if (!exists) {
            setAvailableMonths(prev =>
               [...prev, selectedMonth].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
            );
         }
      } catch (err) {
         setAttError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setSavingAtt(false);
      }
   };

   const gradeEndpoints = {
      collegium1: (group, subject, student) => `/admin/updateCollegium1/${group}/${subject}/${student}`,
      collegium2: (group, subject, student) => `/admin/updateCollegium2/${group}/${subject}/${student}`,
      exam: (group, subject, student) => `/admin/updateExam/${group}/${subject}/${student}`,
      coursework: (group, subject, student) => `/admin/updateCoursework/${group}/${subject}/${student}`,
   };

   const handleGradeEdit = async () => {
      if (gradeEditValue === '') { setGradeEditError('Qiymət daxil edin'); return; }
      const max = GRADE_LIMITS[gradeEdit.type];
      if (Number(gradeEditValue) < 0 || Number(gradeEditValue) > max) {
         setGradeEditError(`0 - ${max} aralığında olmalıdır`); return;
      }
      try {
         setGradeEditSubmitting(true);
         setGradeEditError('');
         const url = gradeEndpoints[gradeEdit.type](id, subjectId, gradeEdit.studentId);
         await api.patch(url, { grade: Number(gradeEditValue) });
         const gradesRes = await api.get(`/admin/getGrades/${id}/${subjectId}`);
         setGrades(gradesRes.data);
         setGradeEdit(null);
      } catch (err) {
         setGradeEditError(err.response?.data?.message || 'Xəta baş verdi');
      } finally {
         setGradeEditSubmitting(false);
      }
   };
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [groupRes, studentsRes, gradesRes] = await Promise.all([
               api.get(`/admin/getGroupById/${id}`),
               api.get(`/admin/getAssignedyStudents/${id}?page=1&pageSize=999`),
               api.get(`/admin/getGrades/${id}/${subjectId}`),
            ]);

            // Find subject info from group
            const groupData = groupRes.data;
            const subjectItem = groupData.subjects?.find(s =>
               (s.subject?._id ?? s.subject) === subjectId
            );
            setSubject(subjectItem);
            setStudents(studentsRes.data.data ?? []);
            setGrades(gradesRes.data);
         } catch (err) {
            setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [id, subjectId]);

   const getGrade = (studentId, type) => {
      if (!grades) return null;
      const map = {
         collegium1: grades.collegium1Grades,
         collegium2: grades.collegium2Grades,
         attendence: grades.attendenceGrades,
         coursework: grades.courseworkGrades,
         exam: grades.examGrades,
      };
      const found = (map[type] ?? []).find(
         g => g.student?.toString() === studentId?.toString() || g.student === studentId
      );
      return found?.grade?.grade ?? null;
   };

   const calcTotal = (studentId) => {
      const vals = ['collegium1', 'collegium2', 'coursework', 'attendence', 'exam'].map(t => getGrade(studentId, t) ?? 0);
      return vals.some(v => v > 0) ? vals.reduce((a, b) => a + b, 0) : null;
   };

   const totalColor = (total) => {
      if (total == null) return 'opacity-20';
      if (total >= 85) return 'text-emerald-500';
      if (total >= 60) return 'text-blue-400';
      if (total >= 51) return 'text-yellow-400';
      return 'text-red-400';
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

   const subjectInfo = subject?.subject ?? {};
   const teacher = subject?.teacher ?? subjectInfo?.teacherId;
   const teacherInitials = `${teacher?.name?.charAt(0) ?? ''}${teacher?.surname?.charAt(0) ?? ''}`.toUpperCase();

   const gradeColumns = [
      { key: 'collegium1', label: 'Kol. 1', max: 10, color: 'text-blue-400' },
      { key: 'collegium2', label: 'Kol. 2', max: 10, color: 'text-blue-400' },
      { key: 'coursework', label: 'Kurswork', max: 20, color: 'text-violet-400' },
      { key: 'attendence', label: 'Dav.', max: 10, color: 'text-emerald-400' },
      { key: 'exam', label: 'İmtahan', max: 50, color: 'text-orange-400' },
   ];

   const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200">
            <FiArrowLeft size={15} /> Geri
         </button>

         <div className="flex flex-col lg:flex-row gap-6">

            {/* Left — Subject & Teacher info */}
            <div className="lg:w-72 shrink-0 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">

               {/* Subject card */}
               <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                  <div className="p-5 flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
                           <FiBook size={16} />
                        </div>
                        <div>
                           <div className="font-bold text-base">{subjectInfo.subject ?? '—'}</div>
                           <div className="text-xs opacity-40">Fənn məlumatları</div>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        {[
                           { label: 'Semestr', value: subjectInfo.semestr ? `${subjectInfo.semestr}-ci` : '—' },
                           { label: 'Kredit', value: subjectInfo.kredit ?? '—' },
                           { label: 'Saat', value: subjectInfo.totalHours ?? '—' },
                        ].map(({ label, value }) => (
                           <div key={label} className="flex items-center justify-between py-2 border-b border-base-200 last:border-0">
                              <span className="text-xs opacity-40 flex items-center gap-1">
                                 <FiClock size={10} /> {label}
                              </span>
                              <span className="text-sm font-semibold">{value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Teacher card */}
               {teacher && (
                  <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
                     <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />
                     <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                              {teacherInitials || <FiUser size={18} />}
                           </div>
                           <div>
                              <div className="font-bold text-sm">{teacher.name} {teacher.surname}</div>
                              <div className="text-xs opacity-40">{teacher.fatherName}</div>
                           </div>
                        </div>
                        <div className="bg-base-200/50 rounded-xl p-3 border border-base-200 flex flex-col gap-2">
                           {teacher.phoneNumber && (
                              <div className="flex items-center gap-2">
                                 <FiPhone size={11} className="opacity-40 shrink-0" />
                                 <span className="text-xs font-semibold">{teacher.phoneNumber}</span>
                              </div>
                           )}
                           {teacher.email && (
                              <div className="flex items-center gap-2">
                                 <FiMail size={11} className="opacity-40 shrink-0" />
                                 <span className="text-xs font-semibold truncate">{teacher.email}</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {/* Stats */}
               <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5">
                  <div className="text-xs font-semibold opacity-40 mb-3 flex items-center gap-1">
                     <PiStudent size={12} /> Şagird sayı
                  </div>
                  <div className="text-3xl font-bold">{students.length}</div>
               </div>
            </div>

            {/* Right — Students & grades */}
            <div className="flex-1 flex flex-col gap-3">
               <div className="flex gap-2 mb-2">
                  {[
                     { key: 'grades', label: 'Qiymətlər', icon: <FiBook size={14} /> },
                     { key: 'attendance', label: 'Davamiyyət', icon: <FiUser size={14} /> },
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

               {activeTab === 'grades' && (
                  <>
                     {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
                           <PiStudent size={28} /><span className="text-sm">Heç bir şagird tapılmadı</span>
                        </div>
                     ) : students.map((student, index) => {
                        const sid = student._id;
                        const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                        const total = calcTotal(sid);
                        const isLimited = (grades?.attendenceGrades ?? []).find(
                           g => g.student?.toString() === sid?.toString()
                        )?.limited;

                        return (
                           <div key={sid} className={`bg-base-100 border rounded-xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-3 hover:shadow-md transition-all duration-200 ${isLimited ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-base-200'}`}>
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                                 {initials || <FiUser size={12} />}
                              </div>
                              <div className="w-32 shrink-0 min-w-0">
                                 <div className="font-semibold text-xs truncate">{student.name} {student.surname}</div>
                                 {student.fatherName && <div className="text-xs opacity-30 truncate">{student.fatherName}</div>}
                              </div>
                              <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
                              <div className="flex-1 flex flex-wrap items-center gap-3 lg:gap-5">
                                 {gradeColumns.map(col => (
                                    <GradeCell
                                       key={col.key}
                                       label={col.label}
                                       value={getGrade(sid, col.key)}
                                       max={col.max}
                                       color={col.key === 'attendence' && isLimited ? 'text-red-400' : col.color}
                                       editable={col.key !== 'attendence' && getGrade(sid, col.key) != null}
                                       onEdit={() => {
                                          setGradeEdit({ studentId: sid, type: col.key, currentValue: getGrade(sid, col.key) });
                                          setGradeEditValue(String(getGrade(sid, col.key)));
                                          setGradeEditError('');
                                       }}
                                    />
                                 ))}
                              </div>
                              <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
                              <div className="flex flex-col items-center shrink-0 min-w-[40px]">
                                 <span className="text-xs opacity-30">Yekun</span>
                                 <span className={`text-lg font-bold ${totalColor(total)}`}>{total != null ? total : '—'}</span>
                                 <span className="text-xs opacity-20">/100</span>
                              </div>
                           </div>
                        );
                     })}
                  </>
               )}
               {/* Grade Edit Modal */}
               {/* Attendance Modal */}
               {attModal && (
                  <div className="modal modal-open z-50" role="dialog">
                     <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                        <div className="p-6 flex flex-col gap-5">
                           <div className="flex items-center justify-between">
                              <div>
                                 <h3 className="text-base font-bold">Davamiyyət əlavə et</h3>
                                 <p className="text-xs opacity-40 mt-0.5">{newAttDate}</p>
                              </div>
                              <button onClick={() => { setAttModal(false); setAttError(''); }} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                                 <FiX size={15} />
                              </button>
                           </div>
                           <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                              {students.map((student, index) => {
                                 const sid = student._id;
                                 const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                                 const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                                 const isPresent = newAttStudents[sid] ?? true;
                                 return (
                                    <div key={sid} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-base-200 hover:bg-base-200/30 transition-all duration-200">
                                       <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                                          {initials}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-sm truncate">{student.name} {student.surname}</div>
                                          {student.fatherName && <div className="text-xs opacity-40 truncate">{student.fatherName}</div>}
                                       </div>
                                       <button
                                          onClick={() => setNewAttStudents(prev => ({ ...prev, [sid]: !prev[sid] }))}
                                          className={`w-9 h-9 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-sm shrink-0 ${isPresent ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-red-400 hover:bg-red-500'}`}
                                       >
                                          {isPresent ? '+' : 'q'}
                                       </button>
                                    </div>
                                 );
                              })}
                           </div>
                           {attError && <span className="text-red-400 text-xs text-center">{attError}</span>}
                           <div className="flex gap-3 pt-1 border-t border-base-200">
                              <button
                                 onClick={handleSaveAttendance}
                                 disabled={savingAtt}
                                 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                              >
                                 {savingAtt ? <span className="loading loading-spinner loading-xs" /> : <><FiSave size={14} /> Yadda saxla</>}
                              </button>
                              <button onClick={() => { setAttModal(false); setAttError(''); }} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                                 Ləğv et
                              </button>
                           </div>
                        </div>
                     </div>
                     <div className="modal-backdrop" onClick={() => { setAttModal(false); setAttError(''); }} />
                  </div>
               )}

               {/* Calendar Modal */}
               {calendarModal && (() => {
                  const year = calendarViewDate.getFullYear();
                  const month = calendarViewDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const startOffset = (firstDay + 6) % 7;
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
                     const today = new Date(); today.setHours(0, 0, 0, 0);
                     const picked = new Date(year, month, day); picked.setHours(0, 0, 0, 0);
                     if (picked > today) return;

                     const dd = String(day).padStart(2, '0');
                     const mm = String(month + 1).padStart(2, '0');
                     const pickedDate = `${dd}-${mm}-${year}`;
                     const pickedMonth = { month: month + 1, year };
                     const monthExists = availableMonths.some(m => m.month === month + 1 && m.year === year);

                     setNewAttDate(pickedDate);
                     const resetMap = {};
                     students.forEach(s => { resetMap[s._id] = true; });
                     setNewAttStudents(resetMap);
                     setCalendarModal(false);
                     setAttModal(true);
                     setSelectedMonth(pickedMonth);
                     if (!monthExists) {
                        setAttendanceData([]);
                        setAvailableMonths(prev =>
                           [...prev, pickedMonth].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
                        );
                     } else {
                        await fetchAttendance(pickedMonth.month, pickedMonth.year);
                     }
                  };

                  return (
                     <div className="modal modal-open z-50" role="dialog">
                        <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
                           <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                           <div className="p-6 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-base font-bold">Tarix seçin</h3>
                                 <button onClick={() => setCalendarModal(false)} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                                    <FiX size={15} />
                                 </button>
                              </div>
                              <div className="flex items-center justify-between">
                                 <button onClick={() => setCalendarViewDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                                    <FiArrowLeft size={14} />
                                 </button>
                                 <span className="text-sm font-semibold">{AZ_MONTHS[month]} {year}</span>
                                 <button onClick={() => setCalendarViewDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                                    <FiArrowLeft size={14} className="rotate-180" />
                                 </button>
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                 {['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'].map(d => (
                                    <div key={d} className="text-center text-xs opacity-30 font-semibold py-1">{d}</div>
                                 ))}
                                 {cells.map((day, i) => {
                                    const today = new Date(); today.setHours(0, 0, 0, 0);
                                    const thisDay = day ? new Date(year, month, day) : null;
                                    const isFuture = thisDay && thisDay > today;
                                    const isBusy = day && busyDays.has(day);
                                    const isDisabled = !day || isBusy || isFuture;
                                    return (
                                       <button
                                          key={i}
                                          disabled={isDisabled}
                                          onClick={() => handlePickDay(day)}
                                          className={`aspect-square rounded-xl text-sm font-semibold transition-all duration-150 ${!day ? 'invisible' : ''} ${isBusy || isFuture ? 'opacity-25 cursor-not-allowed bg-base-200' : 'hover:bg-gradient-to-br hover:from-[#8B5CF6] hover:to-[#3B82F6] hover:text-white hover:shadow-md cursor-pointer'}`}
                                       >
                                          {day}
                                       </button>
                                    );
                                 })}
                              </div>
                              <p className="text-xs opacity-30 text-center">Boz rəngli günlər artıq mövcuddur</p>
                           </div>
                        </div>
                        <div className="modal-backdrop" onClick={() => setCalendarModal(false)} />
                     </div>
                  );
               })()}
               {activeTab === 'attendance' && (() => {
                  const { days, dayMap } = buildTable();
                  return (
                     <div className="flex flex-col gap-5">
                        {availableMonths.length > 0 && (
                           <div className="flex flex-wrap gap-2">
                              {availableMonths.map(m => (
                                 <button
                                    key={`${m.month}-${m.year}`}
                                    onClick={() => { setSelectedMonth(m); fetchAttendance(m.month, m.year); }}
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

                        <div className="flex items-center justify-between">
                           <h2 className="text-sm font-semibold opacity-60">
                              {selectedMonth ? `${AZ_MONTHS[selectedMonth.month - 1]} ${selectedMonth.year}` : ''}
                           </h2>
                           <button
                              onClick={() => { setCalendarViewDate(new Date()); setCalendarModal(true); setAttError(''); setAttSuccess(''); }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                           >
                              <FiPlus size={15} /> Davamiyyət əlavə et
                           </button>
                        </div>

                        {attError && <span className="text-red-400 text-xs">{attError}</span>}
                        {attSuccess && <span className="text-emerald-400 text-xs">{attSuccess}</span>}

                        {!attendanceLoading && days.length === 0 && (
                           <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-30">
                              <FiUser size={28} />
                              <span className="text-sm">Bu ay üçün davamiyyət yoxdur</span>
                           </div>
                        )}

                        {attendanceLoading ? (
                           <div className="flex justify-center py-10">
                              <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
                           </div>
                        ) : days.length > 0 ? (
                           <div
                              className="overflow-x-auto rounded-2xl border border-base-200 shadow-sm w-full p-4"
                              style={{ maxWidth: '100%' }}
                              onWheel={e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.currentTarget.scrollLeft += e.deltaY; e.preventDefault(); } }}
                           >
                              <table className="text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content' }}>
                                 <thead>
                                    <tr className="border-b border-base-200 bg-base-100">
                                       <th className="sticky left-0 top-0 z-20 bg-base-100 text-left px-4 py-3 font-semibold text-xs opacity-50 min-w-[180px] border-r border-base-200">
                                          Şagird
                                       </th>
                                       {days.map(day => (
                                          <th key={day} className="py-3 text-center text-xs font-semibold opacity-50 w-10 min-w-[40px] bg-base-100 sticky top-0 z-[5]">{day}</th>
                                       ))}
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {students.map((student, index) => {
                                       const sid = student._id;
                                       const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                                       const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
                                       return (
                                          <tr key={sid} className="border-b border-base-200 last:border-0 bg-base-100 hover:bg-base-200/30 transition-colors">
                                             <td className="sticky left-0 z-10 bg-base-100 px-4 py-2.5 border-r border-base-200">
                                                <div className="flex items-center gap-2.5">
                                                   <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                                                      {initials || <FiUser size={11} />}
                                                   </div>
                                                   <span className="font-medium text-xs whitespace-nowrap">{student.name} {student.surname}</span>
                                                </div>
                                             </td>
                                             {days.map(day => {
                                                const att = getAttendenceForStudent(dayMap[day], sid);
                                                return (
                                                   <td key={day} className="py-2.5 text-center w-10">
                                                      {att === null ? (
                                                         <span className="text-xs opacity-20">—</span>
                                                      ) : att === true ? (
                                                         <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-sm">+</span>
                                                      ) : (
                                                         <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm">q</span>
                                                      )}
                                                   </td>
                                                );
                                             })}
                                          </tr>
                                       );
                                    })}
                                 </tbody>
                              </table>
                           </div>
                        ) : null}
                     </div>
                  );
               })()}
               {gradeEdit && (
                  <div className="modal modal-open z-50" role="dialog">
                     <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                        <div className="p-6 flex flex-col gap-5">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                                    <FiBook size={15} />
                                 </div>
                                 <div>
                                    <h3 className="text-base font-bold">Qiyməti Dəyiş</h3>
                                    <p className="text-xs opacity-40">
                                       {{ collegium1: 'Kollegium 1', collegium2: 'Kollegium 2', coursework: 'Kurswork', exam: 'İmtahan' }[gradeEdit.type]}
                                       · maks {GRADE_LIMITS[gradeEdit.type]}
                                    </p>
                                 </div>
                              </div>
                              <button onClick={() => setGradeEdit(null)} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                                 <FiX size={15} />
                              </button>
                           </div>

                           <div className="flex flex-col gap-1">
                              <label className="text-xs font-medium opacity-50 ml-1">
                                 Yeni qiymət (0 – {GRADE_LIMITS[gradeEdit.type]})
                              </label>
                              <input
                                 type="number"
                                 min={0}
                                 max={GRADE_LIMITS[gradeEdit.type]}
                                 value={gradeEditValue}
                                 onChange={e => setGradeEditValue(e.target.value)}
                                 className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                 placeholder={`0 - ${GRADE_LIMITS[gradeEdit.type]}`}
                                 autoFocus
                              />
                           </div>

                           {gradeEditError && <span className="text-red-400 text-xs text-center">{gradeEditError}</span>}

                           <div className="flex gap-3">
                              <button
                                 onClick={handleGradeEdit}
                                 disabled={gradeEditSubmitting}
                                 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                              >
                                 {gradeEditSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Yadda saxla'}
                              </button>
                              <button onClick={() => setGradeEdit(null)} className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                                 Ləğv et
                              </button>
                           </div>
                        </div>
                     </div>
                     <div className="modal-backdrop" onClick={() => setGradeEdit(null)} />
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

export default GroupSubjectDetail;