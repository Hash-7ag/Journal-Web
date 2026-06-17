import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import {
  FiPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiUsers,
  FiX,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiCheck,
} from 'react-icons/fi';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

import Pagination from '../../components/ui/Pagination.jsx';
import ResetPasswordBlock from '../../components/ui/ResetPasswordBlock.jsx';

const colors = [
  'from-[#8B5CF6] to-[#3B82F6]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#8B5CF6] to-[#A78BFA]',
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#A78BFA] to-[#60A5FA]',
  'from-[#3B82F6] to-[#8B5CF6]',
];

function ParentRow({ parent, globalIndex, onEdit }) {
  const colorClass = colors[globalIndex % colors.length];
  const initials = `${parent.name?.charAt(0) || ''}${parent.surname?.charAt(0) || ''}`.toUpperCase();
  const children = parent.children ?? [];
  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
      <div className="w-11 h-11 shrink-0 relative flex items-center justify-center">
        <div className={`absolute w-9 h-9 bg-gradient-to-br ${colorClass} rotate-45 rounded-lg shadow-md`} />
        <span className="relative z-10 text-white font-bold text-sm">{initials || '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {parent.name} {parent.surname}
        </div>
        <div className="text-xs opacity-40 mt-0.5 truncate">{parent.fatherName}</div>
        {/* дети */}
        {children.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {children.map((c) => (
              <span
                key={c._id}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-base-200/70 border border-base-200"
              >
                <FiUser size={9} className="opacity-40" />
                {c.name} {c.surname}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {parent.email && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiMail size={12} />
            {parent.email}
          </div>
        )}
        {parent.phone && (
          <div className="flex items-center gap-1.5 text-xs opacity-40">
            <FiPhone size={12} />
            {parent.phone}
          </div>
        )}
      </div>
      <button
        onClick={() => onEdit(parent)}
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
    </div>
  );
}

function Parents() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const pageSize = 15;

  // create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    fatherName: '',
    username: '',
    password: '',
    phone: '',
    email: '',
  });
  const [selectedChildren, setSelectedChildren] = useState([]); // массив id
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalError, setModalError] = useState('');

  // студенты для выбора детей
  const [students, setStudents] = useState([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentHasMore, setStudentHasMore] = useState(true);
  const [studentLoadingMore, setStudentLoadingMore] = useState(false);
  const [childSearch, setChildSearch] = useState('');

  // edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchParents = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/getParents?page=${p}&pageSize=${pageSize}`);
      setParents(res.data.data ?? []);
      setTotalPages(res.data.totalPage ?? 1);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/getAllStudents?page=1&pageSize=10');
      const data = res.data.data ?? [];
      setStudents(data);
      setStudentHasMore(data.length === 10);
      setStudentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMoreStudents = async () => {
    if (studentLoadingMore || !studentHasMore) return;
    try {
      setStudentLoadingMore(true);
      const next = studentPage + 1;
      const res = await api.get(`/admin/getAllStudents?page=${next}&pageSize=10`);
      const data = res.data.data ?? [];
      setStudents((prev) => [...prev, ...data]);
      setStudentPage(next);
      setStudentHasMore(data.length === 10);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchParents(page);
  }, [page]);
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'phone' ? formatPhone(value) : value }));
  };

  const toggleChild = (id) =>
    setSelectedChildren((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleAddParent = async () => {
    const required = ['name', 'surname', 'fatherName', 'username', 'password', 'phone', 'email'];
    const missing = required.filter((f) => !formData[f].trim());
    if (missing.length) {
      setModalError('Bütün sahələri doldurun');
      return;
    }
    if (formData.password.length < 8) {
      setModalError('Parol minimal 8 simvol olmalıdır');
      return;
    }
    if (selectedChildren.length === 0) {
      setModalError('Ən azı bir uşaq seçin');
      return;
    }
    try {
      setSubmitting(true);
      setModalError('');
      await api.post('/admin/createParent', {
        ...formData,
        phone: phoneToRaw(formData.phone),
        children: selectedChildren,
      });
      setIsModalOpen(false);
      setFormData({ name: '', surname: '', fatherName: '', username: '', password: '', phone: '', email: '' });
      setSelectedChildren([]);
      setChildSearch('');
      setShowPassword(false);
      setModalError('');
      fetchParents(page);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditParent = (parent) => {
    setEditForm({
      name: parent.name ?? '',
      surname: parent.surname ?? '',
      fatherName: parent.fatherName ?? '',
      username: parent.username ?? '',
      phone: parent.phone?.replace('+994', '') ?? '',
    });
    setEditError('');
    setEditModal(parent);
  };

  const handleEditParent = async () => {
    try {
      setEditSubmitting(true);
      setEditError('');
      await api.patch(`/admin/updateParentInfo/${editModal._id}`, editForm);
      await fetchParents(page);
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setEditSubmitting(false);
    }
  };

  const textFields = [
    { name: 'name', label: 'Ad', placeholder: 'Məs: Əli' },
    { name: 'surname', label: 'Soyad', placeholder: 'Məs: Məmmədov' },
    { name: 'fatherName', label: 'Ata adı', placeholder: 'Məs: Hüseyn' },
    { name: 'username', label: 'İstifadəçi adı', placeholder: 'username' },
    { name: 'email', label: 'Email', placeholder: 'email@mail.com' },
  ];

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.surname} ${s.fatherName}`.toLowerCase().includes(childSearch.toLowerCase()),
  );

  if (loading && parents.length === 0) {
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
          <h1 className="text-lg font-bold">Valideynlər</h1>
          <p className="text-xs opacity-40 mt-0.5">
            {total} valideyn · Səhifə {page} / {totalPages}
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
          <FiPlus size={16} /> Valideyn əlavə et
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error rounded-xl mb-4">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
        </div>
      ) : parents.length === 0 ? (
        <div className="text-center opacity-40 mt-20 text-sm">Heç bir valideyn tapılmadı</div>
      ) : (
        <div className="flex flex-col gap-3">
          {parents.map((parent, index) => (
            <ParentRow
              key={parent._id}
              parent={parent}
              globalIndex={(page - 1) * pageSize + index}
              onEdit={openEditParent}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />

      {/* Edit modal */}
      {editModal && (
        <div className="modal modal-open z-50" role="dialog">
          <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-lg overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                    <FiUser size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Valideyni Redaktə Et</h3>
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
                  { name: 'phone', label: 'Telefon (son 9 rəqəm)' },
                ].map(({ name, label }) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                    <input
                      type="text"
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
                  onClick={handleEditParent}
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
              <ResetPasswordBlock id={editModal?._id} role="parent" />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditModal(null)} />
        </div>
      )}

      {/* Create modal */}
      {isModalOpen && (
        <div className="modal modal-open z-40" role="dialog">
          <div className="modal-box rounded-2xl border border-base-200 shadow-xl flex flex-col gap-5 p-8 max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md mb-1">
                <FiUsers size={18} />
              </div>
              <h3 className="text-lg font-bold">Yeni valideyn</h3>
              <p className="text-xs opacity-40">Məlumatları doldurun və uşaqları seçin</p>
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
                    name="phone"
                    value={formData.phone || '+994 '}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (!formData.phone) setFormData((prev) => ({ ...prev, phone: '+994 ' }));
                    }}
                    placeholder="+994 xx xxx xx xx"
                    className="input w-full pl-8 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Выбор детей */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium opacity-50 ml-1">Uşaqlar ({selectedChildren.length} seçilib)</label>
              <div className="relative">
                <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input
                  type="text"
                  value={childSearch}
                  onChange={(e) => setChildSearch(e.target.value)}
                  placeholder="Şagird axtar..."
                  className="input w-full pl-9 pr-3 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="text-center opacity-30 py-6 text-sm">Şagird tapılmadı</div>
                ) : (
                  filteredStudents.map((s, index) => {
                    const isSel = selectedChildren.includes(s._id);
                    const initials = `${s.name?.charAt(0) ?? ''}${s.surname?.charAt(0) ?? ''}`.toUpperCase();
                    return (
                      <button
                        key={s._id}
                        onClick={() => toggleChild(s._id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all duration-200 ${isSel ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 shadow-sm' : 'border-base-200 hover:border-base-300 hover:bg-base-200/40'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0 transition-all duration-200 ${isSel ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]' : `bg-gradient-to-br ${colors[index % colors.length]}`}`}
                        >
                          {isSel ? <FiCheck size={14} /> : initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {s.name} {s.surname}
                          </div>
                          {s.fatherName && <div className="text-xs opacity-40 truncate">{s.fatherName}</div>}
                        </div>
                      </button>
                    );
                  })
                )}
                {studentHasMore && (
                  <button
                    onClick={loadMoreStudents}
                    disabled={studentLoadingMore}
                    className="py-2 rounded-xl border border-base-200 text-xs font-medium opacity-60 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                  >
                    {studentLoadingMore ? <span className="loading loading-spinner loading-xs" /> : 'Daha çox yüklə'}
                  </button>
                )}
              </div>
            </div>

            {modalError && <span className="text-red-400 text-xs text-center">{modalError}</span>}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddParent}
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
                  setSelectedChildren([]);
                  setChildSearch('');
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

export default Parents;
