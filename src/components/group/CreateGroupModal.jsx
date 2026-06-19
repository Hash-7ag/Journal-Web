import React from 'react';
import { FiCheck, FiUser, FiClock, FiX, FiAlertCircle, FiBriefcase, FiHash, FiUsers } from 'react-icons/fi';
import SearchSelect from '../ui/SearchSelect';
import FormInput from '../ui/FormInput';
import SemestrPicker from './SemestrPicker';

const studentColors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
];

function CreateGroupModal({
  step,
  formData,
  onFormChange,
  stepError,
  onClose,
  // предметы
  subjects,
  selectedSubjects,
  selectedSubjectIds,
  subjectSearch,
  onSubjectSearch,
  onToggleSubject,
  subjectLoading,
  subjectLoadingMore,
  subjectHasMore,
  onLoadMoreSubjects,
  // ученики
  students,
  selectedStudents,
  selectedStudentIds,
  studentSearch,
  onStudentSearch,
  onToggleStudent,
  studentLoading,
  studentLoadingMore,
  studentHasMore,
  onLoadMoreStudents,
  // навигация
  onStep1Next,
  onStep2Next,
  onBack,
  onSubmit,
  submitting,
}) {
  return (
    <div className="modal modal-open z-40" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col p-0 max-w-lg overflow-hidden max-h-[90vh] w-[calc(100%-2rem)] mx-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="flex flex-col gap-0 flex-1 overflow-y-auto">
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
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="px-8 pb-2 flex flex-col gap-4">
              <FormInput
                label="İxtisas"
                icon={<FiBriefcase size={15} />}
                value={formData.profession}
                onChange={(e) => onFormChange('profession', e.target.value)}
                placeholder="İxtisas adı"
                onEnter={onStep1Next}
                autoFocus
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  label="Qrup nömrəsi"
                  type="number"
                  icon={<FiHash size={15} />}
                  value={formData.groupNumber}
                  onChange={(e) => onFormChange('groupNumber', e.target.value)}
                  placeholder="Məs: 101"
                  onEnter={onStep1Next}
                />
                <FormInput
                  label="Şifrə"
                  type="number"
                  icon={<FiHash size={15} />}
                  value={formData.groupShifr}
                  onChange={(e) => onFormChange('groupShifr', e.target.value)}
                  placeholder="Məs: 240101"
                  onEnter={onStep1Next}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold opacity-60 ml-1">Semestr</label>
                <SemestrPicker value={formData.semestr} onChange={(v) => onFormChange('semestr', v)} />
              </div>
            </div>
          )}

          {/* Step 2 — предметы */}
          {step === 2 && (
            <div className="px-8 pb-2 flex flex-col gap-3">
              {/* Теги выбранных предметов */}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((s) => (
                    <span
                      key={s._id}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-semibold shadow-sm"
                    >
                      {s.subject}
                      <button
                        onClick={() => onToggleSubject(s)}
                        className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <SearchSelect
                search={subjectSearch}
                onSearch={onSubjectSearch}
                loading={subjectLoading}
                placeholder="Fənn axtar..."
                loadingMore={subjectLoadingMore}
                hasMore={subjectHasMore && !subjectSearch.trim()}
                onLoadMore={onLoadMoreSubjects}
                isEmpty={!subjectLoading && subjects.length === 0}
                emptyText="Fənn tapılmadı"
              >
                {subjects.map((s) => {
                  const isSelected = selectedSubjectIds.includes(s._id);
                  const teacher = s.teacherId;
                  return (
                    <button
                      key={s._id}
                      onClick={() => onToggleSubject(s)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${isSelected ? 'border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10' : 'border-base-200 hover:border-base-content/20 hover:bg-base-200/40'}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : 'bg-base-300'}`}
                      >
                        {isSelected ? (
                          <FiCheck size={16} />
                        ) : (
                          <span className="text-base-content/50 text-sm">{s.subject?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{s.subject}</div>
                        {teacher && typeof teacher === 'object' && (
                          <div className="flex items-center gap-1 text-xs opacity-50 mt-0.5">
                            <FiUser size={10} />
                            {teacher.name} {teacher.surname}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {s.semestr && <span className="text-xs opacity-40">{s.semestr}-ci semestr</span>}
                        <div className="flex items-center gap-2">
                          {s.kredit && <span className="text-xs opacity-40">{s.kredit} kredit</span>}
                          {s.totalHours && (
                            <div className="flex items-center gap-0.5 text-xs opacity-40">
                              <FiClock size={10} />
                              {s.totalHours}h
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </SearchSelect>
            </div>
          )}

          {/* Step 3 — ученики */}
          {step === 3 && (
            <div className="px-8 pb-2 flex flex-col gap-3">
              {/* Теги выбранных учеников */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((s) => (
                    <span
                      key={s._id}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-semibold shadow-sm"
                    >
                      {s.name} {s.surname}
                      <button
                        onClick={() => onToggleStudent(s)}
                        className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <SearchSelect
                search={studentSearch}
                onSearch={onStudentSearch}
                loading={studentLoading}
                placeholder="Şagird axtar..."
                loadingMore={studentLoadingMore}
                hasMore={studentHasMore && !studentSearch.trim()}
                onLoadMore={onLoadMoreStudents}
                isEmpty={!studentLoading && students.length === 0}
                emptyText="Şagird tapılmadı"
              >
                {students.map((s, index) => {
                  const isSelected = selectedStudentIds.includes(s._id);
                  const inGroup = !!s.group;
                  const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                  return (
                    <button
                      key={s._id}
                      onClick={() => onToggleStudent(s)}
                      disabled={inGroup}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                        inGroup
                          ? 'border-base-200 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10'
                            : 'border-base-200 hover:border-base-content/20 hover:bg-base-200/40'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 transition-all duration-200 ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : `bg-gradient-to-br ${studentColors[index % studentColors.length]}`}`}
                      >
                        {isSelected ? <FiCheck size={16} /> : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-sm truncate">
                            {s.name} {s.surname}
                          </div>
                          {inGroup ? (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-base-300 text-base-content/50">
                              <FiUsers size={9} /> Qrupda
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Boş
                            </span>
                          )}
                        </div>
                        {s.fatherName && <div className="text-xs opacity-40 truncate">{s.fatherName}</div>}
                      </div>
                      {s.email && (
                        <span className="text-xs opacity-30 hidden sm:block truncate max-w-[120px]">{s.email}</span>
                      )}
                    </button>
                  );
                })}
              </SearchSelect>
            </div>
          )}

          {stepError && (
            <div className="px-8 pt-2">
              <span className="text-red-400 text-xs flex items-center gap-1">
                <FiAlertCircle size={12} />
                {stepError}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 pt-4 pb-7 flex flex-col gap-5 mt-auto">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={onBack}
                  className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                >
                  Geri
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={step === 1 ? onStep1Next : onStep2Next}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
                >
                  Davam
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                >
                  {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Qrup yarat'}
                </button>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`rounded-full transition-all duration-300 ${n === step ? 'w-6 h-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : n < step ? 'w-2.5 h-2.5 bg-[#8B5CF6] opacity-60' : 'w-2.5 h-2.5 bg-base-300'}`}
                />
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
