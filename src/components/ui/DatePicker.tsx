import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { LucideIcon } from 'lucide-react';

interface DatePickerFieldProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  icon: LucideIcon;
  label: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export default function DatePickerField({
  value,
  onChange,
  icon: Icon,
  label,
  placeholder = "Select or type date",
  minDate,
  maxDate
}: DatePickerFieldProps) {
  const [dateInput, setDateInput] = useState('');
  const [error, setError] = useState('');

  const handleDateChange = (date: Date | null) => {
    setError('');
    onChange(date);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDateInput(input);

    // Clear if empty
    if (!input) {
      setError('');
      onChange(null);
      return;
    }

    // Try parsing the date
    const parsedDate = new Date(input);
    if (isNaN(parsedDate.getTime())) {
      setError('Invalid date format');
      return;
    }

    // Check min date
    if (minDate && parsedDate < minDate) {
      setError(`Date cannot be before ${minDate.toLocaleDateString()}`);
      return;
    }

    // Check max date
    if (maxDate && parsedDate > maxDate) {
      setError(`Date cannot be after ${maxDate.toLocaleDateString()}`);
      return;
    }

    setError('');
    onChange(parsedDate);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </div>
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
      <div className="relative">
        <ReactDatePicker
          selected={value}
          onChange={handleDateChange}
          className={`w-full p-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-text
            ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          placeholderText={placeholder}
          dateFormat="yyyy-MM-dd"
          minDate={minDate}
          maxDate={maxDate}
          isClearable
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          onChangeRaw={(e) => handleInputChange(e)}
        />
        <div className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-400 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
