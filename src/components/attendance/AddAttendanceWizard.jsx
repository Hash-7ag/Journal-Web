import React, { useState } from 'react';
import { FiX, FiArrowLeft, FiCheck, FiCalendar, FiBook, FiUser, FiClock, FiUsers } from 'react-icons/fi';

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
const colors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
];

// ---- Шаг 1: календарь (логика из AttendanceCalendarModal) ----
function CalendarStep({ viewDate, onChangeViewDate, allBusyDates, selectedDate, onPickDay }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const mm = String(month + 1).padStart(2, '0');

  const busyDays = new Set(
    [...allBusyDates].filter((key) => key.endsWith(`-${mm}-${year}`)).map((key) => parseInt(key.split('-')[0], 10)),
  );

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleClick = (day) => {
    if (!day || busyDays.has(day)) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const picked = new Date(year, month, day);
    picked.setHours(0, 0, 0, 0);
    if (picked > today) return;
    const dd = String(day).padStart(2, '0');
    const mm2 = String(month + 1).padStart(2, '0');
    onPickDay(`${dd}-${mm2}-${year}`, { month: month + 1, year });
  };

  const selectedDay = (() => {
    if (!selectedDate) return null;
    const [dd, mm2, yyyy] = selectedDate.split('-');
    if (Number(mm2) === month + 1 && Number(yyyy) === year) return Number(dd);
    return null;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChangeViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
        >
          <FiArrowLeft size={14} />
        </button>
        <span className="text-sm font-semibold">
          {AZ_MONTHS[month]} {year}
        </span>
        <button
          onClick={() => onChangeViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
        >
          <FiArrowLeft size={14} className="rotate-180" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'].map((d) => (
          <div key={d} className="text-center text-xs opacity-30 font-semibold py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const thisDay = day ? new Date(year, month, day) : null;
          const isFuture = thisDay && thisDay > today;
          const isBusy = day && busyDays.has(day);
          const isSelected = day && day === selectedDay;
          const isDisabled = !day || isBusy || isFuture;
          return (
            <button
              key={i}
              disabled={isDisabled}
              onClick={() => handleClick(day)}
              className={`aspect-square rounded-xl text-sm font-semibold transition-all duration-150 ${!day ? 'invisible' : ''} ${isSelected ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-md' : isBusy || isFuture ? 'opacity-25 cursor-not-allowed bg-base-200' : 'hover:bg-gradient-to-br hover:from-[#8B5CF6] hover:to-[#3B82F6] hover:text-white hover:shadow-md cursor-pointer'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="text-xs opacity-30 text-center">Boz rəngli günlər artıq mövcuddur</p>
    </div>
  );
}

// ---- Главный wizard ----
function AddAttendanceWizard({
  students,
  groupName,
  subjectName,
  // дата
  viewDate,
  onChangeViewDate,
  allBusyDates,
  // начальные значения (для возобновления из черновика)
  initialStep = 1,
  initialDate = '',
  initialTitleForm = { title: '', hour: '', type: 'N' },
  initialAttStudents = null,
  initialTitleId = null,
  // колбэки наружу
  onCreateTitle, // (dateStr, titleForm) => Promise<titleId>
  onUpdateTitle, // (titleId, dateStr, titleForm) => Promise
  onSubmitAttendance, // (titleId, dateStr, studentsPayload) => Promise
  onClose,
  onDraftChange, // (draftObject) => void  — сохранить черновик
}) {
  const [step, setStep] = useState(initialStep);
  const [date, setDate] = useState(initialDate);
  const [pickedMonth, setPickedMonth] = useState(null);
  const [titleForm, setTitleForm] = useState(initialTitleForm);
  const [titleId, setTitleId] = useState(initialTitleId);
  const [titleDirty, setTitleDirty] = useState(false); // менялась ли тема после создания

  const [attStudents, setAttStudents] = useState(() => {
    if (initialAttStudents) return initialAttStudents;
    const map = {};
    students.forEach((s) => {
      map[s._id] = true;
    });
    return map;
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 4;

  // ---- Навигация ----
  const goNext = async () => {
    setError('');

    // Шаг 1 → 2: дата выбрана
    if (step === 1) {
      if (!date) {
        setError('Tarix seçin');
        return;
      }
      setStep(2);
      return;
    }

    // Шаг 2 → 3: создать тему (если ещё не создана) или обновить (если менялась)
    if (step === 2) {
      if (!titleForm.title.trim() || !String(titleForm.hour).trim() || !titleForm.type) {
        setError('Bütün sahələri doldurun');
        return;
      }
      try {
        setBusy(true);
        if (!titleId) {
          // создаём впервые
          const newId = await onCreateTitle(date, titleForm);
          setTitleId(newId);
          setTitleDirty(false);
          onDraftChange?.({
            step: 3,
            date,
            titleForm,
            titleId: newId,
            attStudents,
          });
        } else if (titleDirty) {
          // тема уже была — обновляем
          await onUpdateTitle(titleId, date, titleForm);
          setTitleDirty(false);
          onDraftChange?.({ step: 3, date, titleForm, titleId, attStudents });
        } else {
          onDraftChange?.({ step: 3, date, titleForm, titleId, attStudents });
        }
        setStep(3);
      } catch (err) {
        setError(err.response?.data?.message || 'Mövzu yaradıla bilmədi');
      } finally {
        setBusy(false);
      }
      return;
    }

    // Шаг 3 → 4: превью
    if (step === 3) {
      onDraftChange?.({ step: 3, date, titleForm, titleId, attStudents });
      setStep(4);
      return;
    }
  };

  const goBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  // ---- Финальная отправка (шаг 4) ----
  const handleConfirm = async () => {
    setError('');
    try {
      setBusy(true);
      // если на шаге 4 тему правили — обновить перед отправкой
      if (titleDirty && titleId) {
        await onUpdateTitle(titleId, date, titleForm);
        setTitleDirty(false);
      }
      const studentsPayload = students.map((s) => ({
        student: s._id,
        attendence: attStudents[s._id] ?? true,
      }));
      await onSubmitAttendance(titleId, date, studentsPayload);
      // успех — наверх (TeacherGroupDetail закроет и перезагрузит)
    } catch (err) {
      setError(err.response?.data?.message || 'Davamiyyət əlavə edilə bilmədi');
      setBusy(false);
    }
  };

  const updateTitleField = (field, val) => {
    setTitleForm((prev) => ({ ...prev, [field]: val }));
    if (titleId) setTitleDirty(true); // тема уже создана → пометить что менялась
  };

  const toggleStudent = (sid) => {
    setAttStudents((prev) => ({ ...prev, [sid]: !(prev[sid] ?? true) }));
  };

  // ---- Сводка для превью ----
  const presentCount = students.filter((s) => attStudents[s._id] ?? true).length;
  const absentCount = students.length - presentCount;
  const typeLabel = titleForm.type === 'P' ? 'Praktiki' : 'Nəzəri';

  const stepTitles = ['Tarix seçin', 'Dərs mövzusu', 'Davamiyyət', 'Təsdiq'];
  const stepSubtitles = [
    'Davamiyyət üçün tarix seçin',
    'Dərsin mövzusunu qeyd edin',
    date ? `${date}` : '',
    'Məlumatları yoxlayın',
  ];

  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col p-0 max-w-lg overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4">
          <div>
            <h3 className="text-lg font-bold">{stepTitles[step - 1]}</h3>
            <p className="text-xs opacity-40 mt-0.5">{stepSubtitles[step - 1]}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
          >
            <FiX size={15} />
          </button>
        </div>

        <div className="px-8 pb-2 flex flex-col gap-3 min-h-[280px]">
          {/* Шаг 1 — Дата */}
          {step === 1 && (
            <CalendarStep
              viewDate={viewDate}
              onChangeViewDate={onChangeViewDate}
              allBusyDates={allBusyDates}
              selectedDate={date}
              onPickDay={(d, m) => {
                setDate(d);
                setPickedMonth(m);
              }}
            />
          )}

          {/* Шаг 2 — Тема */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-50 ml-1">Mövzu</label>
                <input
                  type="text"
                  value={titleForm.title}
                  onChange={(e) => updateTitleField('title', e.target.value)}
                  className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  placeholder="Dərsin mövzusu"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-50 ml-1">Saat</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={titleForm.hour}
                  onChange={(e) => updateTitleField('hour', e.target.value)}
                  className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  placeholder="Saat (1 - 7)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium opacity-50 ml-1">Dərs tipi</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateTitleField('type', 'N')}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${titleForm.type === 'N' ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 text-[#8B5CF6] shadow-sm' : 'border-base-200 opacity-60 hover:opacity-100 hover:bg-base-200/40'}`}
                  >
                    Nəzəri
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTitleField('type', 'P')}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${titleForm.type === 'P' ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 text-[#8B5CF6] shadow-sm' : 'border-base-200 opacity-60 hover:opacity-100 hover:bg-base-200/40'}`}
                  >
                    Praktiki
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 3 — Посещаемость */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm font-medium">
                <FiBook size={14} /> Mövzu: {titleForm.title}
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {students.map((student, index) => {
                  const sid = student._id;
                  const initials = `${student.name?.charAt(0) ?? ''}${student.surname?.charAt(0) ?? ''}`.toUpperCase();
                  const isPresent = attStudents[sid] ?? true;
                  return (
                    <div
                      key={sid}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-base-200 hover:bg-base-200/30 transition-all duration-200"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {student.name} {student.surname}
                        </div>
                        {student.fatherName && <div className="text-xs opacity-40 truncate">{student.fatherName}</div>}
                      </div>
                      <button
                        onClick={() => toggleStudent(sid)}
                        className={`w-9 h-9 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-sm shrink-0 ${isPresent ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-red-400 hover:bg-red-500'}`}
                      >
                        {isPresent ? '+' : 'q'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Шаг 4 — Превью */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-base-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] px-5 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base">{titleForm.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-white/20 font-semibold">{typeLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs opacity-90">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={11} />
                      {date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={11} />
                      {titleForm.hour} saat
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-3 rounded-xl bg-base-200/50">
                      <span className="text-xs opacity-40">Cəmi</span>
                      <span className="text-lg font-bold">{students.length}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                      <span className="text-xs opacity-40">Gəldi</span>
                      <span className="text-lg font-bold text-emerald-500">{presentCount}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                      <span className="text-xs opacity-40">Gəlmədi</span>
                      <span className="text-lg font-bold text-red-500">{absentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#8B5CF6] opacity-70 hover:opacity-100 transition-opacity self-start"
              >
                Mövzunu redaktə et
              </button>
            </div>
          )}

          {error && <span className="text-red-400 text-xs flex items-center gap-1 mt-1">{error}</span>}
        </div>

        {/* Footer */}
        <div className="px-8 pt-4 pb-7 flex flex-col gap-5 mt-auto">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={goBack}
                disabled={busy}
                className="px-5 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200 disabled:opacity-60"
              >
                Geri
              </button>
            )}
            {step < 4 && (
              <button
                onClick={goNext}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {busy ? <span className="loading loading-spinner loading-xs" /> : 'Davam'}
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {busy ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <FiCheck size={15} /> Təsdiqlə
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`rounded-full transition-all duration-300 ${n === step ? 'w-6 h-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : n < step ? 'w-2.5 h-2.5 bg-[#8B5CF6] opacity-60' : 'w-2.5 h-2.5 bg-base-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default AddAttendanceWizard;
