import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api.js';
import { FiArrowLeft, FiUser, FiBook, FiAlertCircle, FiPlus, FiX } from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

import StudentInfoModal from '../../components/group/StudentInfoModal.jsx';
import AttendanceModal from '../../components/attendance/AttendanceModal.jsx';
import AttendanceCalendarModal from '../../components/attendance/AttendanceCalendarModal.jsx';
import TabBtn from '../../components/ui/TabBtn.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import AddAttendanceWizard from '../../components/attendance/AddAttendanceWizard.jsx';
import LessonCard from '../../components/attendance/LessonCard.jsx';

const GRADE_LIMITS = {
  collegium1: 10,
  collegium2: 10,
  coursework: 20,
  attendence: 10,
  exam: 50,
};
const AZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];
const parseMonthStr = (str) => {
  const [mm, yyyy] = str.split('-');
  return { month: Number(mm), year: Number(yyyy) };
};
const colors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
];

const gradeTypeEndpoint = {
  collegium1: '/teacher/createCollegium1',
  collegium2: '/teacher/createCollegium2',
  coursework: '/teacher/createCoursework',
  exam: '/teacher/createExam',
};
const gradeTypeLabel = {
  collegium1: 'Kollegium 1',
  collegium2: 'Kollegium 2',
  coursework: 'Kurswork',
  exam: 'İmtahan',
};

function GradeCell({ value, max, color = 'text-blue-400' }) {
  if (value == null) return <span className="text-xs opacity-20 font-semibold">—/{max}</span>;
  return (
    <span className={`text-xs font-bold ${color}`}>
      {value}/{max}
    </span>
  );
}

