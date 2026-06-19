import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiPlus, FiUser, FiMail, FiPhone } from 'react-icons/fi';

import Pagination from '../../components/ui/Pagination.jsx';
import CreateParentModal from '../../components/parents/CreateParentModal';
import EditParentModal from '../../components/parents/EditParentModal';

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

  // create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // edit
  const [editModal, setEditModal] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchParents = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/getParents?page=${p}&pageSize=${pageSize}`);
      setParents(res.data.data ?? []);
      setTotalPages(res.data.totalPage ?? res.data.totalPages ?? 1);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents(page);
  }, [page]);

  const handleAddParent = async (payload) => {
    try {
      setSubmitting(true);
      setModalError('');
      await api.post('/admin/createParent', payload);
      setIsModalOpen(false);
      fetchParents(page);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditParent = async (payload) => {
    try {
      setEditSubmitting(true);
      setEditError('');
      await api.patch(`/admin/updateParentInfo/${editModal._id}`, payload);
      await fetchParents(page);
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setEditSubmitting(false);
    }
  };

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
              onEdit={setEditModal}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />

      {editModal && (
        <EditParentModal
          parent={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleEditParent}
          submitting={editSubmitting}
          error={editError}
        />
      )}

      {isModalOpen && (
        <CreateParentModal
          onClose={() => {
            setIsModalOpen(false);
            setModalError('');
          }}
          onSubmit={handleAddParent}
          submitting={submitting}
          error={modalError}
        />
      )}
    </div>
  );
}

export default Parents;
