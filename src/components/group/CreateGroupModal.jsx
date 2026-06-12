import React from 'react';
import { FiSearch, FiCheck, FiUser, FiClock, FiX, FiAlertCircle } from 'react-icons/fi';
import InfiniteList from '../ui/InfiniteList';
import SemestrPicker from './SemestrPicker';

function CreateGroupModal({
   step, formData, onFormChange, stepError, onClose,
   selectedSubjectIds, subjectSearch, onSubjectSearch, filteredSubjects, onToggleSubject, subjectLoadingMore, subjectHasMore, onLoadMoreSubjects,
   selectedStudentIds, studentSearch, onStudentSearch, filteredStudents, onToggleStudent, studentLoadingMore, studentHasMore, onLoadMoreStudents,
   onStep1Next, onStep2Next, onBack, onSubmit, submitting,
}) {
   const colors = ['from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]', 'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]'];

   return (
      <div className="modal modal-open z-40" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="flex flex-col gap-0 flex-1">

               {/* Header */}
               <div className="flex items-center justify-between px-8 pt-7 pb-4">
                  <div>
                     <h3 className="text-lg font-bold">
                        {step === 1 && 'Yeni qrup'}
                        {step === 2 && 'Fənlər seçin'}
                        {step === 3 && 'Şagirdlər seçin'}
                     </h3>
                     <p className="text-xs opacity-40 mt-0.5">
                        {step === 1 && 'Əsas məlumatları doldurun'}
                        {step === 2 && `${selectedSubjectIds.length} fənn seçilib`}
                        {step === 3 && `${selectedStudentIds.length} şagird seçilib`}
                     </p>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200">
                     <FiX size={15} />
                  </button>
               </div>

               {/* Step 1 */}
               {step === 1 && (
                  <div className="px-8 pb-2 flex flex-col gap-3">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium opacity-50 ml-1">İxtisas</label>
                        <input type="text" value={formData.profession} onChange={e => onFormChange('profession', e.target.value)}
                           className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" placeholder="İxtisas adı" />
                     </div>
                     <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                           <label className="text-xs font-medium opacity-50 ml-1">Qrup nömrəsi</label>
                           <input type="number" value={formData.groupNumber} onChange={e => onFormChange('groupNumber', e.target.value)}
                              className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" placeholder="Məs: 101" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                           <label className="text-xs font-medium opacity-50 ml-1">Şifrə</label>
                           <input type="number" value={formData.groupShifr} onChange={e => onFormChange('groupShifr', e.target.value)}
                              className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" placeholder="Məs: 240101" />
                        </div>
                     </div>
                     <div className="flex flex-col gap-2 mt-1">
                        <label className="text-xs font-medium opacity-50 ml-1">Semestr</label>
                        <SemestrPicker value={formData.semestr} onChange={v => onFormChange('semestr', v)} />
                     </div>
                  </div>
               )}

               {/* Step 2 */}
               {step === 2 && (
                  <div className="px-8 pb-2 flex flex-col gap-3">
                     <div className="relative">
                        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <input type="text" value={subjectSearch} onChange={e => onSubjectSearch(e.target.value)}
                           placeholder="Fənn və ya müəllim axtar..."
                           className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" />
                     </div>
                     <InfiniteList loadingMore={subjectLoadingMore} hasMore={subjectHasMore} onLoadMore={onLoadMoreSubjects}>
                        {filteredSubjects.length === 0 ? (
                           <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
                        ) : filteredSubjects.map(s => {
                           const isSelected = selectedSubjectIds.includes(s._id);
                           const teacher = s.teacherId;
                           return (
                              <button key={s._id} onClick={() => onToggleSubject(s._id)}
                                 className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}>
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : 'bg-base-300'}`}>
                                    {isSelected ? <FiCheck size={16} /> : <span className="text-base-content/50 text-sm">{s.subject?.charAt(0).toUpperCase()}</span>}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{s.subject}</div>
                                    {teacher && <div className="flex items-center gap-1 text-xs opacity-50 mt-0.5"><FiUser size={10} />{teacher.name} {teacher.surname}</div>}
                                 </div>
                                 <div className="flex flex-col items-end gap-1 shrink-0">
                                    {s.semestr && <span className="text-xs opacity-40">{s.semestr}-ci semestr</span>}
                                    <div className="flex items-center gap-2">
                                       {s.kredit && <span className="text-xs opacity-40">{s.kredit} kredit</span>}
                                       {s.totalHours && <div className="flex items-center gap-0.5 text-xs opacity-40"><FiClock size={10} />{s.totalHours}h</div>}
                                    </div>
                                 </div>
                              </button>
                           );
                        })}
                     </InfiniteList>
                  </div>
               )}

               {/* Step 3 */}
               {step === 3 && (
                  <div className="px-8 pb-2 flex flex-col gap-3">
                     <div className="relative">
                        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                        <input type="text" value={studentSearch} onChange={e => onStudentSearch(e.target.value)}
                           placeholder="Şagird axtar..."
                           className="input w-full pl-9 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm" />
                     </div>
                     <InfiniteList loadingMore={studentLoadingMore} hasMore={studentHasMore} onLoadMore={onLoadMoreStudents}>
                        {filteredStudents.length === 0 ? (
                           <div className="text-center opacity-30 py-8 text-sm">Heç nə tapılmadı</div>
                        ) : filteredStudents.map((s, index) => {
                           const isSelected = selectedStudentIds.includes(s._id);
                           const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                           return (
                              <button key={s._id} onClick={() => onToggleStudent(s._id)}
                                 className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}>
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : `bg-gradient-to-br ${colors[index % colors.length]}`}`}>
                                    {isSelected ? <FiCheck size={16} /> : initials}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{s.name} {s.surname}</div>
                                    {s.fatherName && <div className="text-xs opacity-40 truncate">{s.fatherName}</div>}
                                 </div>
                                 {s.email && <span className="text-xs opacity-30 hidden sm:block truncate max-w-[120px]">{s.email}</span>}
                              </button>
                           );
                        })}
                     </InfiniteList>
                  </div>
               )}

               {stepError && (
                  <div className="px-8 pt-2">
                     <span className="text-red-400 text-xs flex items-center gap-1"><FiAlertCircle size={12} />{stepError}</span>
                  </div>
               )}

               {/* Footer */}
               <div className="px-8 pt-4 pb-7 flex flex-col gap-5 mt-auto">
                  <div className="flex gap-3">
                     {step > 1 && (
                        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200">
                           Geri
                        </button>
                     )}
                     {step < 3 && (
                        <button onClick={step === 1 ? onStep1Next : onStep2Next}
                           className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200">
                           Davam
                        </button>
                     )}
                     {step === 3 && (
                        <button onClick={onSubmit} disabled={submitting}
                           className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60">
                           {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Qrup yarat'}
                        </button>
                     )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                     {[1, 2, 3].map(n => (
                        <div key={n} className={`rounded-full transition-all duration-300 ${n === step ? 'w-6 h-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : n < step ? 'w-2.5 h-2.5 bg-[#8B5CF6] opacity-60' : 'w-2.5 h-2.5 bg-base-300'}`} />
                     ))}
                  </div>
               </div>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

export default CreateGroupModal;