import React, { useState } from 'react';
import { FiUser, FiX, FiCheck, FiEdit2 } from 'react-icons/fi';
import FormInput from '../ui/FormInput';
import PhoneInput from '../ui/PhoneInput';
import ResetPasswordBlock from '../ui/ResetPasswordBlock';

// student — редактируемый ученик; onSave получает payload; submitting/error — состояние
function EditStudentModal({ student, onClose, onSave, submitting, error }) {
  const [form, setForm] = useState({
    name: student.name ?? '',
    surname: student.surname ?? '',
    fatherName: student.fatherName ?? '',
    username: student.username ?? '',
    // последние 9 цифр номера (PhoneInput хранит 9 цифр)
    phone: (student.phoneNumber ?? '').replace(/\D/g, '').slice(-9),
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    onSave({
      name: form.name.trim(),
      surname: form.surname.trim(),
      fatherName: form.fatherName.trim(),
      username: form.username.trim(),
      // бэк ждёт phone (changeInfo берёт slice(-9) и делает +994); шлём 9 цифр
      phone: form.phone,
    });
  };

  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiEdit2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold">Şagirdi Redaktə Et</h3>
                <p className="text-xs opacity-40 mt-0.5">
                  {student.name} {student.surname}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Ad"
              icon={<FiUser size={15} />}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              onEnter={handleSave}
            />
            <FormInput
              label="Soyad"
              icon={<FiUser size={15} />}
              value={form.surname}
              onChange={(e) => set('surname', e.target.value)}
              onEnter={handleSave}
            />
            <FormInput
              label="Ata adı"
              icon={<FiUser size={15} />}
              value={form.fatherName}
              onChange={(e) => set('fatherName', e.target.value)}
              onEnter={handleSave}
            />
            <FormInput
              label="İstifadəçi adı"
              icon={<FiUser size={15} />}
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              onEnter={handleSave}
            />
            <div className="col-span-2">
              <PhoneInput value={form.phone} onChange={(v) => set('phone', v)} onEnter={handleSave} />
            </div>
          </div>

          {error && <span className="text-red-400 text-xs text-center">{error}</span>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <FiCheck size={14} /> Yadda saxla
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-base-200 bg-base-200/50 text-sm font-semibold hover:bg-base-200 transition-all duration-200"
            >
              Ləğv et
            </button>
          </div>

          <ResetPasswordBlock id={student._id} role="student" />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default EditStudentModal;
