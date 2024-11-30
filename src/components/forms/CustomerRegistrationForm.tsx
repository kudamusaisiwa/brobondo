import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, CreditCard, MapPin, Globe, Building, Truck } from 'lucide-react';
import { useCustomerStore } from '../../store/customerStore';
import Toast from '../ui/Toast';

// Validation schema
const schema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .regex(/^[A-Za-z\s]+$/, 'First name must contain only letters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .regex(/^[A-Za-z\s]+$/, 'Last name must contain only letters'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^\+?[0-9]+$/, 'Phone number must contain only numbers')
    .min(10, 'Phone number must be at least 10 digits'),
  passportNumber: z.string()
    .regex(/^[A-Z0-9]+$/, 'Passport number must be alphanumeric')
    .min(6, 'Passport number must be at least 6 characters')
    .max(15, 'Passport number cannot exceed 15 characters'),
  streetAddress: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address cannot exceed 100 characters'),
  postalCode: z.string()
    .regex(/^[A-Z0-9]+$/i, 'Postal code must be alphanumeric')
    .min(4, 'Postal code must be at least 4 characters')
    .max(10, 'Postal code cannot exceed 10 characters'),
  country: z.string()
    .min(2, 'Please select a country'),
  alternativeAddress: z.string()
    .max(100, 'Alternative address cannot exceed 100 characters')
    .optional(),
  desiredCompanyNames: z.string()
    .max(200, 'Company names cannot exceed 200 characters')
    .optional()
});

type FormData = z.infer<typeof schema>;

const countries = [
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'BW', name: 'Botswana' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' }
];

export default function CustomerRegistrationForm() {
  const { addCustomer } = useCustomerStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: 'ZW'
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addCustomer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.streetAddress,
        passportNumber: data.passportNumber,
        homeAddress: data.alternativeAddress,
        companyNames: data.desiredCompanyNames ? [data.desiredCompanyNames] : undefined,
        cardDeliveryAddress: data.alternativeAddress || data.streetAddress
      });

      setToastMessage('Customer registered successfully');
      setToastType('success');
      reset(); // Reset form after successful submission
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to register customer');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name *
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    {...register('firstName')}
                    className={`modern-input pl-10 ${errors.firstName ? 'border-red-300' : ''}`}
                    placeholder="Enter first name"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name *
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    {...register('lastName')}
                    className={`modern-input pl-10 ${errors.lastName ? 'border-red-300' : ''}`}
                    placeholder="Enter last name"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`modern-input pl-10 ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="Enter email address"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className={`modern-input pl-10 ${errors.phone ? 'border-red-300' : ''}`}
                  placeholder="+263 7X XXX XXXX"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Passport Number *
              </label>
              <div className="mt-1 relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="passportNumber"
                  {...register('passportNumber')}
                  className={`modern-input pl-10 ${errors.passportNumber ? 'border-red-300' : ''}`}
                  placeholder="Enter passport number"
                  aria-invalid={errors.passportNumber ? 'true' : 'false'}
                />
              </div>
              {errors.passportNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.passportNumber.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Address Details
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Street Address *
              </label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="streetAddress"
                  {...register('streetAddress')}
                  className={`modern-input pl-10 ${errors.streetAddress ? 'border-red-300' : ''}`}
                  placeholder="Enter street address"
                  aria-invalid={errors.streetAddress ? 'true' : 'false'}
                />
              </div>
              {errors.streetAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.streetAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Postal/ZIP Code *
                </label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="postalCode"
                    {...register('postalCode')}
                    className={`modern-input pl-10 ${errors.postalCode ? 'border-red-300' : ''}`}
                    placeholder="Enter postal code"
                    aria-invalid={errors.postalCode ? 'true' : 'false'}
                  />
                </div>
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country *
                </label>
                <div className="mt-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="country"
                    {...register('country')}
                    className={`modern-select pl-10 ${errors.country ? 'border-red-300' : ''}`}
                    aria-invalid={errors.country ? 'true' : 'false'}
                  >
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="alternativeAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Alternative Delivery Address
              </label>
              <div className="mt-1 relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="alternativeAddress"
                  {...register('alternativeAddress')}
                  className={`modern-input pl-10 ${errors.alternativeAddress ? 'border-red-300' : ''}`}
                  placeholder="Enter alternative delivery address (optional)"
                  aria-invalid={errors.alternativeAddress ? 'true' : 'false'}
                />
              </div>
              {errors.alternativeAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.alternativeAddress.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="desiredCompanyNames" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Desired Company Names
              </label>
              <div className="mt-1 relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="desiredCompanyNames"
                  {...register('desiredCompanyNames')}
                  className={`modern-textarea pl-10 ${errors.desiredCompanyNames ? 'border-red-300' : ''}`}
                  placeholder="Enter desired company names (optional)"
                  rows={3}
                  aria-invalid={errors.desiredCompanyNames ? 'true' : 'false'}
                />
              </div>
              {errors.desiredCompanyNames && (
                <p className="mt-1 text-sm text-red-600">{errors.desiredCompanyNames.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
          >
            {isSubmitting ? 'Registering...' : 'Register Customer'}
          </button>
        </div>
      </form>

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