import React, { useState } from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';

function EditTitleModal({ titleDoc, dateStr, onSave, onClose, saving, error }) {
  const [form, setForm] = useState({
    title: titleDoc.title ?? '',
    hour: String(titleDoc.hour ?? '1'),
    type: titleDoc.type ?? 'N',
  });

  const updateHour = (delta) => {
    const cur = Number(form.hour) || 0;
    const next = Math.min(30, Math.max(1, cur + delta));
    setForm((p) => ({ ...p, hour: String(next) }));
  };

  return (
    <div className="modal modal-open z-50" role="dialog">
      <div className="modal-box rounded-2xl border border-base-200 shadow-xl p-0 max-w-sm overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Mövzunu redaktə et</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-base-200 flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={15} />
            </button>
          </div>

          {/* Дата — readonly, сверху */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-base-200/50 border border-base-200 text-sm opacity-70">
            <FiCalendar size={14} /> {dateStr}
          </div>

          <div className="flex flex-col gap-4">
            {/* Название */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium opacity-50 ml-1">Mövzu</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="input w-full pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm"
                placeholder="Dərsin mövzusu"
              />
            </div>

            {/* Продолжительность */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium opacity-50 ml-1">Dərs müddəti (saat)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateHour(-1)}
                  className="w-11 h-11 rounded-xl border border-base-200 bg-base-200/50 flex items-center justify-center text-lg font-bold opacity-70 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.hour}
                  onChange={(e) => {
                    let v = e.target.value;
                    if (v === '') {
                      setForm((p) => ({ ...p, hour: '' }));
                      return;
                    }
                    let n = Number(v);
                    if (n < 1) n = 1;
                    if (n > 30) n = 30;
                    setForm((p) => ({ ...p, hour: String(n) }));
                  }}
                  className="input flex-1 text-center pl-4 pr-4 py-2.5 rounded-xl border border-base-200 bg-base-200/50 focus:outline-none focus:border-[#8B5CF6] transition-all duration-200 text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => updateHour(1)}
                  className="w-11 h-11 rounded-xl border border-base-200 bg-base-200/50 flex items-center justify-center text-lg font-bold opacity-70 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Тип */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium opacity-50 ml-1">Dərs tipi</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: 'N' }))}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${form.type === 'N' ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 text-[#8B5CF6] shadow-sm' : 'border-base-200 opacity-60 hover:opacity-100 hover:bg-base-200/40'}`}
                >
                  Nəzəri
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: 'P' }))}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${form.type === 'P' ? 'border-[#8B5CF6]/40 bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 text-[#8B5CF6] shadow-sm' : 'border-base-200 opacity-60 hover:opacity-100 hover:bg-base-200/40'}`}
                >
                  Praktiki
                </button>
              </div>
            </div>
          </div>

          {error && <span className="text-red-400 text-xs text-center">{error}</span>}

          <div className="flex gap-3">
            <button
              onClick={() => onSave(form)}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-60"
            >
              {saving ? <span className="loading loading-spinner loading-xs" /> : 'Yadda saxla'}
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

export default EditTitleModal;
