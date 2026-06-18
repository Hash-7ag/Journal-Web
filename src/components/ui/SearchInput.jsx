import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

function SearchInput({ value, onChange, placeholder = 'Axtar...', loading }) {
  return (
    <div className="relative w-full group">
      <div className="relative flex items-center">
        {/* Иконка в цветном кружке слева */}
        <div className="absolute left-2 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-sm z-10">
          <FiSearch size={15} />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="relative w-full pl-12 pr-12 py-3 rounded-2xl border-2 border-base-200 bg-base-100 shadow-sm focus:outline-none focus:border-[#8B5CF6] focus:shadow-md transition-all duration-200 text-sm font-medium placeholder:font-normal placeholder:opacity-40"
        />

        {/* Справа: спиннер или очистка */}
        <div className="absolute right-3 flex items-center z-10">
          {loading ? (
            <span className="loading loading-spinner loading-sm text-[#8B5CF6]" />
          ) : value ? (
            <button
              onClick={() => onChange('')}
              className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-base-200 transition-all duration-200"
            >
              <FiX size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SearchInput;
