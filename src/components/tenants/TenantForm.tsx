import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTenantStore } from '../../store/tenantStore';

const tenantFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

interface TenantFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TenantFormData>;
}

export function TenantForm({ onSubmit, onCancel, initialData }: TenantFormProps) {
  const { addTenant } = useTenantStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: initialData,
  });

  const onSubmitForm = async (data: TenantFormData) => {
    try {
      await addTenant({
        ...data,
        status: 'active',
        rentedProperties: [],
      });
      onSubmit?.();
    } catch (error) {
      console.error('Error adding tenant:', error);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-6">
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
        {/* Personal Information */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="firstName"
              label="First Name"
              type="text"
              placeholder="Enter first name"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              id="lastName"
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              id="phone"
              label="Phone"
              type="tel"
              placeholder="Enter phone number"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>
        </section>

        {/* Address Information */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Address Information</h3>
          <div className="grid grid-cols-1 gap-6">
            <Input
              id="address"
              label="Address"
              type="text"
              placeholder="Enter physical address"
              {...register('address')}
              error={errors.address?.message}
            />
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Tenant...' : 'Add Tenant'}
          </Button>
        </div>
      </form>
    </div>
  );
}
