import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDeliveryStore } from '../../store/deliveryStore';
import type { Order, DeliverySchedule } from '../../types';
import DeliveryModal from './DeliveryModal';
import Toast from '../ui/Toast';

interface DeliveryCalendarProps {
  order: Order;
}

export default function DeliveryCalendar({ order }: DeliveryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { getSchedulesByOrder } = useDeliveryStore();
  const schedules = getSchedulesByOrder(order.id);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleSuccess = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const handleError = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  const getDeliveryForDate = (date: Date) => {
    return schedules.find(schedule => 
      schedule.scheduledDate.toDateString() === date.toDateString()
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const delivery = getDeliveryForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-24 p-2 border border-gray-200 relative hover:bg-blue-50 cursor-pointer
            ${isToday ? 'bg-blue-50' : ''}`}
        >
          <span className="text-sm text-gray-700">
            {day}
          </span>
          {delivery && (
            <div className={`mt-1 p-1 text-xs rounded-md ${
              delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
              delivery.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {delivery.quantity} units
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Delivery Calendar</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {renderCalendar()}
      </div>

      {selectedDate && (
        <DeliveryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          order={order}
          selectedDate={selectedDate}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}