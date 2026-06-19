import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiClock } from 'react-icons/fi';

import Pagination from '../../components/ui/Pagination';
import SubjectModal from '../../components/subjects/SubjectModal';
import CreateSubjectModal from '../../components/subjects/CreateSubjectModal';
import SearchInput from '../../components/ui/SearchInput';
import { useDebounce } from '../../scripts/useDebounce.js';

const subjectColors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#A78BFA] to-[#60A5FA]',
  'from-[#3B82F6] to-[#8B5CF6]',
];

// имя учителя из populated teacherId
function teacherName(teacherId) {
  if (teacherId && typeof teacherId === 'object') {
    return `${teacherId.name ?? ''} ${teacherId.surname ?? ''}`.trim() || '—';
  }
  return '—';
}

function SubjectRow({ subject, colorIndex, onOpen }) {
  const colorClass = subjectColors[colorIndex % subjectColors.length];
  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}
      >
        {subject.subject?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{subject.subject}</div>
        <div className="flex items-center gap-1 text-xs opacity-40 mt-0.5">
          <FiUser size={11} />
          {teacherName(subject.teacherId)}
        </div>
      </div>
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
          <span className="text-xs opacity-30 flex items-center gap-1">
            <FiClock size={10} /> Saat
          </span>
          <span className="text-sm font-semibold">{subject.totalHours}</span>
        </div>
      </div>
      <button
        onClick={() => onOpen(subject)}
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

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // search
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const isSearching = debouncedSearch.trim().length > 0;

  const fetchSubjects = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/getAllSubjects?page=${pageNum}&pageSize=${pageSize}`);
      setSubjects(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects(page);
  }, [page]);

  // поиск предметов
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
        const res = await api.post('/admin/searchSubject', { subject: text });
        if (!cancelled) setSearchResults(res.data ?? []);
      } catch {
        // 409 = ничего не найдено → пусто
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

  const handleAddSubject = async (payload) => {
    try {
      setSubmitting(true);
      setModalError('');
      await api.post('/admin/createSubject', payload);
      setIsModalOpen(false);
      fetchSubjects(page);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <h1 className="text-lg font-bold">Fənlər</h1>
            <p className="text-xs opacity-40 mt-0.5">
              Cəmi {total} fənn · Səhifə {page} / {totalPages}
            </p>
          </div>

          <div className="hidden sm:block flex-1 max-w-md">
            <SearchInput value={search} onChange={setSearch} placeholder="Fənn axtar..." loading={searchLoading} />
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setModalError('');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 shrink-0"
          >
            <FiPlus size={16} /> <span className="hidden md:inline">Fənn əlavə et</span>
          </button>
        </div>

        <div className="sm:hidden">
          <SearchInput value={search} onChange={setSearch} placeholder="Fənn axtar..." loading={searchLoading} />
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-error rounded-xl mb-4">
          <span>{error}</span>
        </div>
      )}

      {isSearching ? (
        /* ===== Поиск ===== */
        searchResults.length === 0 && !searchLoading ? (
          <div className="text-center opacity-40 mt-20 text-sm">Axtarışa uyğun fənn tapılmadı</div>
        ) : (
          <div className="flex flex-col gap-3">
            {searchResults.map((subject, index) => (
              <SubjectRow key={subject._id} subject={subject} colorIndex={index} onOpen={setSelectedSubject} />
            ))}
          </div>
        )
      ) : (
        /* ===== Список + пагинация ===== */
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir fənn tapılmadı</div>
          ) : (
            <div className="flex flex-col gap-3">
              {subjects.map((subject, index) => (
                <SubjectRow
                  key={subject._id || index}
                  subject={subject}
                  colorIndex={(page - 1) * pageSize + index}
                  onOpen={setSelectedSubject}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
        </>
      )}

      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
          onUpdated={() => {
            fetchSubjects(page);
            setSelectedSubject(null);
          }}
        />
      )}

      {isModalOpen && (
        <CreateSubjectModal
          onClose={() => {
            setIsModalOpen(false);
            setModalError('');
          }}
          onSubmit={handleAddSubject}
          submitting={submitting}
          error={modalError}
        />
      )}
    </div>
  );
}

export default Subjects;
