import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiBook, FiAlertCircle, FiClock } from 'react-icons/fi';
import SubjectGradeModal from '../../components/students/SubjectGradeModal';
import SemestrSwitcher from '../../components/group/SemestrSwitcher';
import { toRoman } from '../../scripts/roman.js';

const cardColors = [
   'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
   'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
   'from-[#A78BFA] to-[#60A5FA]',
];

const calcTotal = (g) => {
   if (!g) return null;
   const vals = [
      g.col1?.grade?.grade ?? 0,
      g.col2?.grade?.grade ?? 0,
      g.coursework?.grade?.grade ?? 0,
      g.attendence?.grade?.grade ?? 0,
      g.exam?.grade?.grade ?? 0,
   ];
   return vals.some(v => v > 0) ? vals.reduce((a, b) => a + b, 0) : null;
};

const totalColor = (total) => {
   if (total == null) return 'opacity-20';
   if (total >= 85) return 'text-emerald-500';
   if (total >= 60) return 'text-blue-400';
   if (total >= 51) return 'text-yellow-400';
   return 'text-red-400';
};

function StudentGrades() {
   const [profile, setProfile] = useState(null);
   const [groupId, setGroupId] = useState(null);
   const [subjects, setSubjects] = useState([]);
   const [grades, setGrades] = useState({});
   const [loading, setLoading] = useState(true);
   const [subjectsLoading, setSubjectsLoading] = useState(false);
   const [error, setError] = useState('');
   const [selectedItem, setSelectedItem] = useState(null);

   // семестры
   const [currentSemestr, setCurrentSemestr] = useState(null);
   const [shownSemestr, setShownSemestr] = useState(null);
   const [otherSemestrs, setOtherSemestrs] = useState([]);

   const isArchive = shownSemestr != null && currentSemestr != null && shownSemestr !== currentSemestr;

   // грузим предметы + оценки для семестра
   const fetchSubjectsAndGrades = async (gid, targetSemestr) => {
      try {
         setSubjectsLoading(true);
         const subjectsRes = await api.post(`/student/getMySubjects/${gid}`, { semestr: targetSemestr });
         const subjectList = subjectsRes.data?.subjects?.filter(item => item.subject) ?? [];
         setSubjects(subjectList);
         setShownSemestr(subjectsRes.data.shownSemestr);
         setCurrentSemestr(subjectsRes.data.currentSemestr);

         const gradeResults = await Promise.allSettled(
            subjectList.map(item => api.get(`/student/getMyGrades/${gid}/${item.subject._id}`))
         );
         const gradesMap = {};
         subjectList.forEach((item, i) => {
            gradesMap[item.subject._id] = gradeResults[i].status === 'fulfilled'
               ? gradeResults[i].value.data
               : null;
         });
         setGrades(gradesMap);
      } catch (err) {
         setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
      } finally {
         setSubjectsLoading(false);
      }
   };

   useEffect(() => {
      const init = async () => {
         try {
            setLoading(true);
            const profileRes = await api.get('/student/getMyProfile');
            const studentData = profileRes.data;
            setProfile(studentData);

            const gid = studentData.group?._id ?? studentData.group;
            const groupSemestr = studentData.group?.semestr;
            if (!gid) { setLoading(false); return; }
            setGroupId(gid);

            // текущий семестр группы + прошлые семестры
            await fetchSubjectsAndGrades(gid, groupSemestr);
            const otherRes = await api.post(`/student/getOtherSemestrs/${gid}`, { semestr: groupSemestr });
            setOtherSemestrs(otherRes.data ?? []);
         } catch (err) {
            setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      init();
   }, []);

   const handleSelectSemestr = (s) => {
      if (!groupId || s === shownSemestr) return;
      fetchSubjectsAndGrades(groupId, s);
   };

   if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]"><span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} /></div>;
   if (error) return <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]"><div role="alert" className="alert alert-error max-w-sm rounded-xl"><span>{error}</span></div></div>;

   const selIndex = selectedItem ? subjects.findIndex(s => s.subject._id === selectedItem.subject._id) : 0;

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
         <div className="mb-6">
            <h1 className="text-lg font-bold">Qiymətlərim</h1>
            <p className="text-xs opacity-40 mt-0.5">{profile?.name} {profile?.surname} — bütün fənlər üzrə qiymətlər</p>
         </div>

         {/* Семестр переключатель */}
         {currentSemestr != null && (
            <div className="mb-5">
               <SemestrSwitcher
                  currentSemestr={currentSemestr}
                  shownSemestr={shownSemestr}
                  otherSemestrs={otherSemestrs}
                  onSelect={handleSelectSemestr}
               />
            </div>
         )}

         {/* Бейдж архива */}
         {isArchive && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1] text-sm font-medium">
               <FiClock size={14} />
               Köhnə semestr ({toRoman(shownSemestr)}) — keçmiş qiymətlər
            </div>
         )}

         {subjectsLoading ? (
            <div className="flex justify-center py-16"><span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} /></div>
         ) : subjects.length === 0 ? (
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
                     <div key={subject._id} onClick={() => setSelectedItem(item)}
                        className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                           {subject.subject?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <div className="font-semibold text-sm leading-tight">{subject.subject}</div>
                           <div className="text-xs opacity-40 mt-0.5 flex items-center gap-1"><FiBook size={10} />{subject.kredit} kredit</div>
                        </div>
                        <div className="w-full h-px bg-base-200" />
                        <div className="flex items-center justify-between">
                           <span className="text-xs opacity-40">Yekun</span>
                           <div className="flex items-baseline gap-0.5">
                              <span className={`text-xl font-bold ${totalColor(total)}`}>{total != null ? total : '—'}</span>
                              <span className="text-xs opacity-20">/100</span>
                           </div>
                        </div>
                        {isLimited && (
                           <div className="flex items-center gap-1 text-red-400 text-xs">
                              <FiAlertCircle size={11} /> Buraxılmayıb
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         )}

         <SubjectGradeModal
            item={selectedItem}
            grade={selectedItem ? grades[selectedItem.subject._id] : null}
            color={cardColors[selIndex % cardColors.length]}
            totalColor={totalColor}
            onClose={() => setSelectedItem(null)}
         />
      </div>
   );
}

export default StudentGrades;