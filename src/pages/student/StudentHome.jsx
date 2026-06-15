import React, { useState, useEffect } from 'react';
import api from '../../scripts/api.js';
import { FiUser, FiPhone, FiMail, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

import ProfileCard from '../../components/profile/ProfileCard';
import EditProfileModal from '../../components/profile/EditProfileModal';

function StudentHome() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phoneNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/getMyProfile');
      setUserData(response.data);
    } catch (err) {
      setError(err.message || 'Yükləmə xətası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = () => {
    setEditForm({
      email: userData.email ?? '',
      phoneNumber: formatPhone(userData.phoneNumber ?? ''),
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      setSubmitting(true);
      setEditError('');
      await api.patch('/student/updateMyInfo', {
        email: editForm.email,
        phoneNumber: phoneToRaw(editForm.phoneNumber),
      });
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
    { icon: <FiUser size={16} />, label: 'Ata adı', value: userData.fatherName },
    { icon: <FiPhone size={16} />, label: 'Telefon', value: userData.phoneNumber },
    { icon: <FiMail size={16} />, label: 'Email', value: userData.email },
    { icon: <FiUsers size={16} />, label: 'Qrup', value: userData.group?.groupNumber ?? '—' },
  ];

  // Студент может редактировать только email и phoneNumber
  const editFields = [];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <ProfileCard
        userData={{ ...userData, roleLabel: 'Şagird' }}
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

export default StudentHome;
