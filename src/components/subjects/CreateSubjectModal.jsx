import React, { useState, useEffect, useCallback } from 'react';
import api from '../../scripts/api.js';
import { FiBook, FiArrowRight, FiArrowLeft, FiX, FiCheck, FiUser, FiMail } from 'react-icons/fi';
import FormInput from '../ui/FormInput';
import StepIndicator from '../ui/StepIndicator';
import SearchSelect from '../ui/SearchSelect';
import SemestrPicker from '../group/SemestrPicker';
import { useDebounce } from '../../scripts/useDebounce.js';

const EMPTY = { subject: '', semestr: '', kredit: '', totalHours: '' };
const PAGE_SIZE = 10;

function CreateSubjectModal({ onClose, onSubmit, submitting, error }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [stepError, setStepError] = useState('');

  // выбранный учитель (один)
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // серч учителей
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setStepError('');
  };

  const loadTeachers = useCallback(async (pageNum, text, append) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      let data = [];
      if (text) {
        const res = await api.post('/admin/searchTeacher', { searchText: text });
        data = res.data ?? [];
        setHasMore(false);
      } else {
        const res = await api.get(`/admin/getAllTeachers?page=${pageNum}&pageSize=${PAGE_SIZE}`);
        data = res.data.data ?? [];
        setHasMore(pageNum < (res.data.totalPages ?? 1));
      }
      setResults((prev) => (append ? [...prev, ...data] : data));
    } catch {
      if (!append) setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    setPage(1);
    loadTeachers(1, debouncedSearch.trim(), false);
  }, [debouncedSearch, step, loadTeachers]);

  const loadMore = () => {
    if (loadingMore || !hasMore || debouncedSearch.trim()) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadTeachers(nextPage, '', true);
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.subject.trim()) {
        setStepError('Fənn adını daxil edin');
        return false;
      }
      if (!String(form.semestr).trim()) {
        setStepError('Semestr seçin');
        return false;
      }
      if (!String(form.kredit).trim() || Number(form.kredit) < 1) {
        setStepError('Kredit daxil edin');
        return false;
      }
      if (!String(form.totalHours).trim() || Number(form.totalHours) < 1) {
        setStepError('Saat daxil edin');
        return false;
      }
    }
    if (step === 2) {
      if (!selectedTeacher) {
        setStepError('Müəllim seçin');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 2) setStep(2);
    else handleSubmit();
  };

  const back = () => {
    setStepError('');
    setStep(1);
  };

  const handleSubmit = () => {
    onSubmit({
      teacherId: selectedTeacher._id,
      subject: form.subject.trim(),
      semestr: Number(form.semestr),
      kredit: Number(form.kredit),
      totalHours: Number(form.totalHours),
    });
  };

  return (
    <div className="modal modal-open z-40" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden max-h-[90vh] w-[calc(100%-2rem)] mx-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-7 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiBook size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold">Yeni fənn</h3>
                <p className="text-xs opacity-40 mt-0.5">{step === 1 ? 'Fənn məlumatları' : 'Müəllim seçimi'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-4 min-h-[200px]">
            {step === 1 && (
              <>
                <FormInput
                  label="Fənnin adı"
                  icon={<FiBook size={15} />}
                  value={form.subject}
                  onChange={(e) => set('subject', e.target.value)}
                  placeholder="Məs: Riyaziyyat"
                  onEnter={next}
                  autoFocus
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold opacity-60 ml-1">Semestr</label>
                  <SemestrPicker value={form.semestr} onChange={(s) => set('semestr', s)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Kredit"
                    type="number"
                    min={1}
                    value={form.kredit}
                    onChange={(e) => set('kredit', e.target.value)}
                    placeholder="3"
                    onEnter={next}
                  />
                  <FormInput
                    label="Saat"
                    type="number"
                    min={1}
                    value={form.totalHours}
                    onChange={(e) => set('totalHours', e.target.value)}
                    placeholder="60"
                    onEnter={next}
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-3">
                {selectedTeacher && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                      {selectedTeacher.name?.charAt(0)}
                      {selectedTeacher.surname?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {selectedTeacher.name} {selectedTeacher.surname}
                      </div>
                      <div className="text-xs opacity-40 truncate">{selectedTeacher.fatherName}</div>
                    </div>
                    <button
                      onClick={() => setSelectedTeacher(null)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-base-200 text-base-content/50 hover:text-base-content hover:bg-base-300 transition-all"
                    >
                      <FiX size={13} />
                    </button>
                  </div>
                )}

                <SearchSelect
                  search={search}
                  onSearch={setSearch}
                  loading={loading}
                  placeholder="Müəllim axtar..."
                  loadingMore={loadingMore}
                  hasMore={hasMore && !debouncedSearch.trim()}
                  onLoadMore={loadMore}
                  isEmpty={!loading && results.length === 0}
                  emptyText="Müəllim tapılmadı"
                >
                  {results.map((t) => {
                    const active = selectedTeacher?._id === t._id;
                    return (
                      <button
                        key={t._id}
                        onClick={() => setSelectedTeacher(t)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? 'border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10'
                            : 'border-base-200 hover:border-base-content/20 hover:bg-base-200/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                          {t.name?.charAt(0)}
                          {t.surname?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {t.name} {t.surname}
                          </div>
                          <div className="text-xs opacity-40 truncate">{t.fatherName}</div>
                          {t.email && (
                            <span className="text-[11px] opacity-40 flex items-center gap-1 truncate mt-0.5">
                              <FiMail size={9} /> {t.email}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-base-content/20'}`}
                        >
                          {active && <FiCheck size={12} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </SearchSelect>
              </div>
            )}
          </div>

          {(stepError || error) && <span className="text-red-400 text-xs text-center -mt-2">{stepError || error}</span>}

          <div className="flex flex-col gap-5">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={back}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                >
                  <FiArrowLeft size={14} /> Geri
                </button>
              )}
              <button
                onClick={next}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : step < 2 ? (
                  <>
                    Davam <FiArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <FiCheck size={15} /> Əlavə et
                  </>
                )}
              </button>
            </div>
            <StepIndicator total={2} current={step} />
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default CreateSubjectModal;
