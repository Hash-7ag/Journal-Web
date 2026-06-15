import React, { useState, useEffect } from 'react';
import { capitalize } from '../../scripts/capitalize.js';
import api from '../../scripts/api.js';
import { FiUser, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

import ProfileCard from '../../components/profile/ProfileCard';
import EditProfileModal from '../../components/profile/EditProfileModal';

function Home() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/getMyProfile');
      setUserData(response.data);
    } catch (err) {
      setError(err.message || 'yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = () => {
    setEditForm({
      name: userData.name ?? '',
      surname: userData.surname ?? '',
      username: userData.username ?? '',
      email: userData.email ?? '',
      phone: formatPhone(userData.phone ?? ''),
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      setSubmitting(true);
      setEditError('');
      await api.patch('/admin/updateMyInfo', { ...editForm, phone: phoneToRaw(editForm.phone) });
      await fetchData();
      setEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Xəta baş verdi');
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
  if (!userData) return null;

  const initials = `${userData.name?.charAt(0) || ''}${userData.surname?.charAt(0) || ''}`.toUpperCase();

  const infoFields = [
    { icon: <FiUser size={16} />, label: 'Ad', value: userData.name },
    { icon: <FiUser size={16} />, label: 'Soyad', value: userData.surname },
    { icon: <FiPhone size={16} />, label: 'Telefon', value: userData.phone },
    { icon: <FiMail size={16} />, label: 'Email', value: userData.email },
    { icon: <FiShield size={16} />, label: 'Rol', value: capitalize(userData.role) },
  ];

  const editFields = [
    { name: 'name', label: 'Ad', type: 'text' },
    { name: 'surname', label: 'Soyad', type: 'text' },
    { name: 'username', label: 'İstifadəçi adı', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <ProfileCard
        userData={{ ...userData, roleLabel: capitalize(userData.role) }}
        initials={initials}
        infoFields={infoFields}
        onEdit={openEdit}
        onChangePassword={() => navigate('/changePassword')}
      />

      {editModal && (
        <EditProfileModal
          form={editForm}
          onFormChange={(name, val) => setEditForm((p) => ({ ...p, [name]: val }))}
          editFields={editFields}
          onSave={handleEditSubmit}
          onClose={() => setEditModal(false)}
          submitting={submitting}
          error={editError}
        />
      )}
    </div>
  );
}

export default Home;
