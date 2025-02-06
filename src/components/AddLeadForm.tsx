import React, { useState } from 'react';
import { useLeadStore } from '../store/leadStore';
import { LeadType, LeadStatus } from '../types';

interface AddLeadFormProps {
  onClose: () => void;
}

export default function AddLeadForm({ onClose }: AddLeadFormProps) {
  const { addLead } = useLeadStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'tenant' as LeadType,
    description: '',
    status: 'new' as LeadStatus
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLead({
        ...formData,
        id: '', // Will be set by Firestore
        createdAt: new Date(),
        updatedAt: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-200">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Enter lead's name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-base font-medium text-gray-700 dark:text-gray-200">
          Phone *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-200">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="block text-base font-medium text-gray-700 dark:text-gray-200">
          Type *
        </label>
        <select
          id="type"
          name="type"
          required
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out appearance-none bg-white dark:bg-gray-700"
        >
          <option value="tenant">Tenant</option>
          <option value="buyer">Buyer</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-200">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          placeholder="Enter lead description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out resize-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="block text-base font-medium text-gray-700 dark:text-gray-200">
          Status *
        </label>
        <select
          id="status"
          name="status"
          required
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out appearance-none bg-white dark:bg-gray-700"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition duration-150 ease-in-out min-w-[120px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out min-w-[120px]"
        >
          Add Lead
        </button>
      </div>
    </form>
  );
}
