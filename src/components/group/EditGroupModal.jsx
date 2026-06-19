import React from 'react';
import { FiX, FiEdit2, FiCheck, FiBriefcase, FiHash } from 'react-icons/fi';
import FormInput from '../ui/FormInput';
import SemestrPicker from './SemestrPicker';

function EditGroupModal({ group, form, onFormChange, onSave, onClose, submitting, error }) {
  if (!group) return null;
  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-md overflow-hidden max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] mx-auto">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
                <FiEdit2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold">Qrupu Redaktə Et</h3>
                <p className="text-xs opacity-40 mt-0.5">{group.profession}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <FormInput
              label="İxtisas"
              icon={<FiBriefcase size={15} />}
              value={form.profession}
              onChange={(e) => onFormChange('profession', e.target.value)}
              onEnter={onSave}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Qrup nömrəsi"
                type="number"
                icon={<FiHash size={15} />}
                value={form.groupNumber}
                onChange={(e) => onFormChange('groupNumber', e.target.value)}
                onEnter={onSave}
              />
              <FormInput
                label="Şifrə"
                type="number"
                icon={<FiHash size={15} />}
                value={form.groupShifr}
                onChange={(e) => onFormChange('groupShifr', e.target.value)}
                onEnter={onSave}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold opacity-60 ml-1">Semestr</label>
              <SemestrPicker value={form.semestr} onChange={(v) => onFormChange('semestr', v)} />
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

export default EditGroupModal;
