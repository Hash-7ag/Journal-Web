import React from 'react';
import { FiPhone } from 'react-icons/fi';

// Фиксированный +994 слева + поле на 9 цифр с автоформатом "XX XXX XX XX".
// value хранит ТОЛЬКО 9 цифр (или меньше при вводе). Наружу отдаёт чистые цифры.
function PhoneInput({ value = '', onChange, label = 'Telefon', error, onEnter }) {
  // форматируем 9 цифр в "XX XXX XX XX"
  const formatDisplay = (digits) => {
    const d = digits.slice(0, 9);
    const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    return parts.join(' ');
  };

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    onChange(digits);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold opacity-60 ml-1">{label}</label>}
      <div className="relative group flex items-stretch">
        {/* Фиксированный префикс +994 */}
        <div className="flex items-center gap-1.5 px-3.5 rounded-l-xl border-2 border-r-0 border-base-content/15 bg-base-200/60 text-sm font-bold text-base-content/60 group-focus-within:border-[#8B5CF6] transition-colors duration-200 shrink-0">
          <FiPhone size={14} className="opacity-50" />
          +994
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={formatDisplay(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="xx xxx xx xx"
          className={`flex-1 min-w-0 pl-3 pr-4 py-3 rounded-r-xl bg-base-100 border-2 border-base-content/15
                  shadow-[0_1px_2px_rgba(0,0,0,0.04)]
                  focus:outline-none focus:border-[#8B5CF6] focus:bg-base-100 focus:shadow-[0_4px_16px_-4px_rgba(139,92,246,0.25)]
                  hover:border-base-content/30
                  transition-all duration-200 text-sm font-medium tracking-wide
                  placeholder:font-normal placeholder:text-base-content/30 placeholder:tracking-normal
                  ${error ? 'border-red-400/50 focus:border-red-400' : ''}`}
        />
      </div>
      {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
    </div>
  );
}

export default PhoneInput;
