import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiClock, FiBook } from 'react-icons/fi';

function Subjects() {
   const [subjects, setSubjects] = useState([]);
   const [teachers, setTeachers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      teacherId: '',
      subject: '',
      semestr: '',
      kredit: '',
      totalHours: '',
   });
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [subjectsRes, teachersRes] = await Promise.all([
               api.get('/admin/getAllSubjects'),
               api.get('/admin/getAllTeachers'),
            ]);
            setSubjects(subjectsRes.data.data);
            setTeachers(teachersRes.data.data);
         } catch (err) {
            console.error('Yüklənmə zamanı xəta:', err);
            setError(err.message || 'Yükləmə xətası');
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleAddSubject = async () => {
      const required = ['teacherId', 'subject', 'semestr', 'kredit', 'totalHours'];
      const missing = required.filter(field => !String(formData[field]).trim());
      if (missing.length) {
         setError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
         return;
      }
      try {
         setSubmitting(true);
         const response = await api.post('/admin/createSubject', {
            ...formData,
            semestr: Number(formData.semestr),
            kredit: Number(formData.kredit),
            totalHours: Number(formData.totalHours),
         });
         const newSubject = response?.data?.data;
         setSubjects(prev => [newSubject, ...prev]);
         setIsModalOpen(false);
         setFormData({ teacherId: '', subject: '', semestr: '', kredit: '', totalHours: '' });
         setError('');
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to create subject');
      } finally {
         setSubmitting(false);
      }
   };

   const getTeacherName = (teacherId) => {
      const teacher = teachers.find(t => t._id === teacherId?._id || t._id === teacherId);
      return teacher ? `${teacher.name} ${teacher.surname}` : '—';
   };

   const subjectColors = [
      'from-[#8B5CF6] to-[#3B82F6]',
      'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]',
      'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]',
      'from-[#3B82F6] to-[#8B5CF6]',
   ];

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
         </div>
      );
   }

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Page header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Fənlər</h1>
               <p className="text-xs opacity-40 mt-0.5">Bütün fənlərin siyahısı</p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} />
               Fənn əlavə et
            </button>
         </div>

         {/* List */}
         {subjects.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir fənn tapılmadı</div>
         ) : (
            <div className="flex flex-col gap-3">
               {subjects.map((subject, index) => {
                  const colorClass = subjectColors[index % subjectColors.length];
                  return (
                     <div
                        key={subject._id || index}
                        className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200"
                     >
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}>
                           {subject.subject?.charAt(0).toUpperCase()}
                        </div>

                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                           <div className="font-semibold text-sm truncate">{subject.subject}</div>
                           <div className="flex items-center gap-1 text-xs opacity-40 mt-0.5">
                              <FiUser size={11} />
                              {getTeacherName(subject.teacherId)}
                           </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-4 shrink-0">
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs opacity-30">Semestr</span>
                              <span className="text-sm font-semibold">{subject.semestr}</span>
                           </div>
                           <div className="w-px h-8 bg-base-200" />
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs opacity-30">Kredit</span>
                              <span className="text-sm font-semibold">{subject.kredit}</span>
                           </div>
                           <div className="w-px h-8 bg-base-200" />
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs opacity-30 flex items-center gap-1"><FiClock size={10} /> Saat</span>
                              <span className="text-sm font-semibold">{subject.totalHours}</span>
                           </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                           <button className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                           </button>
                           <button className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                 <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* Modal */}
         {isModalOpen && (
            <div className="modal modal-open" role="dialog">
               <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8">

                  {/* Modal header */}
                  <div className="flex flex-col items-center gap-1 text-center">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                        <FiBook size={18} />
                     </div>
                     <h3 className="text-lg font-bold">Yeni fənn</h3>
                     <p className="text-xs opacity-40">Məlumatları doldurun</p>
                  </div>

                  <div className="flex flex-col gap-3 w-full">

                     {/* Teacher select */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Müəllim</label>
                        <select
                           name="teacherId"
                           value={formData.teacherId}
                           onChange={handleInputChange}
                           className="select w-full rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                        >
                           <option disabled value="">Müəllim seçin</option>
                           {teachers.map(teacher => (
                              <option key={teacher._id} value={teacher._id}>
                                 {teacher.name} {teacher.surname}
                              </option>
                           ))}
                        </select>
                     </div>

                     {/* Subject name */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Fənnin adı</label>
                        <input
                           type="text"
                           name="subject"
                           value={formData.subject}
                           onChange={handleInputChange}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder="Məs: Riyaziyyat"
                        />
                     </div>

                     {/* Semestr / Kredit / Hours */}
                     <div className="flex gap-3">
                        {[
                           { name: 'semestr', label: 'Semestr', placeholder: '1' },
                           { name: 'kredit', label: 'Kredit', placeholder: '3' },
                           { name: 'totalHours', label: 'Saat', placeholder: '60' },
                        ].map(({ name, label, placeholder }) => (
                           <div key={name} className="flex flex-col gap-1 flex-1">
                              <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                              <input
                                 type="number"
                                 name={name}
                                 value={formData[name]}
                                 onChange={handleInputChange}
                                 className="input w-full pl-4 pr-2 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                                 placeholder={placeholder}
                                 min={1}
                              />
                           </div>
                        ))}
                     </div>
                  </div>

                  {error && (
                     <span className="text-red-400 text-xs text-center">{error}</span>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                     <button
                        onClick={handleAddSubject}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                     >
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button
                        onClick={() => { setIsModalOpen(false); setError(''); }}
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

export default Subjects;