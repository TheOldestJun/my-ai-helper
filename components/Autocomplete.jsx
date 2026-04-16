'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Autocomplete - Компонент автозаполнения с возможностью создания новых элементов
 * Используется в OrderCreationForm и MenuPlanner для выбора товаров/страв
 * 
 * Функционал:
 * - Поиск по опциям
 * - Выбор элемента из списка
 * - Создание нового элемента на лету (если creatable=true)
 * - Отображение пустого сообщения при отсутствии результатов
 * - Фильтрация по нескольким полям (searchKeys)
 * 
 * Props:
 * - options: Массив опций для выбора
 * - value: Текущее выбранное значение
 * - onChange: Callback при выборе элемента
 * - onCreate: Callback при создании нового элемента
 * - creatable: Разрешить создание новых элементов
 * - createLabel: Текст для кнопки создания
 * - placeholder: Текст в поле ввода
 * - labelKey: Ключ для отображения названия
 * - valueKey: Ключ для значения
 * - searchKeys: Ключи для поиска
 * - displayFormat: Функция форматирования отображения
 * - emptyMessage: Сообщение при отсутствии результатов
 */
const Autocomplete = ({
  options,
  value,
  onChange,
  onCreate,
  creatable = false,
  createLabel = (search) => `Створити "${search}"`,
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

  const canCreate = creatable && search && getFilteredOptions().length === 0;

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    if (onCreate) {
      onCreate(search.trim());
    }
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
          className={`w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground ${inputClassName}`}
        />
        <button
          type="button"
          onClick={toggleDropdown}
          className="absolute inset-y-0 right-0 px-2 text-muted-foreground hover:text-foreground"
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
          className={`absolute z-10 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg max-h-48 overflow-auto ${dropdownClassName}`}
        >
          {getFilteredOptions().length === 0 && !canCreate ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            <>
              {getFilteredOptions().map((option) => (
                <button
                  key={option[valueKey]}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted"
                >
                  {displayFormat(option)}
                </button>
              ))}
              {canCreate && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full px-3 py-2 text-left text-sm text-primary font-medium hover:bg-primary/10 focus:bg-primary/10 border-t border-border"
                >
                  {createLabel(search)}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;