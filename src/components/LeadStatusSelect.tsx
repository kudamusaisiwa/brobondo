import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { LeadStatus } from '../types';
import { useLeadStore } from '../store/leadStore';

interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: LeadStatus;
}

const statusOptions: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'closed',
  'lost'
];

const statusColors = {
  new: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
  contacted: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
  qualified: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
  proposal: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
  negotiation: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
  closed: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300',
  lost: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
};

export default function LeadStatusSelect({ leadId, currentStatus }: LeadStatusSelectProps) {
  const { updateLead } = useLeadStore();
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left}px`,
      });
    }
  }, [isOpen]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    try {
      setUpdating(true);
      await updateLead(leadId, {
        status: newStatus,
        statusHistory: [{
          status: newStatus,
          changedAt: new Date()
        }]
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating lead status:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="inline-block text-left">
      <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} style={{ display: isOpen ? 'block' : 'none' }}></div>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
        className="inline-flex items-center justify-between px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div 
          className="fixed z-50 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="listbox"
          style={{
            ...dropdownStyle,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          <div className="py-1">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`
                  ${status === currentStatus ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  flex items-center w-full px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700
                `}
                onClick={() => handleStatusChange(status)}
              >
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
