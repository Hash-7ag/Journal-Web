import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import {
   FiPlus, FiUser, FiMail, FiPhone, FiLock,
   FiChevronLeft, FiChevronRight, FiEye, FiEyeOff,
   FiBook, FiUsers, FiX, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

// ── Student Info Modal ──────────────────────────────────
function StudentInfoModal({ student, onClose }) {
   if (!student) return null;
   return (
      <div className="modal modal-open z-50" role="dialog">
         <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
            <div className="p-6 flex flex-col gap-5">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center text-white font-bold text-base shadow-md shrink-0">
                        {student.name?.charAt(0)}{student.surname?.charAt(0)}
                     </div>
                     <div>
                        <div className="font-bold text-base">{student.name} {student.surname}</div>
                        <div className="text-xs opacity-40">{student.fatherName}</div>
                     </div>
                  </div>
                  <button
                     onClick={onClose}
                     className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200 shrink-0"
                  >
                     <FiX size={15} />
                  </button>
               </div>
               <div className="bg-base-200/50 rounded-xl p-4 border border-base-200 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiUser size={11} /> Ad Soyad Ata adı</span>
                     <span className="text-sm font-semibold">{student.name} {student.surname} {student.fatherName}</span>
                  </div>
                  <div className="w-full h-px bg-base-200" />
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiPhone size={11} /> Telefon</span>
                     <span className="text-sm font-semibold">{student.phoneNumber || '—'}</span>
                  </div>
                  <div className="w-full h-px bg-base-200" />
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiMail size={11} /> Email</span>
                     <span className="text-sm font-semibold">{student.email || '—'}</span>
                  </div>
                  <div className="w-full h-px bg-base-200" />
                  <div className="flex flex-col gap-1">
                     <span className="text-xs opacity-40 flex items-center gap-1"><FiUsers size={11} /> Qrup</span>
                     <span className="text-sm font-semibold">{student.group?.groupNumber ?? '—'}</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="modal-backdrop" onClick={onClose} />
      </div>
   );
}

// ── Pagination ──────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
   if (totalPages <= 1) return null;
   return (
      <div className="flex items-center justify-center gap-2 mt-4">
         <button
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
         >
            <FiChevronLeft size={14} />
         </button>
         {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
               key={p}
               onClick={() => onChange(p)}
               className={`w-8 h-8 rounded-xl text-sm font-semibold transition-all duration-200 ${p === page
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                  : 'border border-base-200 opacity-50 hover:opacity-100 hover:bg-base-200'
                  }`}
            >
               {p}
            </button>
         ))}
         <button
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-base-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
         >
            <FiChevronRight size={14} />
         </button>
      </div>
   );
}

// ── Student Row ─────────────────────────────────────────
function StudentRow({ student, globalIndex, onInfo }) {
   const studentColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]', 'from-[#3B82F6] to-[#8B5CF6]',
   ];
   const colorClass = studentColors[globalIndex % studentColors.length];
   const initials = `${student.name?.charAt(0) || ''}${student.surname?.charAt(0) || ''}`.toUpperCase();

   return (
      <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-all duration-200">
         <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
            {initials || <FiUser size={16} />}
         </div>
         <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{student.name} {student.surname}</div>
            <div className="text-xs opacity-40 mt-0.5 truncate">{student.fatherName}</div>
         </div>
         <div className="hidden md:flex items-center gap-4 shrink-0">
            {student.email && (
               <div className="flex items-center gap-1.5 text-xs opacity-40">
                  <FiMail size={12} />{student.email}
               </div>
            )}
            {student.phoneNumber && (
               <div className="flex items-center gap-1.5 text-xs opacity-40">
                  <FiPhone size={12} />{student.phoneNumber}
               </div>
            )}
         </div>
         <button
            onClick={() => onInfo(student)}
            className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
         </button>
      </div>
   );
}

