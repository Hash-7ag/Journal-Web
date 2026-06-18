import React from 'react';

// Современный инпут: видимый фон, чёткий фокус (фиолетовая обводка + мягкое свечение),
// плавные тени, опциональная иконка слева, label, ошибка, кнопка справа (например показать пароль)
function FormInput({ label, icon, error, rightSlot, className = '', onEnter, ...props }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
    props.onKeyDown?.(e);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold opacity-60 ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-[#8B5CF6] transition-colors duration-200 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          onKeyDown={handleKeyDown}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} ${rightSlot ? 'pr-11' : 'pr-4'} py-3 rounded-xl
                  bg-base-100 border-2 border-base-200/80
                  shadow-[0_1px_2px_rgba(0,0,0,0.04)]
                  focus:outline-none focus:border-[#8B5CF6] focus:shadow-[0_4px_16px_-4px_rgba(139,92,246,0.25)]
                  hover:border-base-300
                  transition-all duration-200 text-sm font-medium
                  placeholder:font-normal placeholder:text-base-content/30
                  ${error ? 'border-red-300 focus:border-red-400' : ''}
                  ${className}`}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">{rightSlot}</div>}
      </div>
      {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
    </div>
  );
}

export default FormInput;
