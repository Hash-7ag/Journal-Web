import React from 'react';

// Точки-полоски шагов (как в CreateGroupModal). total — сколько шагов, current — текущий (1-based)
function StepIndicator({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`rounded-full transition-all duration-300 ${
            n === current
              ? 'w-6 h-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]'
              : n < current
                ? 'w-2.5 h-2.5 bg-[#8B5CF6] opacity-60'
                : 'w-2.5 h-2.5 bg-base-300'
          }`}
        />
      ))}
    </div>
  );
}

export default StepIndicator;