// ── Group Section (Qrupda tab) ──────────────────────────
function GroupSection({ group, index, onInfo }) {
   const [students, setStudents] = useState([]);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const [loading, setLoading] = useState(true);
   const [collapsed, setCollapsed] = useState(false);
   const pageSize = 10;

   const groupColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#3B82F6] to-[#8B5CF6]', 'from-[#A78BFA] to-[#60A5FA]',
   ];
   const colorClass = groupColors[index % groupColors.length];

   const fetchStudents = async (p = 1) => {
      try {
         setLoading(true);
         const res = await api.get(`/admin/getAssignedyStudents/${group._id}?page=${p}&pageSize=${pageSize}`);
         const data = res.data.data ?? [];
         setStudents(data);
         setTotal(res.data.total ?? 0);
         // Если пришло меньше pageSize и это первая страница — значит это все данные
         setTotalPages(data.length < pageSize && p === 1 ? 1 : res.data.totalPages ?? 1);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchStudents(page); }, [page]);

   const studentColors = [
      'from-[#8B5CF6] to-[#3B82F6]', 'from-[#3B82F6] to-[#60A5FA]',
      'from-[#8B5CF6] to-[#A78BFA]', 'from-[#6366F1] to-[#8B5CF6]',
      'from-[#A78BFA] to-[#60A5FA]', 'from-[#3B82F6] to-[#8B5CF6]',
   ];

   return (
      <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">

         {/* Group header */}
         <button
            onClick={() => setCollapsed(p => !p)}
            className="w-full px-5 py-4 flex items-center gap-4 border-b border-base-200 hover:bg-base-200/30 transition-all duration-200"
         >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0`}>
               {group.groupNumber}
            </div>
            <div className="flex-1 min-w-0 text-left">
               <div className="font-semibold text-sm">{group.profession}</div>
               <div className="text-xs opacity-30 font-mono tracking-widest mt-0.5">#{group.groupShifr}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <div className="flex items-center gap-1.5 text-xs opacity-40">
                  <FiUsers size={13} />
                  {total} şagird
               </div>
               <div className="w-7 h-7 rounded-lg border border-base-200 flex items-center justify-center opacity-40">
                  {collapsed ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
               </div>
            </div>
         </button>

         {/* Students list */}
         {!collapsed && (
            <div className="p-4 flex flex-col gap-2">
               {loading ? (
                  <div className="flex justify-center py-8">
                     <span className="loading loading-spinner loading-md" style={{ color: '#8B5CF6' }} />
                  </div>
               ) : students.length === 0 ? (
                  <div className="text-center opacity-30 py-6 text-sm">Bu qrupda şagird yoxdur</div>
               ) : (
                  <>
                     {students.map((student, i) => {
                        const colorIdx = ((page - 1) * pageSize + i) % studentColors.length;
                        const initials = `${student.name?.charAt(0) || ''}${student.surname?.charAt(0) || ''}`.toUpperCase();
                        return (
                           <div
                              key={student._id}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-base-200 hover:bg-base-200/30 hover:shadow-sm transition-all duration-200"
                           >
                              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${studentColors[colorIdx]} flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0`}>
                                 {initials || <FiUser size={12} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="font-semibold text-sm truncate">{student.name} {student.surname}</div>
                                 <div className="text-xs opacity-40 truncate">{student.fatherName}</div>
                              </div>
                              <div className="hidden md:flex items-center gap-4 shrink-0">
                                 {student.email && (
                                    <div className="flex items-center gap-1.5 text-xs opacity-40">
                                       <FiMail size={11} />{student.email}
                                    </div>
                                 )}
                                 {student.phoneNumber && (
                                    <div className="flex items-center gap-1.5 text-xs opacity-40">
                                       <FiPhone size={11} />{student.phoneNumber}
                                    </div>
                                 )}
                              </div>
                              <button
                                 onClick={() => onInfo(student)}
                                 className="p-2 rounded-xl border border-base-200 opacity-40 hover:opacity-70 hover:bg-base-200 transition-all duration-200 shrink-0"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                 </svg>
                              </button>
                           </div>
                        );
                     })}
                     <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
                  </>
               )}
            </div>
         )}
      </div>
   );
}

