import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../scripts/api';
import { FiPlus } from 'react-icons/fi';

import GroupCard from '../../components/group/GroupCard';
import EditGroupModal from '../../components/group/EditGroupModal';
import DraftModal from '../../components/group/DraftModal';
import CreateGroupModal from '../../components/group/CreateGroupModal';
import SearchInput from '../../components/ui/SearchInput';
import { useDebounce } from '../../scripts/useDebounce.js';

const DRAFT_KEY = 'group_creation_draft';

function Groups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // данные для выбора в модалке
  const [subjects, setSubjects] = useState([]);
  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectHasMore, setSubjectHasMore] = useState(true);
  const [subjectLoadingMore, setSubjectLoadingMore] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentHasMore, setStudentHasMore] = useState(true);
  const [studentLoadingMore, setStudentLoadingMore] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);

  // создание
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ profession: '', groupNumber: '', groupShifr: '', semestr: 1 });
  const [stepError, setStepError] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // полные объекты для тегов/payload
  const [selectedStudents, setSelectedStudents] = useState([]);

  const debouncedSubjectSearch = useDebounce(subjectSearch, 350);
  const debouncedStudentSearch = useDebounce(studentSearch, 350);

  // черновик
  const [draftModal, setDraftModal] = useState(false);
  const [draftData, setDraftData] = useState(null);

  // редактирование
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ profession: '', groupNumber: '', groupShifr: '', semestr: 1 });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // серч групп на странице
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const isSearching = debouncedSearch.trim().length > 0;

  // ===== загрузка предметов (серверный серч) =====
  const loadSubjects = useCallback(async (pageNum, text, append) => {
    try {
      if (append) setSubjectLoadingMore(true);
      else setSubjectLoading(true);
      let data = [];
      if (text) {
        const res = await api.post('/admin/searchSubject', { subject: text });
        data = res.data ?? [];
        setSubjectHasMore(false);
      } else {
        const res = await api.get(`/admin/getAllSubjects?page=${pageNum}&pageSize=10`);
        data = res.data.data ?? [];
        setSubjectHasMore(data.length === 10);
      }
      setSubjects((prev) => (append ? [...prev, ...data] : data));
    } catch {
      if (!append) setSubjects([]);
      setSubjectHasMore(false);
    } finally {
      setSubjectLoading(false);
      setSubjectLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    setSubjectPage(1);
    loadSubjects(1, debouncedSubjectSearch.trim(), false);
  }, [debouncedSubjectSearch, isModalOpen, loadSubjects]);

  const loadMoreSubjects = () => {
    if (subjectLoadingMore || !subjectHasMore || debouncedSubjectSearch.trim()) return;
    const next = subjectPage + 1;
    setSubjectPage(next);
    loadSubjects(next, '', true);
  };

  // ===== загрузка учеников (серверный серч по всем) =====
  const loadStudents = useCallback(async (pageNum, text, append) => {
    try {
      if (append) setStudentLoadingMore(true);
      else setStudentLoading(true);
      let data = [];
      if (text) {
        const res = await api.post('/admin/searchStudent', { searchText: text });
        data = res.data ?? [];
        setStudentHasMore(false);
      } else {
        const res = await api.get(`/admin/getAllStudents?page=${pageNum}&pageSize=10`);
        data = res.data.data ?? [];
        setStudentHasMore(data.length === 10);
      }
      setStudents((prev) => (append ? [...prev, ...data] : data));
    } catch {
      if (!append) setStudents([]);
      setStudentHasMore(false);
    } finally {
      setStudentLoading(false);
      setStudentLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    setStudentPage(1);
    loadStudents(1, debouncedStudentSearch.trim(), false);
  }, [debouncedStudentSearch, isModalOpen, loadStudents]);

  const loadMoreStudents = () => {
    if (studentLoadingMore || !studentHasMore || debouncedStudentSearch.trim()) return;
    const next = studentPage + 1;
    setStudentPage(next);
    loadStudents(next, '', true);
  };

  // ===== группы =====
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/getAllGroups');
      setGroups(res.data.data);
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // серч групп
  useEffect(() => {
    const text = debouncedSearch.trim();
    if (!text) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        setSearchLoading(true);
        const res = await api.post('/admin/searchGroup', { groupNumber: text });
        if (!cancelled) setSearchResults(res.data ?? []);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  // ===== черновик / открытие =====
  const handleOpenModal = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.profession || parsed?.groupNumber || parsed?.groupShifr) {
          setDraftData(parsed);
          setDraftModal(true);
          return;
        }
      } catch {
        // ignore
      }
    }
    openFreshModal();
  };

  const openFreshModal = () => {
    setFormData({ profession: '', groupNumber: '', groupShifr: '', semestr: 1 });
    setSelectedSubjectIds([]);
    setSelectedStudentIds([]);
    setSelectedSubjects([]);
    setSelectedStudents([]);
    setSubjectSearch('');
    setStudentSearch('');
    setStep(1);
    setStepError('');
    setIsModalOpen(true);
  };

  const saveDraft = (overrides = {}) => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        profession: formData.profession,
        groupNumber: formData.groupNumber,
        groupShifr: formData.groupShifr,
        semestr: formData.semestr,
        selectedSubjectIds,
        selectedStudentIds,
        selectedSubjects,
        selectedStudents,
        step,
        ...overrides,
      }),
    );
  };

  const closeModal = () => {
    if (step >= 2 || (formData.profession && formData.groupNumber && formData.groupShifr)) saveDraft();
    setIsModalOpen(false);
  };

  // ===== toggle (хранят id + объект) =====
  const toggleSubject = (subject) => {
    const id = subject._id;
    setSelectedSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSelectedSubjects((prev) =>
      prev.some((s) => s._id === id) ? prev.filter((s) => s._id !== id) : [...prev, subject],
    );
  };

  const toggleStudent = (student) => {
    if (student.group) return; // занятого нельзя выбрать
    const id = student._id;
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSelectedStudents((prev) =>
      prev.some((s) => s._id === id) ? prev.filter((s) => s._id !== id) : [...prev, student],
    );
  };

  // ===== шаги / сабмит =====
  const handleStep1Next = () => {
    setStepError('');
    if (
      !String(formData.profession).trim() ||
      !String(formData.groupNumber).trim() ||
      !String(formData.groupShifr).trim() ||
      !formData.semestr
    ) {
      setStepError('Bütün sahələri doldurun');
      return;
    }
    saveDraft({ step: 2 });
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
    saveDraft({ step: 3 });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setStepError('');
      const selectedSubjectsPayload = selectedSubjects.map((s) => ({
        subject: s._id,
        teacher: s.teacherId?._id ?? s.teacherId,
      }));
      await api.post('/admin/createGroup', {
        profession: formData.profession,
        groupNumber: String(formData.groupNumber),
        groupShifr: String(formData.groupShifr),
        semestr: String(formData.semestr),
        subjects: selectedSubjectsPayload,
        students: selectedStudentIds.map((id) => ({ student: id })),
      });
      localStorage.removeItem(DRAFT_KEY);
      await fetchGroups();
      setIsModalOpen(false);
    } catch (err) {
      setStepError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== редактирование =====
  const openEditGroup = (e, group) => {
    e.stopPropagation();
    setEditForm({
      profession: group.profession ?? '',
      groupNumber: group.groupNumber ?? '',
      groupShifr: group.groupShifr ?? '',
      semestr: group.semestr ?? 1,
    });
    setEditError('');
    setEditModal(group);
  };

  const handleEditGroup = async () => {
    try {
      setEditSubmitting(true);
      setEditError('');
      await api.patch(`/admin/updateGroup/${editModal._id}`, {
        profession: editForm.profession,
        groupNumber: String(editForm.groupNumber),
        groupShifr: String(editForm.groupShifr),
        semestr: String(editForm.semestr),
      });
      await fetchGroups();
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
      </div>
    );

  const displayedGroups = isSearching ? searchResults : groups;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 sm:py-8">
      {error && (
        <div role="alert" className="alert alert-error rounded-xl mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-lg font-bold">Qruplar</h1>
            <p className="text-xs opacity-40 mt-0.5">Bütün qrupların siyahısı</p>
          </div>

          <div className="hidden sm:block flex-1 max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Qrup nömrəsi ilə axtar..."
              loading={searchLoading}
            />
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 shrink-0"
          >
            <FiPlus size={16} /> <span className="hidden md:inline">Qrup əlavə et</span>
          </button>
        </div>

        <div className="sm:hidden">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Qrup nömrəsi ilə axtar..."
            loading={searchLoading}
          />
        </div>
      </div>

      {isSearching && searchResults.length === 0 && !searchLoading ? (
        <div className="text-center opacity-40 mt-20 text-sm">Axtarışa uyğun qrup tapılmadı</div>
      ) : displayedGroups.length === 0 ? (
        <div className="text-center opacity-40 mt-20 text-sm">Heç bir qrup tapılmadı</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedGroups.map((group, index) => (
            <GroupCard
              key={group._id || index}
              group={group}
              index={index}
              onClick={() => navigate(`/groups/${group._id}/${group.semestr}`, { state: { group } })}
              onEdit={openEditGroup}
            />
          ))}
        </div>
      )}

      <EditGroupModal
        group={editModal}
        form={editForm}
        onFormChange={(field, val) => setEditForm((p) => ({ ...p, [field]: val }))}
        onSave={handleEditGroup}
        onClose={() => setEditModal(null)}
        submitting={editSubmitting}
        error={editError}
      />

      <DraftModal
        draftData={draftModal ? draftData : null}
        onContinue={() => {
          if (!draftData) return;
          setFormData({
            profession: draftData.profession ?? '',
            groupNumber: draftData.groupNumber ?? '',
            groupShifr: draftData.groupShifr ?? '',
            semestr: draftData.semestr ?? 1,
          });
          setSelectedSubjectIds(draftData.selectedSubjectIds ?? []);
          setSelectedStudentIds(draftData.selectedStudentIds ?? []);
          setSelectedSubjects(draftData.selectedSubjects ?? []);
          setSelectedStudents(draftData.selectedStudents ?? []);
          setStep(draftData.step ?? 2);
          setStepError('');
          setDraftModal(false);
          setIsModalOpen(true);
        }}
        onDiscard={() => {
          localStorage.removeItem(DRAFT_KEY);
          setDraftModal(false);
          openFreshModal();
        }}
        onClose={() => setDraftModal(false)}
      />

      {isModalOpen && (
        <CreateGroupModal
          step={step}
          formData={formData}
          onFormChange={(field, val) => setFormData((p) => ({ ...p, [field]: val }))}
          stepError={stepError}
          onClose={closeModal}
          /* предметы */
          subjects={subjects}
          selectedSubjects={selectedSubjects}
          selectedSubjectIds={selectedSubjectIds}
          subjectSearch={subjectSearch}
          onSubjectSearch={setSubjectSearch}
          onToggleSubject={toggleSubject}
          subjectLoading={subjectLoading}
          subjectLoadingMore={subjectLoadingMore}
          subjectHasMore={subjectHasMore}
          onLoadMoreSubjects={loadMoreSubjects}
          /* ученики */
          students={students}
          selectedStudents={selectedStudents}
          selectedStudentIds={selectedStudentIds}
          studentSearch={studentSearch}
          onStudentSearch={setStudentSearch}
          onToggleStudent={toggleStudent}
          studentLoading={studentLoading}
          studentLoadingMore={studentLoadingMore}
          studentHasMore={studentHasMore}
          onLoadMoreStudents={loadMoreStudents}
          /* навигация */
          onStep1Next={handleStep1Next}
          onStep2Next={handleStep2Next}
          onBack={() => setStep((s) => s - 1)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default Groups;
