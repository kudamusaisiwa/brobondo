import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface DateRangePickerProps {
  onSelect: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

export default function DateRangePicker({
  onSelect,
  onClose,
  initialStartDate,
  initialEndDate
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(
    initialStartDate ? formatDate(initialStartDate) : formatDate(new Date())
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? formatDate(initialEndDate) : formatDate(new Date())
  );
  const [error, setError] = useState<string | null>(null);

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Start date must be before or equal to end date');
      return;
    }

    onSelect(start, end);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <Calendar className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Select Date Range</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
                className="modern-input mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                className="modern-input mt-1"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}