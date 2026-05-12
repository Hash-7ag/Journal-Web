import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiBook, FiAward, FiAlertCircle } from 'react-icons/fi';

function GradeBox({ label, value, max, color }) {
   return (
      <div className="flex flex-col items-center gap-0.5">
         <span className="text-xs opacity-30">{label}</span>
         <span className={`text-sm font-bold ${value != null ? color : 'opacity-20'}`}>
            {value != null ? `${value}/${max}` : '—'}
         </span>
      </div>
   );
}

function StudentGrades() {
   const [profile, setProfile] = useState(null);
   const [subjects, setSubjects] = useState([]);
   const [grades, setGrades] = useState({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

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
            const subjectList = subjectsRes.data?.subjects?.map(s => s.subject).filter(Boolean) ?? [];
            setSubjects(subjectList);

            // fetch grades for each subject in parallel
            const gradeResults = await Promise.allSettled(
               subjectList.map(s =>
                  api.get(`/student/getMyGrades/${groupId}/${s._id}`)
               )
            );

            const gradesMap = {};
            subjectList.forEach((s, i) => {
               if (gradeResults[i].status === 'fulfilled') {
                  gradesMap[s._id] = gradeResults[i].value.data;
               } else {
                  gradesMap[s._id] = null;
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
      if (total == null) return '';
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
            <div role="alert" className="alert alert-error max-w-sm rounded-xl">
               <span>{error}</span>
            </div>
         </div>
      );
   }

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
            <div className="flex flex-col gap-3">
               {subjects.map((subject, index) => {
                  const g = grades[subject._id];
                  const total = calcTotal(g);
                  const colors = [
                     'from-[#8B5CF6] to-[#3B82F6]',
                     'from-[#3B82F6] to-[#60A5FA]',
                     'from-[#8B5CF6] to-[#A78BFA]',
                     'from-[#6366F1] to-[#8B5CF6]',
                     'from-[#A78BFA] to-[#60A5FA]',
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                     <div
                        key={subject._id}
                        className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
                     >
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}>
                           {subject.subject?.charAt(0).toUpperCase()}
                        </div>

                        {/* Subject name */}
                        <div className="w-36 shrink-0">
                           <div className="font-semibold text-sm truncate">{subject.subject}</div>
                           <div className="text-xs opacity-40 flex items-center gap-1 mt-0.5">
                              <FiBook size={10} />
                              {subject.kredit} kredit
                           </div>
                        </div>

                        <div className="w-px h-10 bg-base-200 shrink-0 hidden sm:block" />

                        {/* Grade boxes */}
                        <div className="flex-1 hidden sm:flex items-center justify-around gap-2">
                           <GradeBox label="Kollegium 1" value={g?.col1?.grade?.grade} max={10} color="text-blue-400" />
                           <GradeBox label="Kollegium 2" value={g?.col2?.grade?.grade} max={10} color="text-blue-400" />
                           <GradeBox label="Kurswork" value={g?.coursework?.grade?.grade} max={20} color="text-violet-400" />
                           <GradeBox label="Davamiyyət" value={g?.attendence?.grade?.grade} max={10} color={g?.limited ? 'text-red-400' : 'text-emerald-400'} />
                           <GradeBox label="İmtahan" value={g?.exam?.grade?.grade} max={50} color="text-orange-400" />
                        </div>

                        <div className="w-px h-10 bg-base-200 shrink-0 hidden sm:block" />

                        {/* Limited warning */}
                        {g?.limited && (
                           <div className="flex items-center gap-1 text-red-400 text-xs shrink-0">
                              <FiAlertCircle size={13} />
                              <span className="hidden lg:block">Buraxılmayıb</span>
                           </div>
                        )}

                        {/* Total */}
                        <div className="flex flex-col items-center shrink-0 min-w-[48px]">
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
   );
}

export default StudentGrades;