function TeacherGroupDetail() {
  const { group, subject } = useParams();
  const navigate = useNavigate();

  const DRAFT_KEY = `attendance_draft_${group}_${subject}`;

  const [wizardOpen, setWizardOpen] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(false); // модалка "продолжить?"
  const [draftData, setDraftData] = useState(null); // данные черновика для возобновления

  const [students, setStudents] = useState([]);
  const [studentModal, setStudentModal] = useState(null);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('grades');

  const [calendarModal, setCalendarModal] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
  const [allBusyDates, setAllBusyDates] = useState(new Set());

  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [newAttDate, setNewAttDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  });
  const [newAttStudents, setNewAttStudents] = useState({});
  const [savingAtt, setSavingAtt] = useState(false);
  const [attError, setAttError] = useState('');
  const [attSuccess, setAttSuccess] = useState('');
  const [attModal, setAttModal] = useState(false);

  const [lessonCardModal, setLessonCardModal] = useState(null); // выбранный doc для карточки

  const [gradeModal, setGradeModal] = useState(false);
  const [gradeType, setGradeType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [gradeDate, setGradeDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const tableRef = useRef(null);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [studentsRes, gradesRes] = await Promise.all([
        api.get(`/teacher/getGroupStudents/${group}/${subject}`),
        api.get(`/teacher/getGrades/${group}/${subject}`),
      ]);
      const allStudents = (studentsRes.data ?? [])
        .flatMap((g) => g.students ?? [])
        .map((s) => s.student ?? s)
        .filter((s) => s && s._id);
      setStudents(allStudents);
      setGrades(gradesRes.data);
      const initMap = {};
      allStudents.forEach((s) => {
        initMap[s._id] = true;
      });
      setNewAttStudents(initMap);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (month, year) => {
    try {
      setAttendanceLoading(true);
      const res = await api.get(
        `/teacher/getAttendence/${group}/${subject}?date=${String(month).padStart(2, '0')}-${year}`,
      );
      setAttendanceData(res.data ?? []);
    } catch (err) {
      if (err.response?.status === 404) setAttendanceData([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceTab = async () => {
    setActiveTab('attendance');
    try {
      const res = await api.get(`/teacher/months/${group}/${subject}`);
      const parsed = (res.data ?? []).map(parseMonthStr);
      setAvailableMonths(parsed);
      const allResults = await Promise.all(
        parsed.map(({ month, year }) =>
          api.get(`/teacher/getAttendence/${group}/${subject}?date=${String(month).padStart(2, '0')}-${year}`),
        ),
      );
      const busySet = new Set();
      allResults.forEach((r) => {
        (r.data ?? []).forEach((doc) => {
          const d = new Date(doc.date);
          busySet.add(
            `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`,
          );
        });
      });
      setAllBusyDates(busySet);
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        setSelectedMonth(latest);
        await fetchAttendance(latest.month, latest.year);
      } else {
        const now = new Date();
        setSelectedMonth({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
        setAttendanceData([]);
      }
    } catch {
      const now = new Date();
      setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
      setAttendanceData([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [group, subject]);

  const buildColumns = () => {
    return [...attendanceData].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (da !== db) return da - db;
      // тот же день — по времени создания
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const getAttendenceForStudent = (dayDoc, studentId) => {
    if (!dayDoc) return null;
    return (
      dayDoc.students?.find((s) => s.student?.toString() === studentId?.toString() || s.student === studentId)
        ?.attendence ?? null
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAtt(true);
      setAttError('');
      setAttSuccess('');
      await api.post('/teacher/addAttendence', {
        date: newAttDate,
        subject,
        group,
        students: students.map((s) => ({
          student: s._id,
          attendence: newAttStudents[s._id] ?? true,
        })),
      });
      setAttSuccess('Davamiyyət əlavə edildi!');
      setAllBusyDates((prev) => {
        const next = new Set(prev);
        next.add(newAttDate);
        return next;
      });
      await Promise.all([fetchAttendance(selectedMonth.month, selectedMonth.year), fetchAll()]);
      if (!availableMonths.find((m) => m.month === selectedMonth.month && m.year === selectedMonth.year)) {
        setAvailableMonths((prev) =>
          [...prev, selectedMonth].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month)),
        );
      }
    } catch (err) {
      setAttError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSavingAtt(false);
    }
  };

  // создать тему → вернуть id
  const handleCreateTitle = async (dateStr, titleForm) => {
    const res = await api.post(`/teacher/createTitle/${group}/${subject}`, {
      title: titleForm.title,
      date: dateStr,
      hour: String(titleForm.hour),
      type: titleForm.type,
    });
    return res.data.data._id;
  };

  // обновить тему
  const handleUpdateTitle = async (titleId, dateStr, titleForm) => {
    await api.patch(`/teacher/updateTitle/${titleId}`, {
      title: titleForm.title,
      date: dateStr,
      hour: String(titleForm.hour),
      type: titleForm.type,
    });
  };

  // финальная отправка посещаемости
  const handleSubmitAttendanceFinal = async (titleId, dateStr, studentsPayload) => {
    await api.post('/teacher/addAttendence', {
      date: dateStr,
      subject,
      group,
      title: titleId,
      students: studentsPayload,
    });
    // успех — чистим черновик, закрываем, перезагружаем
    localStorage.removeItem(DRAFT_KEY);
    setWizardOpen(false);
    setDraftData(null);
    setAllBusyDates((prev) => {
      const next = new Set(prev);
      next.add(dateStr);
      return next;
    });
    await handleAttendanceTab(); // перезагрузка вкладки посещаемости
  };

  // сохранение черновика (wizard зовёт при переходах)
  const handleDraftChange = (draft) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const openWizard = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // черновик есть только если тема уже создана (titleId) — есть что продолжить
        if (parsed?.titleId) {
          setDraftData(parsed);
          setDraftQuestion(true);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    // свежий старт
    setDraftData(null);
    setCalendarViewDate(new Date());
    setWizardOpen(true);
  };

  const getStudentGrade = (studentId, type) => {
    if (!grades) return null;
    const map = {
      collegium1: grades.collegium1Grades,
      collegium2: grades.collegium2Grades,
      attendence: grades.attendenceGrades,
      coursework: grades.courseworkGrades,
      exam: grades.examGrades,
    };
    return (map[type] ?? []).find((g) => g.student?.toString() === studentId?.toString() || g.student === studentId);
  };

  const calcTotal = (studentId) => {
    const vals = ['collegium1', 'collegium2', 'coursework', 'attendence', 'exam'].map(
      (t) => getStudentGrade(studentId, t)?.grade?.grade ?? 0,
    );
    return vals.some((v) => v > 0) ? vals.reduce((a, b) => a + b, 0) : null;
  };

  const totalColor = (total) => {
    if (total == null) return 'opacity-20';
    if (total >= 85) return 'text-emerald-500';
    if (total >= 60) return 'text-blue-400';
    if (total >= 51) return 'text-yellow-400';
    return 'text-red-400';
  };

  const openGradeModal = (type, studentId) => {
    setGradeType(type);
    setSelectedStudent(studentId);
    setGradeValue('');
    setModalError('');
    setGradeModal(true);
  };

  const handleSubmitGrade = async () => {
    if (!gradeValue || !gradeDate) {
      setModalError('Qiymət və tarixi doldurun');
      return;
    }
    const max = GRADE_LIMITS[gradeType];
    if (Number(gradeValue) < 0 || Number(gradeValue) > max) {
      setModalError(`Qiymət 0 - ${max} aralığında olmalıdır`);
      return;
    }
    try {
      setSubmitting(true);
      setModalError('');
      await api.post(gradeTypeEndpoint[gradeType], {
        student: selectedStudent,
        subject,
        group,
        grade: { grade: String(gradeValue), date: gradeDate },
      });
      setGradeModal(false);
      await fetchAll();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div role="alert" className="alert alert-error max-w-sm rounded-xl">
          <span>{error}</span>
        </div>
      </div>
    );

  const gradeColumns = [
    { key: 'collegium1', label: 'Kol. 1', max: 10, color: 'text-blue-400' },
    { key: 'collegium2', label: 'Kol. 2', max: 10, color: 'text-blue-400' },
    { key: 'coursework', label: 'Kurswork', max: 20, color: 'text-violet-400' },
    { key: 'attendence', label: 'Dav.', max: 10, color: 'text-emerald-400' },
    { key: 'exam', label: 'İmtahan', max: 50, color: 'text-orange-400' },
  ];

  const columns = buildColumns();

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200"
      >
        <FiArrowLeft size={15} /> Geri
      </button>

      <div className="mb-6">
        <h1 className="text-lg font-bold">Tələbə qiymətləri</h1>
        <p className="text-xs opacity-40 mt-0.5">{students.length} şagird</p>
      </div>

      <div className="flex gap-2 mb-6">
        <TabBtn
          active={activeTab === 'grades'}
          onClick={() => setActiveTab('grades')}
          icon={<FiBook size={14} />}
          label="Qiymətlər"
        />
        <TabBtn
          active={activeTab === 'attendance'}
          onClick={handleAttendanceTab}
          icon={<PiStudent size={14} />}
          label="Qayıblar"
        />
      </div>

      {/* Grades tab */}
      {activeTab === 'grades' && (
        <div className="flex flex-col gap-3">
          {students.length === 0 ? (
            <EmptyState icon={<PiStudent size={28} />} text="Heç bir şagird tapılmadı" />
          ) : (
            students.map((student, index) => {
              const sid = student._id ?? student;
              const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
              const total = calcTotal(sid);
              const isLimited = getStudentGrade(sid, 'attendence')?.limited;
              return (
                <div
                  key={sid}
                  className={`bg-base-100 border rounded-xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-2 hover:shadow-md transition-all duration-200 ${isLimited ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-base-200'}`}
                >
                  {isLimited && (
                    <div className="flex items-center gap-1.5 shrink-0 mt-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <FiAlertCircle size={16} className="text-red-500 dark:text-red-400" />
                        <span className="hidden xl:block text-xs font-semibold text-red-500 dark:text-red-400">
                          Bu Şagird Limitdədir
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex flex-wrap items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}
                    >
                      {initials || <FiUser size={12} />}
                    </div>
                    <div className="w-32 shrink-0 min-w-0">
                      <div className="font-semibold text-xs truncate">
                        {student.name} {student.surname}
                      </div>
                      {student.fatherName && <div className="text-xs opacity-30 truncate">{student.fatherName}</div>}
                    </div>
                    <button
                      onClick={() => setStudentModal(student)}
                      className="w-7 h-7 rounded-lg border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
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
                    <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
                    <div className="flex-1 flex flex-wrap items-center gap-3 lg:gap-5">
                      {gradeColumns.map((col) => {
                        const g = getStudentGrade(sid, col.key);
                        const hasGrade = g?.grade?.grade != null;
                        const canAdd = !hasGrade && col.key !== 'attendence';
                        return (
                          <div key={col.key} className="flex flex-col items-center gap-1 min-w-[52px]">
                            <span className="text-xs opacity-30">{col.label}</span>
                            {hasGrade ? (
                              <GradeCell
                                value={g.grade.grade}
                                max={col.max}
                                color={col.key === 'attendence' && isLimited ? 'text-red-400' : col.color}
                              />
                            ) : canAdd ? (
                              <button
                                onClick={() => openGradeModal(col.key, sid)}
                                className="w-6 h-6 rounded-lg border border-dashed border-base-300 flex items-center justify-center opacity-30 hover:opacity-70 hover:border-[#8B5CF6] transition-all duration-200"
                              >
                                <FiPlus size={11} />
                              </button>
                            ) : (
                              <span className="text-xs opacity-20">—/{col.max}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
                    <div className="flex flex-col items-center shrink-0 min-w-[40px]">
                      <span className="text-xs opacity-30">Yekun</span>
                      <span className={`text-lg font-bold ${totalColor(total)}`}>{total != null ? total : '—'}</span>
                      <span className="text-xs opacity-20">/100</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Attendance tab */}
      {activeTab === 'attendance' && (
        <div className="flex flex-col gap-5">
          {availableMonths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableMonths.map((m) => (
                <button
                  key={`${m.month}-${m.year}`}
                  onClick={() => {
                    setSelectedMonth(m);
                    fetchAttendance(m.month, m.year);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedMonth?.month === m.month && selectedMonth?.year === m.year
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                      : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  {AZ_MONTHS[m.month - 1]} {m.year}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold opacity-60">
              {selectedMonth ? `${AZ_MONTHS[selectedMonth.month - 1]} ${selectedMonth.year}` : ''}
            </h2>
            <button
              onClick={openWizard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
              <FiPlus size={15} /> Davamiyyət əlavə et
            </button>
          </div>

          {attError && <span className="text-red-400 text-xs">{attError}</span>}
          {attSuccess && <span className="text-emerald-400 text-xs">{attSuccess}</span>}

          {!attendanceLoading && columns.length === 0 && (
            <EmptyState icon={<PiStudent size={28} />} text="Bu ay üçün davamiyyət yoxdur" />
          )}

          {attendanceLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
            </div>
          ) : columns.length > 0 ? (
            <div
              ref={tableRef}
              className="overflow-x-auto rounded-2xl border border-base-200 shadow-sm w-full p-4"
              style={{ maxWidth: '100%' }}
            >
              <table
                className="text-sm"
                style={{
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  width: 'max-content',
                }}
              >
                <thead>
                  <tr className="border-b border-base-200 bg-base-100 sticky top-0 z-[5]">
                    <th className="sticky left-0 top-0 z-20 bg-base-100 text-left px-4 py-3 font-semibold text-xs opacity-50 min-w-[180px] border-r border-base-200">
                      Şagird
                    </th>
                    {columns.map((doc) => {
                      const d = new Date(doc.date);
                      return (
                        <th
                          key={doc._id}
                          className="py-2 text-center text-xs font-semibold opacity-50 w-12 min-w-[48px] bg-base-100 sticky top-0 z-[5]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{d.getDate()}</span>
                            <button
                              onClick={() => setLessonCardModal(doc)}
                              title={doc.title?.title ?? ''}
                              className="w-5 h-5 rounded-md flex items-center justify-center opacity-50 hover:opacity-100 hover:text-[#8B5CF6] transition-all duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="13"
                                height="13"
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
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const sid = student._id;
                    const initials =
                      `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                    return (
                      <tr
                        key={sid}
                        className="border-b border-base-200 last:border-0 bg-base-100 hover:bg-base-200/30 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-base-100 px-4 py-2.5 border-r border-base-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}
                              >
                                {initials || <FiUser size={11} />}
                              </div>
                              <span className="font-medium text-xs whitespace-nowrap">
                                {student.name} {student.surname}
                              </span>
                            </div>
                            <button
                              onClick={() => setStudentModal(student)}
                              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
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
                        </td>
                        {columns.map((doc) => {
                          const att = getAttendenceForStudent(doc, sid);
                          return (
                            <td key={doc._id} className="py-2.5 text-center w-12">
                              {att === null ? (
                                <span className="text-xs opacity-20">—</span>
                              ) : att === true ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-sm">
                                  +
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm">
                                  q
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* Вопрос: продолжить черновик? */}
      {draftQuestion && (
        <div className="modal modal-open z-50" role="dialog">
          <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-6 max-w-sm flex flex-col gap-4">
            <h3 className="text-base font-bold">Yarımçıq davamiyyət var</h3>
            <p className="text-sm opacity-60">Əvvəlki davamiyyəti davam etdirmək istəyirsiniz?</p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  // продолжить — открыть wizard с шага 3 (тема уже создана)
                  setDraftQuestion(false);
                  setWizardOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all duration-200"
              >
                Davam et
              </button>
              <button
                onClick={() => {
                  // отказ — удалить черновик из стейта (тема на бэке пока остаётся)
                  localStorage.removeItem(DRAFT_KEY);
                  setDraftData(null);
                  setDraftQuestion(false);
                  setCalendarViewDate(new Date());
                  setWizardOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
              >
                Yenidən başla
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDraftQuestion(false)} />
        </div>
      )}

      {/* Wizard */}
      {wizardOpen && (
        <AddAttendanceWizard
          students={students}
          viewDate={calendarViewDate}
          onChangeViewDate={setCalendarViewDate}
          allBusyDates={allBusyDates}
          initialStep={draftData?.titleId ? 3 : 1}
          initialDate={draftData?.date ?? ''}
          initialTitleForm={draftData?.titleForm ?? { title: '', hour: '1', type: 'N' }}
          initialAttStudents={draftData?.attStudents ?? null}
          initialTitleId={draftData?.titleId ?? null}
          onCreateTitle={handleCreateTitle}
          onUpdateTitle={handleUpdateTitle}
          onSubmitAttendance={handleSubmitAttendanceFinal}
          onDraftChange={handleDraftChange}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {/* Карточка урока по клику на иконку в таблице */}
      {lessonCardModal &&
        (() => {
          const doc = lessonCardModal;
          const d = new Date(doc.date);
          const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
          const total = doc.students?.length ?? 0;
          const present = doc.students?.filter((s) => s.attendence).length ?? 0;
          const absent = total - present;
          return (
            <div className="modal modal-open z-50" role="dialog">
              <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-6 max-w-sm flex flex-col gap-4">
                <LessonCard
                  title={doc.title?.title ?? '—'}
                  type={doc.title?.type ?? 'N'}
                  date={dateStr}
                  hour={doc.title?.hour ?? '—'}
                  total={total}
                  present={present}
                  absent={absent}
                />
                <button
                  onClick={() => setLessonCardModal(null)}
                  className="py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                >
                  Bağla
                </button>
              </div>
              <div className="modal-backdrop" onClick={() => setLessonCardModal(null)} />
            </div>
          );
        })()}

      {/* Grade modal */}
      {gradeModal && (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                <FiBook size={18} />
              </div>
              <h3 className="text-lg font-bold">{gradeTypeLabel[gradeType]}</h3>
              <p className="text-xs opacity-40">Maks: {GRADE_LIMITS[gradeType]} bal</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-50 ml-1">Bal (0 – {GRADE_LIMITS[gradeType]})</label>
                <input
                  type="number"
                  min={0}
                  max={GRADE_LIMITS[gradeType]}
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  placeholder={`0 - ${GRADE_LIMITS[gradeType]}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-50 ml-1">Tarix (DD-MM-YYYY)</label>
                <input
                  type="text"
                  value={gradeDate}
                  onChange={(e) => setGradeDate(e.target.value)}
                  className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>
            {modalError && <span className="text-red-400 text-xs text-center">{modalError}</span>}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSubmitGrade}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
              </button>
              <button
                onClick={() => setGradeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
              >
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}

      <StudentInfoModal student={studentModal} onClose={() => setStudentModal(null)} />

      {attModal && (
        <AttendanceModal
          date={newAttDate}
          students={students}
          attStudents={newAttStudents}
          onToggle={(sid) => setNewAttStudents((prev) => ({ ...prev, [sid]: !prev[sid] }))}
          onSave={async () => {
            await handleSaveAttendance();
            setAttModal(false);
          }}
          onClose={() => {
            setAttModal(false);
            setAttError('');
          }}
          saving={savingAtt}
          error={attError}
        />
      )}

      {calendarModal && (
        <AttendanceCalendarModal
          viewDate={calendarViewDate}
          onChangeViewDate={setCalendarViewDate}
          allBusyDates={allBusyDates}
          onClose={() => setCalendarModal(false)}
          onPickDay={(pickedDate, pickedMonth) => {
            setNewAttDate(pickedDate);
            const resetMap = {};
            students.forEach((s) => {
              resetMap[s._id] = true;
            });
            setNewAttStudents(resetMap);
            setCalendarModal(false);
            setAttModal(true);
            setSelectedMonth(pickedMonth);
            const monthExists = availableMonths.some(
              (m) => m.month === pickedMonth.month && m.year === pickedMonth.year,
            );
            if (!monthExists) {
              setAttendanceData([]);
              setAvailableMonths((prev) =>
                [...prev, pickedMonth].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month)),
              );
            } else {
              fetchAttendance(pickedMonth.month, pickedMonth.year);
            }
          }}
        />
      )}
    </div>
  );
}

export default TeacherGroupDetail;
