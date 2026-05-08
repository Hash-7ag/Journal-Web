import React, { useState, useEffect } from 'react';
import api from '../../scripts/api';

function Groups() {
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
   const [selectedSubjectArr, setSelectedSubjectArr] = useState([]);
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
            setGroups(groupsRes.data);
            setSubjects(subjectsRes.data);
            setStudents(studentsRes.data);
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

         // Vizual göstəriş üçün value string-ləri
         const selectedValues = selectedOptions.map(o => o.value);
         setSelectedSubjectIds(selectedValues);

         // Backend üçün obyektlər
         const subjectObjs = selectedOptions.map(o => ({
            subject: o.value.split("-")[0],
            teacher: o.value.split("-")[1]
         }));

         setFormData(prev => ({ ...prev, subjects: subjectObjs }));

      } else {
         const selected = Array.from(e.target.selectedOptions).map(o => o.value);
         setFormData(prev => ({ ...prev, [field]: selected }));
      }
   };

   const handleAddGroup = async () => {
      const required = ['profession', 'groupNumber', 'groupShifr'];
      const missing = required.filter(field => !String(formData[field]).trim());
      if (missing.length) {
         setError(`Please fill: ${missing.join(', ')}`);
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
         console.log('Sending payload:', JSON.stringify(payload, null, 2));
         const response = await api.post('/admin/createGroup', payload);
         setGroups(prev => [response.data, ...prev]);
         setIsModalOpen(false);
         setFormData({ profession: '', groupNumber: '', groupShifr: '', subjects: [], students: [] });
         setError('');
      } catch (err) {
         console.error('Create group error:', err);
         setError(err.response?.data?.message || 'Failed to create group');
      } finally {
         setSubmitting(false);
      }
   };

   const groupColors = [
      'from-violet-500 to-purple-700',
      'from-blue-500 to-cyan-700',
      'from-emerald-500 to-teal-700',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-700',
      'from-indigo-500 to-blue-700',
   ];

   if (loading) {
      return <div className="flex justify-center items-center h-screen">Yüklənmə...</div>;
   }

   return (
      <div className="p-4">

         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <span className="text-xs opacity-60 tracking-wide">All Groups</span>
            <button
               onClick={() => setIsModalOpen(true)}
               className="p-2 rounded-lg text-md text-slate-300 hover:text-slate-200 bg-base-200 hover:bg-base-300 transition-colors duration-200"
            >
               Add Group +
            </button>
         </div>

         {/* Grid */}
         {groups.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No groups found</div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {groups.map((group, index) => {
                  const colorClass = groupColors[index % groupColors.length];
                  return (
                     <div
                        key={group._id || index}
                        className="bg-base-100 rounded-2xl shadow-md p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow duration-200"
                     >
                        {/* Circle with group number */}
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                           {group.groupNumber}
                        </div>

                        {/* Profession */}
                        <div className="text-sm font-semibold text-slate-300 text-center leading-tight">
                           {group.profession}
                        </div>

                        {/* Shifr */}
                        <div className="text-xs text-slate-600 tracking-widest">
                           #{group.groupShifr}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3 mt-1">
                           <span className="text-xs text-slate-500">
                              T: {group.students?.length ?? 0}
                           </span>
                           <span className="text-xs text-slate-500">
                              S: {group.subjects?.length ?? 0}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* Modal */}
         {isModalOpen && (
            <div className="modal modal-open" role="dialog">
               <div className="modal-box flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-center">Add Group</h3>

                  <div className="flex flex-col gap-3 w-full">

                     <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        className="input w-full border border-base-200 shadow-md p-3 text-lg hover:bg-base-200 text-slate-300"
                        placeholder="Profession"
                     />

                     <div className="flex gap-3">
                        <input
                           type="text"
                           name="groupNumber"
                           value={formData.groupNumber}
                           onChange={handleInputChange}
                           className="input w-full border border-base-200 shadow-md p-3 text-lg hover:bg-base-200 text-slate-300"
                           placeholder="Group Number"
                        />
                        <input
                           type="number"
                           name="groupShifr"
                           value={formData.groupShifr}
                           onChange={handleInputChange}
                           className="input w-full border border-base-200 shadow-md p-3 text-lg hover:bg-base-200 text-slate-300"
                           placeholder="Group Shifr"
                        />
                     </div>

                     {/* Subjects multi-select */}
                     <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend">Subjects</legend>
                        <select
                           multiple
                           value={selectedSubjectIds}
                           onChange={(e) => handleMultiSelect(e, 'subjects')}
                           className="select w-full border border-base-200 shadow-md text-slate-300 h-28"
                        >
                           {subjects.map(s => (
                              <option key={s._id} value={`${s._id}-${s.teacherId?._id}`}>{s.subject}</option>
                           ))}
                        </select>
                        <span className="label text-xs opacity-50">Hold Ctrl to select multiple</span>
                     </fieldset>

                     {/* Students multi-select */}
                     <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend">Students</legend>
                        <select
                           multiple
                           value={formData.students}
                           onChange={(e) => handleMultiSelect(e, 'students')}
                           className="select w-full border border-base-200 shadow-md text-slate-300 h-28"
                        >
                           {students.map(s => (
                              <option key={s._id} value={s._id}>{s.name} {s.surname}</option>
                           ))}
                        </select>
                        <span className="label text-xs opacity-50">Hold Ctrl to select multiple</span>
                     </fieldset>

                  </div>

                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                  <div className="modal-action flex gap-14 justify-center">
                     <button
                        onClick={handleAddGroup}
                        disabled={submitting}
                        className="btn py-2 px-6 rounded-md text-slate-300 bg-base-100 hover:bg-base-200 transition-colors duration-200"
                     >
                        {submitting ? 'Adding...' : 'Add'}
                     </button>
                     <button
                        onClick={() => { setIsModalOpen(false); setError(''); setSelectedSubjectIds([]); }}
                        className="btn py-2 px-6 rounded-md text-slate-300 bg-base-100 hover:bg-base-200 transition-colors duration-200"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default Groups;