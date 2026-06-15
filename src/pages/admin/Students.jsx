import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiMail, FiPhone, FiLock, FiUsers, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

import Pagination from '../../components/ui/Pagination';
import ResetPasswordBlock from '../../components/ui/ResetPasswordBlock';
import StudentInfoModal from '../../components/group/StudentInfoModal';
import GroupSection from '../../components/students/GroupSection';
import TabBtn from '../../components/ui/TabBtn';

const studentColors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#A78BFA] to-[#60A5FA]',
  'from-[#3B82F6] to-[#8B5CF6]',
];

function StudentRow({ student, globalIndex, onInfo, onEdit }) {
  const colorClass = studentColors[globalIndex % studentColors.length];
  const initials = `${student.name?.charAt(0) || ''}${student.surname?.charAt(0) || ''}`.toUpperCase();
  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className="w-11 h-11 shrink-0 relative flex items-center justify-center">
        <div className={`absolute w-9 h-9 bg-gradient-to-br ${colorClass} rotate-45 rounded-lg shadow-md`} />
        <span className="relative z-10 text-white font-bold text-sm">{initials || '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {student.name} {student.surname}
        </div>
        <div className="text-xs opacity-40 mt-0.5 truncate">{student.fatherName}</div>
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {student.email && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiMail size={12} />
            {student.email}
          </div>
        )}
        {student.phoneNumber && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiPhone size={12} />
            {student.phoneNumber}
          </div>
        )}
      </div>
      <button
        onClick={() => onEdit(student)}
        className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200"
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
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        onClick={() => onInfo(student)}
        className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200"
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

