import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { FiPlus, FiUsers, FiBook, FiArrowRight } from 'react-icons/fi';

function Groups() {
   const navigate = useNavigate();

   const [groups, setGroups] = useState([]);
   const [subjects, setSubjects] = useState([]);
   const [students, setStudents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      profession: '',
      groupNumber: '',
      groupShifr: '',
      subjects: [],
      students: [],
   });
   const [submitting, setSubmitting] = useState(false);
   const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [groupsRes, subjectsRes, studentsRes] = await Promise.all([
               api.get('/admin/getAllGroups'),
               api.get('/admin/getAllSubjects'),
               api.get('/admin/getAllStudents'),
            ]);
            setGroups(groupsRes.data.data);
            setSubjects(subjectsRes.data.data);
            setStudents(studentsRes.data.data);
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

   const handleMultiSelect = (e, field) => {
      if (field === 'subjects') {
         const selectedOptions = Array.from(e.target.selectedOptions);
         setSelectedSubjectIds(selectedOptions.map(o => o.value));
         setFormData(prev => ({
            ...prev,
            subjects: selectedOptions.map(o => ({
               subject: o.value.split("-")[0],
               teacher: o.value.split("-")[1]
            }))
         }));
      } else {
         const selected = Array.from(e.target.selectedOptions).map(o => o.value);
         setFormData(prev => ({ ...prev, [field]: selected }));
      }
   };

   const handleAddGroup = async () => {
      const required = ['profession', 'groupNumber', 'groupShifr'];
      const missing = required.filter(field => !String(formData[field]).trim());
      if (missing.length) {
         setError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
         return;
      }

      if (String(formData.groupShifr).length !== 9) {
         setError('Qrup şifrəsi 9 rəqəmdən ibarət olmalıdır');
         return;
      }
      try {
         setSubmitting(true);
         const payload = {
            profession: formData.profession,
            groupNumber: formData.groupNumber,
            groupShifr: Number(formData.groupShifr),
            subjects: formData.subjects,
            students: formData.students.map(id => ({ student: String(id) })),
         };
         await api.post('/admin/createGroup', payload);

         // Bütün grupları yeniləyirik və kart özü yenilənir
         const groupsRes = await api.get('/admin/getAllGroups');
         setGroups(groupsRes.data.data);

         setIsModalOpen(false);
         setFormData({ profession: '', groupNumber: '', groupShifr: '', subjects: [], students: [] });
         setSelectedSubjectIds([]);
         setError('');
      } catch (err) {
         setError(err.response?.data?.message || 'Failed to create group');
      } finally {
         setSubmitting(false);
      }
   };

   const groupColors = [
      'from-[#8B5CF6] to-[#3B82F6]',
      'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]',
      'from-[#6366F1] to-[#8B5CF6]',
      'from-[#3B82F6] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]',
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
               <h1 className="text-lg font-bold">Qruplar</h1>
               <p className="text-xs opacity-40 mt-0.5">Bütün qrupların siyahısı</p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} />
               Qrup əlavə et
            </button>
         </div>

         {/* Grid */}
         {groups.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir qrup tapılmadı</div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {groups.map((group, index) => {
                  const colorClass = groupColors[index % groupColors.length];
                  return (
                     <div
                        key={group._id || index}
                        onClick={() => navigate(`/groups/${group._id}`, { state: { group } })}
                        className="group bg-base-100 border border-base-200 rounded-2xl shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                     >
                        {/* Circle */}
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                           {group.groupNumber}
                        </div>

                        {/* Profession */}
                        <div className="text-sm font-semibold text-center leading-tight">
                           {group.profession}
                        </div>

                        {/* Shifr */}
                        <div className="text-xs opacity-30 tracking-widest font-mono">
                           #{group.groupShifr}
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-base-200" />

                        {/* Stats + arrow */}
                        <div className="flex gap-4 w-full justify-center items-center">
                           <div className="flex items-center gap-1 text-xs opacity-50">
                              <FiUsers size={12} />
                              {group.students?.length ?? 0}
                           </div>
                           <div className="flex items-center gap-1 text-xs opacity-50">
                              <FiBook size={12} />
                              {group.subjects?.length ?? 0}
                           </div>
                           <FiArrowRight
                              size={12}
                              className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity duration-200"
                           />
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
                        <FiPlus size={18} />
                     </div>
                     <h3 className="text-lg font-bold">Yeni qrup</h3>
                     <p className="text-xs opacity-40">Məlumatları doldurun</p>
                  </div>

                  <div className="flex flex-col gap-3 w-full">

                     {/* Profession */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">İxtisas</label>
                        <input
                           type="text"
                           name="profession"
                           value={formData.profession}
                           onChange={handleInputChange}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                           placeholder="İxtisas adı"
                        />
                     </div>

                     {/* Group number + shifr */}
                     <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                           <label className="text-xs font-medium opacity-50 ml-1">Qrup nömrəsi</label>
                           <input
                              type="text"
                              name="groupNumber"
                              value={formData.groupNumber}
                              onChange={handleInputChange}
                              className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              placeholder="Məs: 101"
                           />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                           <label className="text-xs font-medium opacity-50 ml-1">Şifrə</label>
                           <input
                              type="number"
                              name="groupShifr"
                              value={formData.groupShifr}
                              onChange={(e) => {
                                 if (e.target.value.length <= 9) {
                                    handleInputChange(e);
                                 }
                              }}
                              className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                              placeholder="Məs: 2401"
                           />
                        </div>
                     </div>

                     {/* Subjects */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Fənlər</label>
                        <select
                           multiple
                           value={selectedSubjectIds}
                           onChange={(e) => handleMultiSelect(e, 'subjects')}
                           className="select w-full rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm h-28"
                        >
                           {subjects.map(s => (
                              <option key={s._id} value={`${s._id}-${s.teacherId?._id}`}>
                                 {s.subject}
                              </option>
                           ))}
                        </select>
                        <span className="text-xs opacity-30 ml-1">Çoxlu seçim üçün Ctrl basın</span>
                     </div>

                     {/* Students */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Şagirdlər</label>
                        <select
                           multiple
                           value={formData.students}
                           onChange={(e) => handleMultiSelect(e, 'students')}
                           className="select w-full rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm h-28"
                        >
                           {students.map(s => (
                              <option key={s._id} value={s._id}>
                                 {s.name} {s.surname}
                              </option>
                           ))}
                        </select>
                        <span className="text-xs opacity-30 ml-1">Çoxlu seçim üçün Ctrl basın</span>
                     </div>
                  </div>

                  {error && (
                     <span className="text-red-400 text-xs text-center">{error}</span>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                     <button
                        onClick={handleAddGroup}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                     >
                        {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
                     </button>
                     <button
                        onClick={() => { setIsModalOpen(false); setError(''); setSelectedSubjectIds([]); }}
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

export default Groups;