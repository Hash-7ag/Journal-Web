import React, { useState, useEffect, useCallback } from 'react';
import { FiBook, FiUser, FiEdit2, FiX, FiCheck, FiMail } from 'react-icons/fi';
import api from '../../scripts/api.js';
import FormInput from '../ui/FormInput';
import SearchSelect from '../ui/SearchSelect';
import SemestrPicker from '../group/SemestrPicker';
import { useDebounce } from '../../scripts/useDebounce.js';

const PAGE_SIZE = 10;

function SubjectModal({ subject, onClose, onUpdated }) {
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

  const currentTeacher = subject.teacherId; // populated объект (или id)

  // серч учителей
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
    if (!teacherMode) return;
    setPage(1);
    loadTeachers(1, debouncedSearch.trim(), false);
  }, [debouncedSearch, teacherMode, loadTeachers]);

  const loadMore = () => {
    if (loadingMore || !hasMore || debouncedSearch.trim()) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadTeachers(nextPage, '', true);
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      setError('');
      await api.patch(`/admin/updateSubject/${subject._id}`, {
        subject: formData.subject,
        semestr: Number(formData.semestr),
        kredit: Number(formData.kredit),
        totalHours: Number(formData.totalHours),
      });
      onUpdated();
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchTeacher = async (teacherId) => {
    try {
      setSwitchingTeacher(teacherId);
      setError('');
      await api.patch(`/admin/switchSubjectTeacher/${subject._id}`, { teacherId });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSwitchingTeacher(false);
    }
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
                <div className="text-xs opacity-40">
                  {subject.semestr}-ci semestr · {subject.kredit} kredit · {subject.totalHours} saat
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Teacher section */}
          {!teacherMode ? (
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold opacity-40 flex items-center gap-1">
                  <FiUser size={11} /> Müəllim
                </span>
                <button
                  onClick={() => setTeacherMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-base-200 text-xs font-semibold opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                >
                  <FiEdit2 size={11} /> Müəllimi Dəyiş
                </button>
              </div>
              {currentTeacher && typeof currentTeacher === 'object' ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                    {currentTeacher.name?.charAt(0)}
                    {currentTeacher.surname?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {currentTeacher.name} {currentTeacher.surname}
                    </div>
                    <div className="text-xs opacity-40">{currentTeacher.fatherName}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm opacity-30">Müəllim təyin edilməyib</div>
              )}
            </div>
          ) : (
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold opacity-40">Yeni müəllim seçin</span>
                <button
                  onClick={() => {
                    setTeacherMode(false);
                    setSearch('');
                  }}
                  className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
              </div>
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
                  const isCurrent = (currentTeacher?._id ?? currentTeacher) === t._id;
                  return (
                    <button
                      key={t._id}
                      onClick={() => handleSwitchTeacher(t._id)}
                      disabled={!!switchingTeacher}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 disabled:opacity-50 ${
                        isCurrent
                          ? 'border-[#8B5CF6] bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10'
                          : 'border-base-200 hover:border-base-content/20 hover:bg-base-200/40'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                        {t.name?.charAt(0)}
                        {t.surname?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {t.name} {t.surname}
                        </div>
                        <div className="text-xs opacity-40 truncate">{t.fatherName}</div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8B5CF6] text-white shrink-0">
                          Cari
                        </span>
                      )}
                      {switchingTeacher === t._id && (
                        <span className="loading loading-spinner loading-xs" style={{ color: '#8B5CF6' }} />
                      )}
                    </button>
                  );
                })}
              </SearchSelect>
            </div>
          )}

          {/* Edit subject info */}
          {!editMode ? (
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold opacity-40">Fənn məlumatları</span>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-base-200 text-xs font-semibold opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                >
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
                <button
                  onClick={() => setEditMode(false)}
                  className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
              </div>
              <FormInput
                label="Fənn adı"
                value={formData.subject}
                onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                onEnter={handleUpdate}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold opacity-60 ml-1">Semestr</label>
                <SemestrPicker value={formData.semestr} onChange={(s) => setFormData((p) => ({ ...p, semestr: s }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="Kredit"
                  type="number"
                  min={1}
                  value={formData.kredit}
                  onChange={(e) => setFormData((p) => ({ ...p, kredit: e.target.value }))}
                  onEnter={handleUpdate}
                />
                <FormInput
                  label="Saat"
                  type="number"
                  min={1}
                  value={formData.totalHours}
                  onChange={(e) => setFormData((p) => ({ ...p, totalHours: e.target.value }))}
                  onEnter={handleUpdate}
                />
              </div>
              {error && <span className="text-red-400 text-xs">{error}</span>}
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <FiCheck size={13} /> Yadda saxla
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 py-2 rounded-xl border border-base-200 bg-base-100 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                >
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
