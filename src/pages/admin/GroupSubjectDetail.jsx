import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../scripts/api.js';
import { FiArrowLeft, FiBook, FiUser } from 'react-icons/fi';
import { PiStudent } from 'react-icons/pi';

import SubjectInfoPanel from '../../components/grades/SubjectInfoPanel';
import GradeCell from '../../components/grades/GradeCell';
import GradeEditModal from '../../components/grades/GradeEditModal';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import TabBtn from '../../components/ui/TabBtn';
import EmptyState from '../../components/ui/EmptyState';
import EditAttendanceListModal from '../../components/attendance/EditAttendanceListModal';
import EditAttendanceDayModal from '../../components/attendance/EditAttendanceDayModal';

const GRADE_LIMITS = { collegium1: 10, collegium2: 10, coursework: 20, attendence: 10, exam: 50 };

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

function GroupSubjectDetail() {
  const { id, subjectId, semestr } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('grades');

  const [gradeEdit, setGradeEdit] = useState(null);
  const [gradeEditValue, setGradeEditValue] = useState('');
  const [gradeEditSubmitting, setGradeEditSubmitting] = useState(false);
  const [gradeEditError, setGradeEditError] = useState('');

  const [attendanceData, setAttendanceData] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [editListModal, setEditListModal] = useState(false);
  const [editDayDoc, setEditDayDoc] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchAttendance = async (month, year) => {
    try {
      setAttendanceLoading(true);
      const monthStr = `${String(month).padStart(2, '0')}-${year}`;
      const res = await api.get(`/admin/getAttendence/${id}/${subjectId}?date=${monthStr}`);
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
      const res = await api.get(`/admin/months/${id}/${subjectId}`);
      const parsed = (res.data ?? []).map(parseMonthStr);
      setAvailableMonths(parsed);
      if (parsed.length > 0) {
        const latest = parsed[parsed.length - 1];
        setSelectedMonth(latest);
        await fetchAttendance(latest.month, latest.year);
      } else {
        const now = new Date();
        setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
        setAttendanceData([]);
      }
    } catch {
      const now = new Date();
      setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
      setAttendanceData([]);
    }
  };

  const handleUpdateAttendance = async (attendenceId, studentsPayload) => {
    try {
      setSavingEdit(true);
      setEditError('');
      await api.patch(`/admin/updateAttendence/${attendenceId}`, { students: studentsPayload });
      setEditDayDoc(null);
      await fetchAttendance(selectedMonth.month, selectedMonth.year);
      const gradesRes = await api.get(`/admin/getGrades/${id}/${subjectId}`);
      setGrades(gradesRes.data);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSavingEdit(false);
    }
  };

  const buildTable = () => {
    const dayMap = {};
    attendanceData.forEach((doc) => {
      const d = new Date(doc.date);
      dayMap[d.getDate()] = doc;
    });
    const days = Object.keys(dayMap)
      .map(Number)
      .sort((a, b) => a - b);
    return { days, dayMap };
  };

  const getAttendenceForStudent = (dayDoc, studentId) => {
    if (!dayDoc) return null;
    const found = dayDoc.students?.find((s) => (s.student?._id ?? s.student)?.toString() === studentId?.toString());
    return found?.attendence ?? null;
  };

  const gradeEndpoints = {
    collegium1: (g, s, st) => `/admin/updateCollegium1/${g}/${s}/${st}`,
    collegium2: (g, s, st) => `/admin/updateCollegium2/${g}/${s}/${st}`,
    exam: (g, s, st) => `/admin/updateExam/${g}/${s}/${st}`,
    coursework: (g, s, st) => `/admin/updateCoursework/${g}/${s}/${st}`,
  };

  const handleGradeEdit = async () => {
    if (gradeEditValue === '') {
      setGradeEditError('Qiymət daxil edin');
      return;
    }
    const max = GRADE_LIMITS[gradeEdit.type];
    if (Number(gradeEditValue) < 0 || Number(gradeEditValue) > max) {
      setGradeEditError(`0 - ${max} aralığında olmalıdır`);
      return;
    }
    try {
      setGradeEditSubmitting(true);
      setGradeEditError('');
      await api.patch(gradeEndpoints[gradeEdit.type](id, subjectId, gradeEdit.studentId), {
        grade: Number(gradeEditValue),
      });
      const gradesRes = await api.get(`/admin/getGrades/${id}/${subjectId}`);
      setGrades(gradesRes.data);
      setGradeEdit(null);
    } catch (err) {
      setGradeEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setGradeEditSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupRes, studentsRes, gradesRes] = await Promise.all([
          api.post(`/admin/getGroupById/${id}`, { semestr: Number(semestr) }),
          api.get(`/admin/getAssignedyStudents/${id}?page=1&pageSize=999`),
          api.get(`/admin/getGrades/${id}/${subjectId}`),
        ]);
        const subjectItem = groupRes.data.subjects?.find((s) => (s.subject?._id ?? s.subject) === subjectId);
        setSubject(subjectItem);
        setStudents(studentsRes.data.data ?? []);
        setGrades(gradesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Yükləmə xətası');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, subjectId]);

  const getGrade = (studentId, type) => {
    if (!grades) return null;
    const map = {
      collegium1: grades.collegium1Grades,
      collegium2: grades.collegium2Grades,
      attendence: grades.attendenceGrades,
      coursework: grades.courseworkGrades,
      exam: grades.examGrades,
    };
    return (
      (map[type] ?? []).find((g) => g.student?.toString() === studentId?.toString() || g.student === studentId)?.grade
        ?.grade ?? null
    );
  };

  const calcTotal = (studentId) => {
    const vals = ['collegium1', 'collegium2', 'coursework', 'attendence', 'exam'].map(
      (t) => getGrade(studentId, t) ?? 0,
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

  const subjectInfo = subject?.subject ?? {};
  const teacher = subject?.teacher ?? subjectInfo?.teacherId;
  const gradeColumns = [
    { key: 'collegium1', label: 'Kol. 1', max: 10, color: 'text-blue-400' },
    { key: 'collegium2', label: 'Kol. 2', max: 10, color: 'text-blue-400' },
    { key: 'coursework', label: 'Kurswork', max: 20, color: 'text-violet-400' },
    { key: 'attendence', label: 'Dav.', max: 10, color: 'text-emerald-400' },
    { key: 'exam', label: 'İmtahan', max: 50, color: 'text-orange-400' },
  ];
  const { days, dayMap } = buildTable();

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 mb-6 transition-opacity duration-200"
      >
        <FiArrowLeft size={15} /> Geri
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        <SubjectInfoPanel subjectInfo={subjectInfo} teacher={teacher} studentCount={students.length} />

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex gap-2 mb-2">
            <TabBtn
              active={activeTab === 'grades'}
              onClick={() => setActiveTab('grades')}
              icon={<FiBook size={14} />}
              label="Qiymətlər"
            />
            <TabBtn
              active={activeTab === 'attendance'}
              onClick={handleAttendanceTab}
              icon={<FiUser size={14} />}
              label="Davamiyyət"
            />
          </div>

          {activeTab === 'grades' && (
            <>
              {students.length === 0 ? (
                <EmptyState icon={<PiStudent size={28} />} text="Heç bir şagird tapılmadı" />
              ) : (
                students.map((student, index) => {
                  const sid = student._id;
                  const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                  const total = calcTotal(sid);
                  const isLimited = (grades?.attendenceGrades ?? []).find(
                    (g) => g.student?.toString() === sid?.toString(),
                  )?.limited;
                  return (
                    <div
                      key={sid}
                      className={`bg-base-100 border rounded-xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-3 hover:shadow-md transition-all duration-200 ${isLimited ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : 'border-base-200'}`}
                    >
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
                      <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
                      <div className="flex-1 flex flex-wrap items-center gap-3 lg:gap-5">
                        {gradeColumns.map((col) => (
                          <GradeCell
                            key={col.key}
                            label={col.label}
                            value={getGrade(sid, col.key)}
                            max={col.max}
                            color={col.key === 'attendence' && isLimited ? 'text-red-400' : col.color}
                            editable={col.key !== 'attendence' && getGrade(sid, col.key) != null}
                            onEdit={() => {
                              setGradeEdit({ studentId: sid, type: col.key });
                              setGradeEditValue(String(getGrade(sid, col.key)));
                              setGradeEditError('');
                            }}
                          />
                        ))}
                      </div>
                      <div className="w-px h-8 bg-base-200 shrink-0 hidden lg:block" />
                      <div className="flex flex-col items-center shrink-0 min-w-[40px]">
                        <span className="text-xs opacity-30">Yekun</span>
                        <span className={`text-lg font-bold ${totalColor(total)}`}>{total != null ? total : '—'}</span>
                        <span className="text-xs opacity-20">/100</span>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'attendance' && (
            <AttendanceTable
              students={students}
              days={days}
              dayMap={dayMap}
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              attendanceLoading={attendanceLoading}
              getAttendenceForStudent={getAttendenceForStudent}
              onSelectMonth={(m) => {
                setSelectedMonth(m);
                fetchAttendance(m.month, m.year);
              }}
              onOpenCalendar={() => setEditListModal(true)}
              actionLabel="Davamiyyəti dəyiş"
            />
          )}
        </div>
      </div>

      <GradeEditModal
        gradeEdit={gradeEdit}
        gradeEditValue={gradeEditValue}
        onChange={setGradeEditValue}
        onSave={handleGradeEdit}
        onClose={() => setGradeEdit(null)}
        submitting={gradeEditSubmitting}
        error={gradeEditError}
      />

      {editListModal && (
        <EditAttendanceListModal
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onSelectMonth={(m) => {
            setSelectedMonth(m);
            fetchAttendance(m.month, m.year);
          }}
          attendanceData={attendanceData}
          attendanceLoading={attendanceLoading}
          onEditDay={(doc) => setEditDayDoc(doc)}
          onClose={() => setEditListModal(false)}
        />
      )}

      {editDayDoc && (
        <EditAttendanceDayModal
          dayDoc={editDayDoc}
          students={students}
          onSave={handleUpdateAttendance}
          onClose={() => {
            setEditDayDoc(null);
            setEditError('');
          }}
          saving={savingEdit}
          error={editError}
        />
      )}
    </div>
  );
}

export default GroupSubjectDetail;
