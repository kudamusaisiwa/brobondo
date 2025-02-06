import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LeadType, LeadStatus } from '../types';

export default function CustomerForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'tenant' as LeadType,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        status: 'new' as LeadStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: 'website'
      });
      
      setFormData({
        name: '',
        phone: '',
        email: '',
        type: 'tenant',
        description: ''
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const propertyDetails = searchParams.get('propertyDetails');
    if (propertyDetails) {
      setFormData(prev => ({
        ...prev,
        description: decodeURIComponent(propertyDetails)
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Logo width={180} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Let us help you find your perfect property
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-xl">
            <p className="text-green-800 dark:text-green-200 text-center">
              Thank you for your interest! We'll be in touch soon.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 rounded-xl">
            <p className="text-red-800 dark:text-red-200 text-center">
              Sorry, there was an error submitting your form. Please try again.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              I'm looking to *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out appearance-none bg-white dark:bg-gray-700"
            >
              <option value="tenant">Rent a Property</option>
              <option value="buyer">Buy a Property</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Tell us what you're looking for *
            </label>
            <textarea
              id="description"
              name="description"
              required
              placeholder="Describe your ideal property (location, size, budget, etc.)"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out resize-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