function Students() {
  const [activeTab, setActiveTab] = useState('free');
  const [initialTabSet, setInitialTabSet] = useState(false);
  const [freeStudents, setFreeStudents] = useState([]);
  const [freeLoading, setFreeLoading] = useState(true);
  const [freePage, setFreePage] = useState(1);
  const [freeTotalPages, setFreeTotalPages] = useState(1);
  const [freeTotal, setFreeTotal] = useState(0);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoModal, setInfoModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    fatherName: '',
    username: '',
    password: '',
    phoneNumber: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  const pageSize = 10;

  const openEditStudent = (student) => {
    setEditForm({
      name: student.name ?? '',
      surname: student.surname ?? '',
      fatherName: student.fatherName ?? '',
      username: student.username ?? '',
      email: student.email ?? '',
      phone: student.phoneNumber?.replace('+994', '') ?? '',
    });
    setEditError('');
    setEditModal(student);
  };

  const handleEditStudent = async () => {
    try {
      setEditSubmitting(true);
      setEditError('');
      await api.patch(`/admin/updateStudentInfo/${editModal._id}`, editForm);
      fetchFreeStudents(freePage);
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchFreeStudents = async (p = 1) => {
    try {
      setFreeLoading(true);
      const res = await api.get(`/admin/getFreeStudents?page=${p}&pageSize=${pageSize}`);
      const total = res.data.total ?? 0;
      setFreeStudents(res.data.data ?? []);
      setFreeTotalPages(res.data.totalPages ?? 1);
      setFreeTotal(total);
      if (!initialTabSet) {
        setActiveTab(total === 0 ? 'assigned' : 'free');
        setInitialTabSet(true);
      }
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setFreeLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const res = await api.get('/admin/getAllGroups');
      setGroups((res.data.data ?? []).filter((g) => (g.students?.length ?? 0) > 0));
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreeStudents(freePage);
  }, [freePage]);
  useEffect(() => {
    fetchGroups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'phoneNumber' ? formatPhone(value) : value }));
  };

  const handleAddStudent = async () => {
    const required = ['name', 'surname', 'fatherName', 'username', 'password', 'phoneNumber', 'email'];
    const missing = required.filter((f) => !formData[f].trim());
    if (missing.length) {
      setModalError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/admin/createStudent', { ...formData, phoneNumber: phoneToRaw(formData.phoneNumber) });
      setIsModalOpen(false);
      setFormData({ name: '', surname: '', fatherName: '', username: '', password: '', phoneNumber: '', email: '' });
      setShowPassword(false);
      setModalError('');
      fetchFreeStudents(freePage);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const textFields = [
    { name: 'name', label: 'Ad', placeholder: 'Məs: Əli' },
    { name: 'surname', label: 'Soyad', placeholder: 'Məs: Məmmədov' },
    { name: 'fatherName', label: 'Ata adı', placeholder: 'Məs: Hüseyn' },
    { name: 'username', label: 'İstifadəçi adı', placeholder: 'username' },
    { name: 'email', label: 'Email', placeholder: 'email@mail.com' },
  ];

  if (freeLoading && freeStudents.length === 0 && groupsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-lg font-bold">Şagirdlər</h1>
          <p className="text-xs opacity-40 mt-0.5">
            {activeTab === 'free'
              ? `${freeTotal} boş şagird · Səhifə ${freePage} / ${freeTotalPages}`
              : `${groups.length} qrup`}
          </p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setShowPassword(false);
            setModalError('');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
        >
          <FiPlus size={16} /> Şagird əlavə et
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error rounded-xl mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {[
          ...(freeTotal > 0 ? [{ key: 'free', label: 'Boş', icon: <FiUser size={14} />, count: freeTotal }] : []),
          { key: 'assigned', label: 'Qrupda', icon: <FiUsers size={14} />, count: groups.length },
        ].map((tab) => (
          <TabBtn
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            icon={tab.icon}
            label={tab.label}
            count={tab.count}
          />
        ))}
      </div>

      {activeTab === 'free' && (
        <>
          {freeLoading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
            </div>
          ) : freeStudents.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Boş şagird tapılmadı</div>
          ) : (
            <div className="flex flex-col gap-3">
              {freeStudents.map((student, index) => (
                <StudentRow
                  key={student._id}
                  student={student}
                  globalIndex={(freePage - 1) * pageSize + index}
                  onInfo={setInfoModal}
                  onEdit={openEditStudent}
                />
              ))}
            </div>
          )}
          <Pagination page={freePage} totalPages={freeTotalPages} onChange={(p) => setFreePage(p)} />
        </>
      )}

      {activeTab === 'assigned' && (
        <>
          {groupsLoading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center opacity-40 mt-20 text-sm">Heç bir qrup tapılmadı</div>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group, index) => (
                <GroupSection
                  key={group._id}
                  group={group}
                  index={index}
                  onInfo={setInfoModal}
                  onEdit={openEditStudent}
                />
              ))}
            </div>
          )}
        </>
      )}

      <StudentInfoModal student={infoModal} onClose={() => setInfoModal(null)} />

      {/* Edit modal */}
      {editModal && (
        <div className="modal modal-open z-50" role="dialog">
          <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Şagirdi Redaktə Et</h3>
                    <p className="text-xs opacity-40">
                      {editModal.name} {editModal.surname}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditModal(null)}
                  className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                >
                  <FiX size={15} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'name', label: 'Ad' },
                  { name: 'surname', label: 'Soyad' },
                  { name: 'fatherName', label: 'Ata adı' },
                  { name: 'username', label: 'İstifadəçi adı' },
                  { name: 'email', label: 'Email' },
                  { name: 'phone', label: 'Telefon (son 9 rəqəm)' },
                ].map(({ name, label }) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                    <input
                      type={name === 'email' ? 'email' : 'text'}
                      value={editForm[name] ?? ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, [name]: e.target.value }))}
                      className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                    />
                  </div>
                ))}
              </div>
              {editError && <span className="text-red-400 text-xs text-center">{editError}</span>}
              <div className="flex gap-3">
                <button
                  onClick={handleEditStudent}
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                >
                  {editSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Yadda saxla'}
                </button>
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
                >
                  Ləğv et
                </button>
              </div>
              <ResetPasswordBlock id={editModal?._id} role="student" />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditModal(null)} />
        </div>
      )}

      {/* Create modal */}
      {isModalOpen && (
        <div className="modal modal-open z-40" role="dialog">
          <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-lg">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                <FiUser size={18} />
              </div>
              <h3 className="text-lg font-bold">Yeni şagird</h3>
              <p className="text-xs opacity-40">Məlumatları doldurun</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {textFields.map(({ name, label, placeholder }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">
                      {name === 'email' ? <FiMail size={14} /> : <FiUser size={14} />}
                    </span>
                    <input
                      type={name === 'email' ? 'email' : 'text'}
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      className="input w-full pl-8 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium opacity-50 ml-1">Şifrə</label>
                <div className="relative">
                  <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="input w-full pl-8 pr-9 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity"
                  >
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-xs font-medium opacity-50 ml-1">Telefon</label>
                <div className="relative">
                  <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || '+994 '}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (!formData.phoneNumber) setFormData((prev) => ({ ...prev, phoneNumber: '+994 ' }));
                    }}
                    placeholder="+994 xx xxx xx xx"
                    className="input w-full pl-8 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>
            {modalError && <span className="text-red-400 text-xs text-center">{modalError}</span>}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddStudent}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-60"
              >
                {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Əlavə et'}
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError('');
                  setShowPassword(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
              >
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
