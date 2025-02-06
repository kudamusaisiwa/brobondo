import React, { useEffect } from 'react';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { Property } from '../../store/propertyStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from '../../constants/propertyTypes';
import { LeafletMap } from './LeafletMap';
import { useOwnerStore } from '../../store/ownerStore';
import { UserSelector } from '../users/UserSelector';

interface PropertyFormFieldsProps {
  control: Control<Property>;
  errors: FieldErrors<Property>;
  setValue: (name: any, value: any) => void;
}

export const PropertyFormFields: React.FC<PropertyFormFieldsProps> = ({
  control,
  errors,
  setValue
}) => {
  const { owners, initialize: initializeOwners } = useOwnerStore();
  const listingType = useWatch({ control, name: 'listingType' });
  const propertyType = useWatch({ control, name: 'type' });
  const selectedCategory = useWatch({ control, name: 'category' });

  const selectedPropertyConfig = PROPERTY_TYPES.find(type => type.value === propertyType);
  const filteredPropertyTypes = PROPERTY_TYPES.filter(type => type.category === selectedCategory);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const init = async () => {
      unsubscribe = await initializeOwners();
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Initialize form values based on listing type
  useEffect(() => {
    if (listingType === 'rental') {
      setValue('leaseTerms', {
        deposit: 0,
        durationMonths: 0,
        utilitiesIncluded: false
      });
      setValue('saleTerms', null);
    } else if (listingType === 'sale') {
      setValue('saleTerms', {
        priceNegotiable: false,
        ownershipType: 'freehold',
        titleDeedAvailable: false
      });
      setValue('leaseTerms', null);
    }
  }, [listingType, setValue]);

  const handleNumberChange = (onChange: (...event: any[]) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onChange(value);
  };

  const ownerOptions = owners.map(owner => ({
    value: owner.id,
    label: `${owner.firstName} ${owner.lastName}`
  }));

  return (
    <div className="space-y-8 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-6">
      {/* Basic Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                label="Property Title"
                placeholder="Enter property title"
                error={errors.title?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="ownerId"
            control={control}
            render={({ field }) => (
              <Select
                label="Property Owner"
                options={ownerOptions}
                error={errors.ownerId?.message}
                {...field}
              />
            )}
          />
        </div>
      </section>

      {/* Property Details */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label="Category"
                options={PROPERTY_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                error={errors.category?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Property Type"
                options={filteredPropertyTypes.map(type => ({ value: type.value, label: type.label }))}
                error={errors.type?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="listingType"
            control={control}
            render={({ field }) => (
              <Select
                label="Listing Type"
                options={['rental', 'sale']}
                error={errors.listingType?.message}
                {...field}
              />
            )}
          />
        </div>

        {/* Size Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <Controller
            name="features.area"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Built-up Area (m²)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter built-up area"
                value={value || ''}
                onChange={handleNumberChange(onChange)}
                error={errors.features?.area?.message}
              />
            )}
          />
          <Controller
            name="features.landSize"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Land Size (m²)"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter land size"
                value={value || ''}
                onChange={handleNumberChange(onChange)}
                error={errors.features?.landSize?.message}
              />
            )}
          />
        </div>
      </section>

      {/* Listing Type Specific Fields */}
      {listingType === 'rental' && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Rental Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="leaseTerms.deposit"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value, ...field } }) => (
                <Input
                  type="number"
                  label="Security Deposit"
                  placeholder="Enter deposit amount"
                  error={errors.leaseTerms?.deposit?.message}
                  value={value || 0}
                  onChange={handleNumberChange(onChange)}
                  {...field}
                />
              )}
            />
            <Controller
              name="leaseTerms.durationMonths"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value, ...field } }) => (
                <Input
                  type="number"
                  label="Lease Duration (months)"
                  placeholder="Enter lease duration"
                  error={errors.leaseTerms?.durationMonths?.message}
                  value={value || 0}
                  onChange={handleNumberChange(onChange)}
                  {...field}
                />
              )}
            />
            <Controller
              name="leaseTerms.utilitiesIncluded"
              control={control}
              defaultValue={false}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center mt-8">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Utilities Included</label>
                </div>
              )}
            />
          </div>
        </section>
      )}

      {listingType === 'sale' && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Sale Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="saleTerms.priceNegotiable"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Price Negotiable</label>
                </div>
              )}
            />
            <Controller
              name="saleTerms.ownershipType"
              control={control}
              render={({ field }) => (
                <Select
                  label="Ownership Type"
                  options={[
                    { value: 'freehold', label: 'Freehold' },
                    { value: 'leasehold', label: 'Leasehold' }
                  ]}
                  error={errors.saleTerms?.ownershipType?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="saleTerms.titleDeedAvailable"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Title Deed Available</label>
                </div>
              )}
            />
          </div>
        </section>
      )}

      {/* Mandate Holder - Only show for sale properties */}
      {listingType === 'sale' && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Mandate Holder</h3>
          <div className="grid grid-cols-1 gap-6">
            <Controller
              name="mandateHolderId"
              control={control}
              render={({ field }) => (
                <UserSelector
                  label="Select Mandate Holder"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.mandateHolderId?.message}
                  className="w-full"
                  placeholder="Select a mandate holder"
                />
              )}
            />
          </div>
        </section>
      )}

      {/* Property Features */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Property Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Features */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Basic Features</h4>
            <Controller
              name="features.furnished"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Furnished</label>
                </div>
              )}
            />
            <Controller
              name="features.parking"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Parking Available</label>
                </div>
              )}
            />
            <Controller
              name="features.garage"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Garage</label>
                </div>
              )}
            />
            <Controller
              name="features.garden"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Garden</label>
                </div>
              )}
            />
            <Controller
              name="features.pool"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Swimming Pool</label>
                </div>
              )}
            />
          </div>

          {/* Utilities */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Utilities</h4>
            <Controller
              name="features.borehole"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Borehole</label>
                </div>
              )}
            />
            <Controller
              name="features.waterTank"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Water Tank</label>
                </div>
              )}
            />
            <Controller
              name="features.solarPower"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Solar Power</label>
                </div>
              )}
            />
            <Controller
              name="features.generator"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Generator</label>
                </div>
              )}
            />
            <Controller
              name="features.internet"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Internet</label>
                </div>
              )}
            />
            <Controller
              name="features.airConditioning"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Air Conditioning</label>
                </div>
              )}
            />
          </div>

          {/* Security Features */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Security Features</h4>
            <Controller
              name="features.security"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Security Guard</label>
                </div>
              )}
            />
            <Controller
              name="features.electricFence"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Electric Fence</label>
                </div>
              )}
            />
            <Controller
              name="features.cctv"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">CCTV</label>
                </div>
              )}
            />
            <Controller
              name="features.staffQuarters"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary-600"
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    {...field}
                  />
                  <label className="ml-2 text-sm">Staff Quarters</label>
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {/* Price and Specifications */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Price and Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Controller
            name="price"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <Input
                type="number"
                label={listingType === 'rental' ? 'Monthly Rent' : 'Price'}
                placeholder={`Enter ${listingType === 'rental' ? 'rent' : 'price'}`}
                error={errors.price?.message}
                onChange={handleNumberChange(onChange)}
                {...field}
              />
            )}
          />
          {selectedPropertyConfig?.hasRooms && (
            <>
              <Controller
                name="features.bedrooms"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <Input
                    type="number"
                    label="Bedrooms"
                    placeholder="Number of bedrooms"
                    error={errors.features?.bedrooms?.message}
                    onChange={handleNumberChange(onChange)}
                    {...field}
                  />
                )}
              />
              <Controller
                name="features.bathrooms"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <Input
                    type="number"
                    label="Bathrooms"
                    placeholder="Number of bathrooms"
                    error={errors.features?.bathrooms?.message}
                    onChange={handleNumberChange(onChange)}
                    {...field}
                  />
                )}
              />
              <Controller
                name="features.area"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <Input
                    type="number"
                    label="Square Footage"
                    placeholder="Property area in square feet"
                    error={errors.features?.area?.message}
                    onChange={handleNumberChange(onChange)}
                    {...field}
                  />
                )}
              />
            </>
          )}
        </div>
      </section>

      {/* Status */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Property Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'rented', label: 'Rented' },
                  { value: 'sold', label: 'Sold' },
                  { value: 'maintenance', label: 'Under Maintenance' }
                ]}
                error={errors.status?.message}
                {...field}
              />
            )}
          />
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Location Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="location.address"
            control={control}
            render={({ field }) => (
              <Input
                label="Street Address"
                placeholder="Enter property address"
                error={errors.location?.address?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="location.city"
            control={control}
            render={({ field }) => (
              <Input
                label="City"
                placeholder="Enter city"
                error={errors.location?.city?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="location.state"
            control={control}
            render={({ field }) => (
              <Input
                label="State/Province"
                placeholder="Enter state or province"
                error={errors.location?.state?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="location.country"
            control={control}
            render={({ field }) => (
              <Input
                label="Country"
                placeholder="Enter country"
                error={errors.location?.country?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="location.postalCode"
            control={control}
            render={({ field }) => (
              <Input
                label="Postal Code"
                placeholder="Enter postal code"
                error={errors.location?.postalCode?.message}
                {...field}
              />
            )}
          />
        </div>
      </section>

      {/* Description */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Property Description</h3>
        <div className="space-y-6">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full h-32 px-3 py-2 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter property description"
                  {...field}
                />
                {errors.description?.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </section>

      {/* Location Map */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">Property Location</h3>
        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LeafletMap
                location={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>
    </div>
  );
};
