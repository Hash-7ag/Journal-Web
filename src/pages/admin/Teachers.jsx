import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiMail, FiPhone, FiEdit2 } from 'react-icons/fi';

import Pagination from '../../components/ui/Pagination';
import TeacherInfoModal from '../../components/teachers/TeacherInfoModal';
import SearchInput from '../../components/ui/SearchInput';
import { useDebounce } from '../../scripts/useDebounce.js';
import CreateTeacherModal from '../../components/teachers/CreateTeacherModal';
import EditTeacherModal from '../../components/teachers/EditTeacherModal';

const teacherColors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#A78BFA] to-[#60A5FA]',
  'from-[#3B82F6] to-[#8B5CF6]',
];

// Одна карточка учителя — используется и в обычном списке, и в результатах поиска
function TeacherRow({ teacher, colorIndex, onEdit, onInfo }) {
  const colorClass = teacherColors[colorIndex % teacherColors.length];
  const initials = `${teacher.name?.charAt(0) || ''}${teacher.surname?.charAt(0) || ''}`.toUpperCase();
  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className="w-11 h-11 shrink-0 relative flex items-center justify-center">
        <div className={`absolute w-9 h-9 bg-gradient-to-br ${colorClass} rotate-45 rounded-lg shadow-md`} />
        <span className="relative z-10 text-white font-bold text-sm">{initials || '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {teacher.name} {teacher.surname}
        </div>
        <div className="text-xs opacity-40 mt-0.5 truncate">{teacher.fatherName}</div>
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {teacher.email && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiMail size={12} />
            {teacher.email}
          </div>
        )}
        {teacher.phoneNumber && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiPhone size={12} />
            {teacher.phoneNumber}
          </div>
        )}
      </div>
      <button
        onClick={() => onEdit(teacher)}
        className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
      >
        <FiEdit2 size={15} />
      </button>
      <button
        onClick={() => onInfo(teacher)}
        className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
    </div>
  );
}

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [infoModal, setInfoModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  const isSearching = debouncedSearch.trim().length > 0;

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
        const res = await api.post('/admin/searchTeacher', { searchText: text });
        if (!cancelled) setSearchResults(res.data ?? []);
      } catch (err) {
        // 404 = ничего не найдено → пустой результат, не ошибка
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

  const fetchTeachers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/getAllTeachers?page=${pageNum}&pageSize=${pageSize}`);
      setTeachers(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(page);
  }, [page]);

  const handleAddTeacher = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      await api.post('/admin/createTeacher', payload);
      setIsModalOpen(false);
      fetchTeachers(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTeacher = async (payload) => {
    try {
      setEditSubmitting(true);
      setEditError('');
      await api.patch(`/admin/updateTeacherInfo/${editModal._id}`, payload);
      await fetchTeachers(page);
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-lg font-bold">Müəllimlər</h1>
            <p className="text-xs opacity-40 mt-0.5">
              Cəmi {total} müəllim · Səhifə {page} / {totalPages}
            </p>
          </div>

          {/* Поиск — по центру, растягивается (десктоп) */}
          <div className="hidden sm:block flex-1 max-w-md">
            <SearchInput value={search} onChange={setSearch} placeholder="Müəllim axtar..." loading={searchLoading} />
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setError('');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 shrink-0"
          >
            <FiPlus size={16} /> <span className="hidden md:inline">Müəllim əlavə et</span>
          </button>
        </div>

        {/* Поиск на мобильном — отдельной строкой */}
        <div className="sm:hidden">
          <SearchInput value={search} onChange={setSearch} placeholder="Müəllim axtar..." loading={searchLoading} />
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error rounded-xl mb-4">
          <span>{error}</span>
        </div>
      )}

      {isSearching ? (
        /* ===== Режим поиска ===== */
        searchResults.length === 0 && !searchLoading ? (
          <div className="text-center opacity-40 mt-20 text-sm">Axtarışa uyğun müəllim tapılmadı</div>
        ) : (
          <div className="flex flex-col gap-3">
            {searchResults.map((teacher, index) => (
              <TeacherRow
                key={teacher._id}
                teacher={teacher}
                colorIndex={index}
                onEdit={setEditModal}
                onInfo={setInfoModal}
              />
            ))}
          </div>
        )
      ) : (
        /* ===== Обычный список + пагинация ===== */
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir müəllim tapılmadı</div>
          ) : (
            <div className="flex flex-col gap-3">
              {teachers.map((teacher, index) => (
                <TeacherRow
                  key={teacher._id || index}
                  teacher={teacher}
                  colorIndex={(page - 1) * pageSize + index}
                  onEdit={setEditModal}
                  onInfo={setInfoModal}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
        </>
      )}

      <TeacherInfoModal teacher={infoModal} onClose={() => setInfoModal(null)} />

      {/* Edit modal */}
      {editModal && (
        <EditTeacherModal
          teacher={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEditTeacher}
          submitting={editSubmitting}
          error={editError}
        />
      )}

      {/* Create modal */}
      {isModalOpen && (
        <CreateTeacherModal
          onClose={() => {
            setIsModalOpen(false);
            setError('');
          }}
          onSubmit={handleAddTeacher}
          submitting={submitting}
          error={error}
        />
      )}
    </div>
  );
}

export default Teachers;
