import React, { useState } from 'react';
import { FiBook, FiUser, FiEdit2, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import api from '../../scripts/api.js';

function SubjectModal({ subject, teachers, onClose, onUpdated }) {
   const [editMode, setEditMode] = useState(false);
   const [teacherMode, setTeacherMode] = useState(false);
   const [formData, setFormData] = useState({
      subject: subject.subject ?? '',
      semestr: subject.semestr ?? '',
      kredit: subject.kredit ?? '',
      totalHours: subject.totalHours ?? '',
   });
   const [submitting, setSubmitting] = useState(false);
   const [switchingTeacher, setSwitchingTeacher] = useState(false);
   const [error, setError] = useState('');
   const [teacherSearch, setTeacherSearch] = useState('');

   const currentTeacher = teachers.find(t => t._id === subject.teacherId?._id || t._id === subject.teacherId);
   const availableTeachers = teachers.filter(t => t._id !== (subject.teacherId?._id ?? subject.teacherId));
   const filteredTeachers = availableTeachers.filter(t =>
      `${t.name} ${t.surname}`.toLowerCase().includes(teacherSearch.toLowerCase())
   );

   const handleUpdate = async () => {
      try {
         setSubmitting(true); setError('');
         await api.patch(`/admin/updateSubject/${subject._id}`, {
            subject: formData.subject,
            semestr: Number(formData.semestr),
            kredit: Number(formData.kredit),
            totalHours: Number(formData.totalHours),
         });
         onUpdated(); setEditMode(false);
      } catch (err) { setError(err.response?.data?.message || 'Xəta baş verdi'); }
      finally { setSubmitting(false); }
   };

   const handleSwitchTeacher = async (teacherId) => {
      try {
         setSwitchingTeacher(teacherId); setError('');
         await api.patch(`/admin/switchSubjectTeacher/${subject._id}`, { teacherId });
         onUpdated(); onClose();
      } catch (err) { setError(err.response?.data?.message || 'Xəta baş verdi'); }
      finally { setSwitchingTeacher(false); }
   };

   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

               {/* Header */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white shadow-md shrink-0">
                        <FiBook size={16} />
                     </div>
                     <div>
                        <div className="font-bold text-base">{subject.subject}</div>
                        <div className="text-xs opacity-40">{subject.semestr}-ci semestr · {subject.kredit} kredit · {subject.totalHours} saat</div>
                     </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0">
                     <FiX size={15} />
                  </button>
               </div>

               {/* Teacher section */}
               {!teacherMode ? (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40 flex items-center gap-1"><FiUser size={11} /> Müəllim</span>
                        <button onClick={() => setTeacherMode(true)}
                           className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-base-200 text-xs font-semibold opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                           <FiEdit2 size={11} /> Müəllimi Dəyiş
                        </button>
                     </div>
                     {currentTeacher ? (
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                              {currentTeacher.name?.charAt(0)}{currentTeacher.surname?.charAt(0)}
                           </div>
                           <div>
                              <div className="font-semibold text-sm">{currentTeacher.name} {currentTeacher.surname}</div>
                              <div className="text-xs opacity-40">{currentTeacher.fatherName}</div>
                           </div>
                        </div>
                     ) : <div className="text-sm opacity-30">Müəllim tapılmadı</div>}
                  </div>
               ) : (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40">Yeni müəllim seçin</span>
                        <button onClick={() => setTeacherMode(false)} className="text-xs opacity-40 hover:opacity-100 transition-opacity"><FiX size={14} /></button>
                     </div>
                     <div className="relative">
                        <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <input type="text" value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)}
                           placeholder="Müəllim axtar..."
                           className="input w-full pl-8 pr-4 py-2 rounded-xl border border-base-200 bg-base-100 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" />
                     </div>
                     <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {filteredTeachers.length === 0 ? (
                           <div className="text-center opacity-30 py-4 text-sm">Heç nə tapılmadı</div>
                        ) : filteredTeachers.map(t => (
                           <button key={t._id} onClick={() => handleSwitchTeacher(t._id)} disabled={!!switchingTeacher}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-base-200 hover:border-[#8B5CF6]/40 hover:bg-gradient-to-r hover:from-[#8B5CF6]/10 hover:to-[#3B82F6]/10 text-left transition-all duration-200 disabled:opacity-50">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                                 {t.name?.charAt(0)}{t.surname?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="font-semibold text-sm truncate">{t.name} {t.surname}</div>
                                 <div className="text-xs opacity-40 truncate">{t.fatherName}</div>
                              </div>
                              {switchingTeacher === t._id && <span className="loading loading-spinner loading-xs" style={{ color: '#8B5CF6' }} />}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Edit subject info */}
               {!editMode ? (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40">Fənn məlumatları</span>
                        <button onClick={() => setEditMode(true)}
                           className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-base-200 text-xs font-semibold opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                           <FiEdit2 size={11} /> Redaktə Et
                        </button>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        {[
                           { label: 'Fənn adı', value: subject.subject },
                           { label: 'Semestr', value: subject.semestr },
                           { label: 'Kredit', value: subject.kredit },
                           { label: 'Saat', value: subject.totalHours },
                        ].map(({ label, value }) => (
                           <div key={label} className="flex flex-col gap-0.5">
                              <span className="text-xs opacity-40">{label}</span>
                              <span className="text-sm font-semibold">{value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-40">Redaktə</span>
                        <button onClick={() => setEditMode(false)} className="text-xs opacity-40 hover:opacity-100 transition-opacity"><FiX size={14} /></button>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs opacity-50 ml-1">Fənn adı</label>
                        <input type="text" value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-100 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" />
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {[{ name: 'semestr', label: 'Semestr' }, { name: 'kredit', label: 'Kredit' }, { name: 'totalHours', label: 'Saat' }].map(({ name, label }) => (
                           <div key={name} className="flex flex-col gap-1">
                              <label className="text-xs opacity-50 ml-1">{label}</label>
                              <input type="number" value={formData[name]} onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))}
                                 className="input w-full pl-3 pr-2 py-2.5 rounded-xl border border-base-200 bg-base-100 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" min={1} />
                           </div>
                        ))}
                     </div>
                     {error && <span className="text-red-400 text-xs">{error}</span>}
                     <div className="flex gap-2">
                        <button onClick={handleUpdate} disabled={submitting}
                           className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60">
                           {submitting ? <span className="loading loading-spinner loading-xs" /> : <><FiCheck size={13} /> Yadda saxla</>}
                        </button>
                        <button onClick={() => setEditMode(false)} className="flex-1 py-2 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                           Ləğv et
                        </button>
                     </div>
                  </div>
               )}

               {error && !editMode && <span className="text-red-400 text-xs text-center">{error}</span>}
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default SubjectModal;