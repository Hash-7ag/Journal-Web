import React, { useState, useEffect, useCallback } from 'react';
import api from '../../scripts/api.js';
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiX,
  FiCheck,
  FiUserPlus,
  FiPhone,
} from 'react-icons/fi';
import FormInput from '../ui/FormInput';
import PhoneInput from '../ui/PhoneInput';
import StepIndicator from '../ui/StepIndicator';
import SearchSelect from '../ui/SearchSelect';
import { useDebounce } from '../../scripts/useDebounce.js';

const EMPTY = { name: '', surname: '', fatherName: '', email: '', phone: '', username: '', password: '' };
const PAGE_SIZE = 10;

function CreateParentModal({ onClose, onSubmit, submitting, error }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [stepError, setStepError] = useState('');

  // выбранные дети (хранятся отдельно, не теряются при поиске)
  const [selected, setSelected] = useState([]);

  // серч детей
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

  // загрузка списка студентов (пустой поиск = getAllStudents постранично; поиск = searchStudent)
  const loadStudents = useCallback(async (pageNum, text, append) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      let data = [];
      if (text) {
        // серверный поиск — без пагинации (возвращает всё)
        const res = await api.post('/admin/searchStudent', { searchText: text });
        data = res.data ?? [];
        setHasMore(false);
      } else {
        const res = await api.get(`/admin/getAllStudents?page=${pageNum}&pageSize=${PAGE_SIZE}`);
        data = res.data.data ?? [];
        const totalPages = res.data.totalPages ?? 1;
        setHasMore(pageNum < totalPages);
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

  // при смене запроса — грузим с 1 страницы
  useEffect(() => {
    if (step !== 4) return;
    setPage(1);
    loadStudents(1, debouncedSearch.trim(), false);
  }, [debouncedSearch, step, loadStudents]);

  const loadMore = () => {
    if (loadingMore || !hasMore || debouncedSearch.trim()) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadStudents(nextPage, '', true);
  };

  const toggleChild = (student) => {
    setSelected((prev) =>
      prev.some((s) => s._id === student._id) ? prev.filter((s) => s._id !== student._id) : [...prev, student],
    );
  };

  const isSelected = (id) => selected.some((s) => s._id === id);

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.surname.trim() || !form.fatherName.trim()) {
        setStepError('Bütün sahələri doldurun');
        return false;
      }
    }
    if (step === 2) {
      if (!form.email.trim()) {
        setStepError('Email daxil edin');
        return false;
      }
      if (form.phone.length < 9) {
        setStepError('Telefon nömrəsi tam deyil');
        return false;
      }
    }
    if (step === 3) {
      if (!form.username.trim()) {
        setStepError('İstifadəçi adı daxil edin');
        return false;
      }
      if (form.password.trim().length < 8) {
        setStepError('Parol ən azı 8 simvol olmalıdır');
        return false;
      }
    }
    if (step === 4) {
      if (selected.length === 0) {
        setStepError('Ən azı bir övlad seçin');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const back = () => {
    setStepError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = () => {
    onSubmit({
      name: form.name.trim(),
      surname: form.surname.trim(),
      fatherName: form.fatherName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      phone: `+994${form.phone}`,
      children: selected.map((s) => s._id),
    });
  };

  return (
    <div className="modal modal-open z-40" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden max-h-[90vh] w-[calc(100%-2rem)] mx-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-7 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiUserPlus size={19} />
              </div>
              <div>
                <h3 className="text-base font-bold">Yeni valideyn</h3>
                <p className="text-xs opacity-40 mt-0.5">
                  {step === 1 && 'Ümumi məlumat'}
                  {step === 2 && 'Əlaqə məlumatları'}
                  {step === 3 && 'Hesab məlumatları'}
                  {step === 4 && 'Övladların seçimi'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Контент шага */}
          <div className="flex flex-col gap-4 min-h-[200px]">
            {step === 1 && (
              <>
                <FormInput
                  label="Ad"
                  icon={<FiUser size={15} />}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Məs: Əli"
                  onEnter={next}
                  autoFocus
                />
                <FormInput
                  label="Soyad"
                  icon={<FiUser size={15} />}
                  value={form.surname}
                  onChange={(e) => set('surname', e.target.value)}
                  placeholder="Məs: Məmmədov"
                  onEnter={next}
                />
                <FormInput
                  label="Ata adı"
                  icon={<FiUser size={15} />}
                  value={form.fatherName}
                  onChange={(e) => set('fatherName', e.target.value)}
                  placeholder="Məs: Hüseyn"
                  onEnter={next}
                />
              </>
            )}
            {step === 2 && (
              <>
                <FormInput
                  label="Email"
                  type="email"
                  icon={<FiMail size={15} />}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@mail.com"
                  onEnter={next}
                  autoFocus
                />
                <PhoneInput value={form.phone} onChange={(v) => set('phone', v)} onEnter={next} />
              </>
            )}
            {step === 3 && (
              <>
                <FormInput
                  label="İstifadəçi adı"
                  icon={<FiUser size={15} />}
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                  placeholder="username"
                  onEnter={next}
                  autoFocus
                />
                <FormInput
                  label="Şifrə"
                  type={showPassword ? 'text' : 'password'}
                  icon={<FiLock size={15} />}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  onEnter={next}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="opacity-40 hover:opacity-100 transition-opacity"
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  }
                />
              </>
            )}
            {step === 4 && (
              <div className="flex flex-col gap-3">
                {/* Теги выбранных */}
                {selected.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selected.map((s) => (
                      <span
                        key={s._id}
                        className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-semibold shadow-sm"
                      >
                        {s.name} {s.surname}
                        <button
                          onClick={() => toggleChild(s)}
                          className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <FiX size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <SearchSelect
                  search={search}
                  onSearch={setSearch}
                  loading={loading}
                  placeholder="Şagird axtar..."
                  loadingMore={loadingMore}
                  hasMore={hasMore && !debouncedSearch.trim()}
                  onLoadMore={loadMore}
                  isEmpty={!loading && results.length === 0}
                  emptyText="Şagird tapılmadı"
                >
                  {results.map((s) => {
                    const active = isSelected(s._id);
                    return (
                      <button
                        key={s._id}
                        onClick={() => toggleChild(s)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                          active
                            ? 'border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10'
                            : 'border-base-200 hover:border-base-content/20 hover:bg-base-200/40'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                          {s.name?.charAt(0)}
                          {s.surname?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {s.name} {s.surname}
                          </div>
                          <div className="text-xs opacity-40 truncate">{s.fatherName}</div>
                          <div className="flex flex-col gap-0.5 mt-1">
                            {s.email && (
                              <span className="text-[11px] opacity-40 flex items-center gap-1 truncate">
                                <FiMail size={9} /> {s.email}
                              </span>
                            )}
                            {s.phoneNumber && (
                              <span className="text-[11px] opacity-40 flex items-center gap-1 truncate">
                                <FiPhone size={9} /> {s.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${active ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'border-base-content/20'}`}
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

          {/* Навигация */}
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
                ) : step < 4 ? (
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
            <StepIndicator total={4} current={step} />
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default CreateParentModal;
