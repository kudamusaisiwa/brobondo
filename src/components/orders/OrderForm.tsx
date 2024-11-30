import React from 'react';
import { Calendar } from 'lucide-react';

// Add to existing form
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Order Date
  </label>
  <div className="relative mt-1">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    <input
      type="date"
      value={orderDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
      onChange={(e) => setOrderDate(new Date(e.target.value))}
      max={new Date().toISOString().split('T')[0]}
      className="modern-input pl-10"
    />
  </div>
</div>