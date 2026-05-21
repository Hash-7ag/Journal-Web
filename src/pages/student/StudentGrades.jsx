import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiBook, FiAlertCircle, FiX, FiUser, FiPhone, FiMail, FiAward } from 'react-icons/fi';

function GradeRow({ label, value, max, color }) {
   return (
      <div className="flex items-center justify-between py-2.5 border-b border-base-200 last:border-0">
         <span className="text-xs opacity-50">{label}</span>
         <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-base-200 overflow-hidden">
               <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]"
                  style={{ width: value != null ? `${(value / max) * 100}%` : '0%' }}
               />
            </div>
            <span className={`text-sm font-bold min-w-[48px] text-right ${value != null ? color : 'opacity-20'}`}>
               {value != null ? `${value}/${max}` : `—/${max}`}
            </span>
         </div>
      </div>
   );
}

function StudentGrades() {
   const [profile, setProfile] = useState(null);
   const [subjects, setSubjects] = useState([]); // массив { subject, teacher, _id }
   const [grades, setGrades] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedItem, setSelectedItem] = useState(null);

   useEffect(() => {
      const fetchAll = async () => {
         try {
            setLoading(true);
            const profileRes = await api.get('/student/getMyProfile');
            const studentData = profileRes.data;
            setProfile(studentData);

            const groupId = studentData.group?._id ?? studentData.group;
            if (!groupId) return;

            const subjectsRes = await api.get(`/student/getMySubjects/${groupId}`);
            // ✅ сохраняем весь item { subject, teacher, _id }
            const subjectList = subjectsRes.data?.subjects?.filter(item => item.subject) ?? [];
            setSubjects(subjectList);

            // ✅ ключ = subject._id
            const gradeResults = await Promise.allSettled(
               subjectList.map(item =>
                  api.get(`/student/getMyGrades/${groupId}/${item.subject._id}`)
               )
            );

            const gradesMap = {};
            subjectList.forEach((item, i) => {
               if (gradeResults[i].status === 'fulfilled') {
                  gradesMap[item.subject._id] = gradeResults[i].value.data;
               } else {
                  gradesMap[item.subject._id] = null;
               }
            });
            setGrades(gradesMap);

         } catch (err) {
            setError(err.message || 'Yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      fetchAll();
   }, []);

   const calcTotal = (g) => {
      if (!g) return null;
      const col1 = g.col1?.grade?.grade ?? 0;
      const col2 = g.col2?.grade?.grade ?? 0;
      const cw = g.coursework?.grade?.grade ?? 0;
      const att = g.attendence?.grade?.grade ?? 0;
      const exam = g.exam?.grade?.grade ?? 0;
      return col1 + col2 + cw + att + exam;
   };

   const totalColor = (total) => {
      if (total == null) return 'opacity-20';
      if (total >= 85) return 'text-emerald-500';
      if (total >= 60) return 'text-blue-400';
      if (total >= 51) return 'text-yellow-400';
      return 'text-red-400';
   };

   const cardColors = [
      'from-[#8B5CF6] to-[#3B82F6]',
      'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]',
      'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]',
   ];

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

   // данные выбранного предмета
   const selSubject = selectedItem?.subject;
   const selTeacher = selectedItem?.teacher;
   const selGrade = selectedItem ? grades[selSubject._id] : null;
   const selTotal = calcTotal(selGrade);
   const selIndex = selectedItem ? subjects.findIndex(s => s.subject._id === selSubject._id) : 0;
   const selColor = cardColors[selIndex % cardColors.length];

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Header */}
         <div className="mb-8">
            <h1 className="text-lg font-bold">Qiymətlərim</h1>
            <p className="text-xs opacity-40 mt-0.5">
               {profile?.name} {profile?.surname} — bütün fənlər üzrə qiymətlər
            </p>
         </div>

         {subjects.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir fənn tapılmadı</div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {subjects.map((item, index) => {
                  const subject = item.subject;
                  const g = grades[subject._id];
                  const total = calcTotal(g);
                  const colorClass = cardColors[index % cardColors.length];
                  const isLimited = g?.attendence?.limited;

                  return (
                     <div
                        key={subject._id}
                        onClick={() => setSelectedItem(item)}
                        className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                     >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                           {subject.subject?.charAt(0).toUpperCase()}
                        </div>

                        {/* Name */}
                        <div>
                           <div className="font-semibold text-sm leading-tight">{subject.subject}</div>
                           <div className="text-xs opacity-40 mt-0.5 flex items-center gap-1">
                              <FiBook size={10} />
                              {subject.kredit} kredit
                           </div>
                        </div>

                        <div className="w-full h-px bg-base-200" />

                        {/* Total */}
                        <div className="flex items-center justify-between">
                           <span className="text-xs opacity-40">Yekun</span>
                           <div className="flex items-baseline gap-0.5">
                              <span className={`text-xl font-bold ${totalColor(total)}`}>
                                 {total != null ? total : '—'}
                              </span>
                              <span className="text-xs opacity-20">/100</span>
                           </div>
                        </div>

                        {/* Limited badge */}
                        {isLimited && (
                           <div className="flex items-center gap-1 text-red-400 text-xs">
                              <FiAlertCircle size={11} />
                              Buraxılmayıb
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         )}

         {/* Detail modal */}
         {selectedItem && (
            <div className="modal modal-open z-50" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">

                  {/* Top gradient bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${selColor}`} />

                  <div className="p-6 flex flex-col gap-5">

                     {/* Header row */}
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${selColor} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}>
                              {selSubject?.subject?.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <div className="font-bold text-base">{selSubject?.subject}</div>
                              <div className="text-xs opacity-40">
                                 {selSubject?.kredit} kredit · {selSubject?.totalHours} saat · {selSubject?.semestr}-ci semestr
                              </div>
                           </div>
                        </div>
                        <button
                           onClick={() => setSelectedItem(null)}
                           className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                        >
                           <FiX size={15} />
                        </button>
                     </div>

                     {/* Teacher info */}
                     {selTeacher && (
                        <div className="bg-base-200/50 rounded-xl p-4 flex flex-col gap-3 border border-base-200">
                           <div className="text-xs font-semibold opacity-40 flex items-center gap-1">
                              <FiUser size={11} /> Müəllim
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                 {selTeacher.name?.charAt(0)}{selTeacher.surname?.charAt(0)}
                              </div>
                              <div>
                                 <div className="font-semibold text-sm">
                                    {selTeacher.name} {selTeacher.surname}
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col gap-1.5">
                              {selTeacher.phoneNumber && (
                                 <div className="flex items-center gap-1.5 text-xs opacity-50">
                                    <FiPhone size={11} />
                                    {selTeacher.phoneNumber}
                                 </div>
                              )}
                              {selTeacher.email && (
                                 <div className="flex items-center gap-1.5 text-xs opacity-50">
                                    <FiMail size={11} />
                                    {selTeacher.email}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Grades */}
                     <div className="bg-base-200/50 rounded-xl p-4 border border-base-200">
                        <div className="text-xs font-semibold opacity-40 mb-3 flex items-center gap-1">
                           <FiAward size={11} /> Qiymətlər
                        </div>
                        <GradeRow label="Kollegium 1" value={selGrade?.col1?.grade?.grade} max={10} color="text-blue-400" />
                        <GradeRow label="Kollegium 2" value={selGrade?.col2?.grade?.grade} max={10} color="text-blue-400" />
                        <GradeRow label="Kurswork" value={selGrade?.coursework?.grade?.grade} max={20} color="text-violet-400" />
                        <GradeRow
                           label="Davamiyyət"
                           value={selGrade?.attendence?.grade?.grade}
                           max={10}
                           color={selGrade?.attendence?.limited ? 'text-red-400' : 'text-emerald-400'}
                        />
                        <GradeRow label="İmtahan" value={selGrade?.exam?.grade?.grade} max={50} color="text-orange-400" />
                     </div>

                     {/* Limited warning */}
                     {selGrade?.attendence?.limited && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border border-red-100 dark:border-red-900">
                           <FiAlertCircle size={14} />
                           Bu fəndən davamiyyət limiti aşılıb — buraxılmayıb
                        </div>
                     )}

                     {/* Total */}
                     <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-semibold opacity-60">Yekun bal</span>
                        <div className="flex items-baseline gap-1">
                           <span className={`text-3xl font-bold ${totalColor(selTotal)}`}>
                              {selTotal != null ? selTotal : '—'}
                           </span>
                           <span className="text-sm opacity-30">/100</span>
                        </div>
                     </div>

                  </div>
               </div>
               <div className="modal-backdrop" onClick={() => setSelectedItem(null)} />
            </div>
         )}
      </div>
   );
}

export default StudentGrades;