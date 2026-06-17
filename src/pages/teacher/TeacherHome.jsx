import React, { useState, useEffect } from 'react';
import { capitalize } from '../../scripts/capitalize.js';
import api from '../../scripts/api.js';
import { FiUser, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { formatPhone, phoneToRaw } from '../../scripts/usePhoneInput.js';

import ProfileCard from '../../components/profile/ProfileCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import VerifyEmailModal from '../../components/auth/VerifyEmailModal.jsx';

function TeacherHome() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ email: '', phoneNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [emailModal, setEmailModal] = useState(false);

  useEffect(() => {
    if (!userData) return;
    const verified = !!userData.googleId;
    const shown = sessionStorage.getItem('email_modal_shown');
    if (!verified && !shown) {
      setEmailModal(true);
      sessionStorage.setItem('email_modal_shown', '1');
    }
  }, [userData]);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/getMyProfile');
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
      await api.patch('/teacher/updateMyInfo', {
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
    { icon: <FiShield size={16} />, label: 'Rol', value: capitalize(userData.role) },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <ProfileCard
        userData={{ ...userData, roleLabel: capitalize(userData.role) }}
        initials={initials}
        infoFields={infoFields}
        onEdit={openEdit}
        onChangePassword={() => navigate('/changePassword')}
        onVerifyDone={fetchData}
      />

      {editModal && (
        <EditProfileModal
          form={editForm}
          onFormChange={(name, val) => setEditForm((p) => ({ ...p, [name]: val }))}
          editFields={[]}
          onSave={handleEditSubmit}
          onClose={() => setEditModal(false)}
          submitting={submitting}
          error={editError}
        />
      )}

      {emailModal && (
        <VerifyEmailModal
          role={userData.role}
          email={userData.email}
          onClose={() => setEmailModal(false)}
          onDone={fetchData}
        />
      )}
    </div>
  );
}

export default TeacherHome;
