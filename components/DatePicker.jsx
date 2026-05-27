'use client';

import ReactDatePicker from 'react-datepicker';
import { uk } from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';

const parseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const [y, m, d] = val.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(val);
};

const DatePicker = ({ label, value, onChange, className = '' }) => {
  const dateValue = parseDate(value);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      )}
      <ReactDatePicker
        selected={dateValue}
        onChange={(date) => onChange(date)}
        locale={uk}
        dateFormat="dd.MM.yyyy"
        placeholderText="Оберіть дату"
        popperPlacement="bottom-start"
        className={`w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground ${className}`}
      />
    </div>
  );
};

export default DatePicker;
