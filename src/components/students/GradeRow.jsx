import React from 'react';

function GradeRow({ label, value, max, color }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-base-200 last:border-0">
      <span className="text-xs opacity-50">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 rounded-full bg-base-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]"
            style={{ width: value != null ? `${(value / max) * 100}%` : '0%' }}
          />
        </div>
        <span className={`text-sm font-bold min-w-[48px] text-right ${value != null ? color : 'opacity-20'}`}>
          {value != null ? `${value}/${max}` : `—/${max}`}
        </span>
      </div>
    </div>
  );
}

export default GradeRow;
