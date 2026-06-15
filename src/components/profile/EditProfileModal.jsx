import React from 'react';
import { FiEdit2, FiX, FiCheck, FiPhone } from 'react-icons/fi';
import { formatPhone } from '../../scripts/usePhoneInput.js';

function EditProfileModal({ form, onFormChange, editFields, onSave, onClose, submitting, error }) {
  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-lg overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiEdit2 size={15} />
              </div>
              <div>
                <h3 className="text-base font-bold">Profili Redaktə Et</h3>
                <p className="text-xs opacity-40">Məlumatları yeniləyin</p>
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
            {editFields?.length > 0 &&
              editFields.map(({ name, label, type }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs font-medium opacity-50 ml-1">{label}</label>
                  <input
                    type={type}
                    value={form[name] ?? ''}
                    onChange={(e) => onFormChange(name, e.target.value)}
                    className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                  />
                </div>
              ))}
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-medium opacity-50 ml-1">Telefon</label>
              <div className="relative">
                <FiPhone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input
                  type="tel"
                  value={form.phone || '+994 '}
                  onChange={(e) => onFormChange('phone', formatPhone(e.target.value))}
                  onFocus={() => {
                    if (!form.phone) onFormChange('phone', '+994 ');
                  }}
                  placeholder="+994 xx xxx xx xx"
                  className="input w-full pl-8 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>

          {error && <span className="text-red-400 text-xs text-center">{error}</span>}

          <div className="flex gap-3">
            <button
              onClick={onSave}
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
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

export default EditProfileModal;
