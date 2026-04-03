'use client';

import { useState, useRef, useEffect } from 'react';

const Autocomplete = ({
  options,
  value,
  onChange,
  placeholder = 'Пошук...',
  labelKey = 'label',
  valueKey = 'id',
  searchKeys = ['label'],
  displayFormat = (option) => option[labelKey],
  emptyMessage = 'Не знайдено',
  className = '',
  inputClassName = '',
  dropdownClassName = '',
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Закрывать dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedLabel = () => {
    if (!value) return '';
    const option = options.find((o) => o[valueKey] === value);
    return option ? displayFormat(option) : '';
  };

  const getFilteredOptions = () => {
    if (!search) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter((o) =>
      searchKeys.some((key) =>
        String(o[key]).toLowerCase().includes(lowerSearch)
      )
    );
  };

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearch('');
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearch('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : getSelectedLabel()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={value ? '' : placeholder}
          className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          className="absolute inset-y-0 right-0 px-2 text-slate-400 hover:text-slate-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto ${dropdownClassName}`}
        >
          {getFilteredOptions().length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</div>
          ) : (
            getFilteredOptions().map((option) => (
              <button
                key={option[valueKey]}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100"
              >
                {displayFormat(option)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
