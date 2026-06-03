import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiBook, FiUsers, FiX } from 'react-icons/fi';
import api from '../../scripts/api.js';

function TeacherInfoModal({ teacher, onClose }) {
   const [groups, setGroups] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!teacher) return;

      let cancelled = false;

      const load = async () => {
         setLoading(true);
         setGroups([]);
         try {
            const res = await api.get(`/admin/getTeacherInfo/${teacher._id}`);
            if (!cancelled) setGroups(res.data ?? []);
         } catch {
            if (!cancelled) setGroups([]);
         } finally {
            if (!cancelled) setLoading(false);
         }
      };

      load();

      return () => { cancelled = true; };
   }, [teacher]);
   if (!teacher) return null;

   const initials = `${teacher.name?.charAt(0) ?? ''}${teacher.surname?.charAt(0) ?? ''}`.toUpperCase();
   const groupColors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];
   const subColors = ['from-[#8B5CF6] to-[#A78BFA]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#6366F1] to-[#8B5CF6]'];

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
                  <span className="text-xs opacity-40">Yüklənir...</span>
               </div>
            ) : (
               <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                           {initials || <FiUser size={18} />}
                        </div>
                        <div>
                           <div className="font-bold text-base">{teacher.name} {teacher.surname}</div>
                           <div className="text-xs opacity-40">{teacher.fatherName}</div>
                        </div>
                     </div>
                     <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0">
                        <FiX size={15} />
                     </button>
                  </div>

                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-40 flex items-center gap-1"><FiUser size={11} /> Ad Soyad Ata adı</span>
                        <span className="text-sm font-semibold">{teacher.name} {teacher.surname} {teacher.fatherName}</span>
                     </div>
                     <div className="w-full h-px bg-base-200" />
                     <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-40 flex items-center gap-1"><FiPhone size={11} /> Telefon</span>
                        <span className="text-sm font-semibold">{teacher.phoneNumber || '—'}</span>
                     </div>
                     <div className="w-full h-px bg-base-200" />
                     <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-40 flex items-center gap-1"><FiMail size={11} /> Email</span>
                        <span className="text-sm font-semibold">{teacher.email || '—'}</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <div className="text-xs font-semibold opacity-40 flex items-center gap-1"><FiUsers size={11} /> Qruplar və fənlər</div>
                     {groups.length === 0 ? (
                        <div className="text-center opacity-30 py-6 text-sm">Heç bir qrup tapılmadı</div>
                     ) : groups.map((group, gi) => {
                        const mySubjects = group.subjects?.filter(item =>
                           item.teacher?.toString() === teacher._id ||
                           item.teacher?._id?.toString() === teacher._id
                        ) ?? [];
                        return (
                           <div key={group._id} className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
                              <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200">
                                 <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${groupColors[gi % groupColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                                    {group.groupNumber}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{group.profession}</div>
                                    <div className="text-xs opacity-30 font-mono">#{group.groupShifr}</div>
                                 </div>
                              </div>
                              <div className="p-3 flex flex-col gap-2">
                                 {mySubjects.length === 0 ? (
                                    <div className="text-xs opacity-30 text-center py-2">Fənn tapılmadı</div>
                                 ) : mySubjects.map((item, si) => {
                                    const subject = item.subject ?? item;
                                    return (
                                       <div key={subject._id ?? si} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-base-200 bg-base-200/30">
                                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${subColors[si % subColors.length]} flex items-center justify-center text-white shrink-0`}>
                                             <FiBook size={12} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="text-sm font-semibold truncate">{subject.subject ?? '—'}</div>
                                             <div className="flex items-center gap-2 mt-0.5">
                                                {subject.semestr && <span className="text-xs opacity-40">{subject.semestr}-ci semestr</span>}
                                                {subject.kredit && <span className="text-xs opacity-40">{subject.kredit} kredit</span>}
                                                {subject.totalHours && <span className="text-xs opacity-40">{subject.totalHours} saat</span>}
                                             </div>
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}
         </div>
         {!loading && <div className="modal-backdrop" onClick={onClose} />}
      </div>
   );
}

export default TeacherInfoModal;