// ── Main Component ──────────────────────────────────────
function Students() {
   const [activeTab, setActiveTab] = useState('free');

   // Free students
   const [freeStudents, setFreeStudents] = useState([]);
   const [freeLoading, setFreeLoading] = useState(true);
   const [freePage, setFreePage] = useState(1);
   const [freeTotalPages, setFreeTotalPages] = useState(1);
   const [freeTotal, setFreeTotal] = useState(0);

   // Groups (for assigned tab)
   const [groups, setGroups] = useState([]);
   const [groupsLoading, setGroupsLoading] = useState(true);

   // Shared
   const [error, setError] = useState('');
   const [infoModal, setInfoModal] = useState(null);

   // Create modal
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      name: '', surname: '', fatherName: '',
      username: '', password: '', phoneNumber: '', email: '',
   });
   const [submitting, setSubmitting] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [modalError, setModalError] = useState('');

   const pageSize = 10;

   const fetchFreeStudents = async (p = 1) => {
      try {
         setFreeLoading(true);
         const res = await api.get(`/admin/getFreeStudents?page=${p}&pageSize=${pageSize}`);
         setFreeStudents(res.data.data ?? []);
         setFreeTotalPages(res.data.totalPages ?? 1);
         setFreeTotal(res.data.total ?? 0);
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
         setGroups((res.data.data ?? []).filter(g => (g.students?.length ?? 0) > 0));
      } catch (err) {
         setError(err.message || 'Yükləmə xətası');
      } finally {
         setGroupsLoading(false);
      }
   };

   useEffect(() => { fetchFreeStudents(freePage); }, [freePage]);
   useEffect(() => { fetchGroups(); }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name === 'phoneNumber') {
         setFormData(prev => ({ ...prev, phoneNumber: formatPhone(value) }));
      } else {
         setFormData(prev => ({ ...prev, [name]: value }));
      }
   };

   const handleAddStudent = async () => {
      const required = ['name', 'surname', 'fatherName', 'username', 'password', 'phoneNumber', 'email'];
      const missing = required.filter(field => !formData[field].trim());
      if (missing.length) {
         setModalError(`Zəhmət olmasa doldurun: ${missing.join(', ')}`);
         return;
      }
      try {
         setSubmitting(true);
         await api.post('/admin/createStudent', {
            ...formData,
            phoneNumber: phoneToRaw(formData.phoneNumber),
         });
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

   const isLoading = freeLoading && freeStudents.length === 0 && groupsLoading;

   if (isLoading) {
      return (
         <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <span className="loading loading-spinner loading-lg" style={{ color: '#8B5CF6' }} />
         </div>
      );
   }

   return (
      <div className="min-h-[calc(100vh-4rem)] px-6 py-8">

         {/* Page header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-lg font-bold">Şagirdlər</h1>
               <p className="text-xs opacity-40 mt-0.5">
                  {activeTab === 'free'
                     ? `${freeTotal} boş şagird · Səhifə ${freePage} / ${freeTotalPages}`
                     : `${groups.length} qrup`
                  }
               </p>
            </div>
            <button
               onClick={() => { setIsModalOpen(true); setShowPassword(false); setModalError(''); }}
               className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200"
            >
               <FiPlus size={16} />
               Şagird əlavə et
            </button>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 mb-6">
            {error && (
               <div role="alert" className="alert alert-error rounded-xl mb-4">
                  <span>{error}</span>
               </div>
            )}
            {[
               { key: 'free', label: 'Boş', icon: <FiUser size={14} />, count: freeTotal },
               { key: 'assigned', label: 'Qrupda', icon: <FiUsers size={14} />, count: groups.length },
            ].map(tab => (
               <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.key
                     ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md'
                     : 'bg-base-200/50 border border-base-200 opacity-60 hover:opacity-100'
                     }`}
               >
                  {tab.icon}
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-lg ${activeTab === tab.key ? 'bg-white/20' : 'bg-base-300'}`}>
                     {tab.count}
                  </span>
               </button>
            ))}
         </div>

         {/* ── FREE TAB ── */}
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
                        />
                     ))}
                  </div>
               )}
               <Pagination page={freePage} totalPages={freeTotalPages} onChange={p => setFreePage(p)} />
            </>
         )}

         {/* ── ASSIGNED TAB ── */}
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
                        />
                     ))}
                  </div>
               )}
            </>
         )}

         {/* Student info modal */}
         <StudentInfoModal student={infoModal} onClose={() => setInfoModal(null)} />

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
                              onClick={() => setShowPassword(p => !p)}
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
                                 if (!formData.phoneNumber) setFormData(prev => ({ ...prev, phoneNumber: '+994 ' }));
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
                        onClick={() => { setIsModalOpen(false); setModalError(''); setShowPassword(false); }}
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