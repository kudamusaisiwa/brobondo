import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: MessageFilters) => void;
}

export interface MessageFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  messageType?: 'text' | 'image' | 'file' | 'all';
  direction?: 'incoming' | 'outgoing' | 'all';
}

export const MessageSearch: React.FC<MessageSearchProps> = ({ onSearch, onFilter }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({
    messageType: 'all',
    direction: 'all'
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleFilterChange = (newFilters: Partial<MessageFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      handleFilterChange({
        dateRange: {
          start: new Date(start),
          end: new Date(end)
        }
      });
    }
  };

  return (
    <div className="border-b dark:border-gray-700 p-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 text-sm placeholder:text-gray-500 
                     dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${showFilters ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <label className="text-sm font-medium">Date Range</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
              className="w-full px-3 py-1 text-sm rounded border border-gray-300 
                       dark:border-gray-600 bg-white dark:bg-gray-800"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
              className="w-full px-3 py-1 text-sm rounded border border-gray-300 
                       dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Message Type</label>
              <select
                value={filters.messageType}
                onChange={(e) => handleFilterChange({ messageType: e.target.value as any })}
                className="w-full px-3 py-1 text-sm rounded border border-gray-300 
                         dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="image">Images</option>
                <option value="file">Files</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Direction</label>
              <select
                value={filters.direction}
                onChange={(e) => handleFilterChange({ direction: e.target.value as any })}
                className="w-full px-3 py-1 text-sm rounded border border-gray-300 
                         dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                <option value="all">All Messages</option>
                <option value="incoming">Received</option>
                <option value="outgoing">Sent</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
