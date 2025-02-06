import React, { useEffect, useState } from 'react';
import RentalScheduleSetupModal from '../components/rentals/RentalScheduleSetupModal';
import RentalPaymentModal from '../components/rentals/RentalPaymentModal';
import RentalStatementModal from '../components/rentals/RentalStatementModal';
import { Home, Search, Plus, AlertCircle, Calendar, DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useRentalStore, RentalSchedule } from '../store/rentalStore';
import { useTenantStore } from '../store/tenantStore';

export default function Rentals() {
  const { schedules, draftSchedules, properties, loading: rentalLoading, initialize, updateSchedule, createSchedule } = useRentalStore();
  const { tenants, loading: tenantLoading, initialize: initializeTenants } = useTenantStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<{
    schedule: RentalSchedule;
    property: Property;
    tenant: Tenant;
  } | null>(null);

  const [selectedPaymentSchedule, setSelectedPaymentSchedule] = useState<RentalSchedule | null>(null);
  const [statementSchedule, setStatementSchedule] = useState<RentalSchedule | null>(null);

  useEffect(() => {
    console.log('Rentals page - Current state:', {
      propertiesCount: properties.length,
      schedulesCount: schedules.length,
      draftSchedulesCount: draftSchedules.length,
      tenantsCount: tenants.length,
      properties: properties.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        rentedTo: p.rentedTo
      })),
      tenants: tenants.map(t => ({
        id: t.id,
        name: t.firstName + ' ' + t.lastName,
        rentedProperties: t.rentedProperties
      })),
      schedules: schedules,
      draftSchedules: draftSchedules
    });
  }, [properties, schedules, draftSchedules, tenants]);

  useEffect(() => {
    // Initialize both stores
    const initializeStores = async () => {
      const unsubscribe = initialize();
      await initializeTenants();
      return unsubscribe;
    };

    const unsubPromise = initializeStores();
    
    return () => {
      unsubPromise.then(unsub => unsub());
    };
  }, [initialize, initializeTenants]);

  const getStatusColor = (schedule: RentalSchedule) => {
    const now = new Date();
    const hasOverduePayments = schedule.payments.some(
      p => p.status === 'overdue' || (p.status === 'pending' && p.dueDate < now)
    );
    if (hasOverduePayments) return 'text-red-500';
    if (schedule.status === 'completed') return 'text-green-500';
    return 'text-blue-500';
  };

  const getPaymentStatus = (schedule: RentalSchedule) => {
    // If the schedule is not active yet or has no payment day set, return null status
    if (schedule.status !== 'active' || !schedule.paymentDay) {
      return {
        nextPayment: null,
        isOverdue: false,
        overdueAmount: 0,
        overdueCount: 0,
        nextDueDate: null,
        needsSetup: true
      };
    }

    const now = new Date();
    const pendingPayments = schedule.payments
      .filter(p => p.status === 'pending')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const nextPayment = pendingPayments.find(p => p.dueDate >= now);
    const overduePayments = pendingPayments.filter(p => p.dueDate < now);

    return {
      nextPayment,
      isOverdue: overduePayments.length > 0,
      overdueAmount: overduePayments.reduce((sum, p) => sum + p.amount, 0),
      overdueCount: overduePayments.length,
      nextDueDate: nextPayment?.dueDate || new Date(now.getFullYear(), now.getMonth() + 1, schedule.paymentDay),
      needsSetup: false
    };
  };

  const getDaysUntilLeaseEnd = (endDate: Date) => {
    const now = new Date();
    const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  console.log('Filtering schedules - Input:', {
    schedules,
    draftSchedules
  });
  // Get all properties that have tenants assigned or are marked as rented
  const rentedProperties = properties.filter(property => {
    const hasTenants = tenants.some(tenant => 
      tenant.rentedProperties?.includes(property.id)
    );
    const isRented = property.status === 'rented';
    
    console.log('Property tenant check:', {
      propertyId: property.id,
      propertyTitle: property.title,
      hasTenants,
      propertyStatus: property.status,
      isRented,
      tenantsWithProperty: tenants
        .filter(t => t.rentedProperties?.includes(property.id))
        .map(t => ({ id: t.id, name: t.firstName + ' ' + t.lastName }))
    });
    return hasTenants || isRented;
  });

  console.log('Creating draft schedules for properties:', {
    rentedProperties: rentedProperties.map(p => ({
      id: p.id,
      title: p.title,
      status: p.status,
      existingSchedule: [...schedules, ...draftSchedules].find(s => s.propertyId === p.id)?.id
    }))
  });

  console.log('Before creating property schedules:', {
    existingSchedules: schedules.map(s => ({
      id: s.id,
      propertyId: s.propertyId,
      tenantId: s.tenantId,
      status: s.status
    })),
    draftSchedules: draftSchedules.map(s => ({
      id: s.id,
      propertyId: s.propertyId,
      tenantId: s.tenantId,
      status: s.status
    }))
  });

  // Create draft schedules for properties that don't have schedules yet
  const propertySchedules = rentedProperties.map(property => {
    // Find existing schedule
    const existingSchedule = [...schedules, ...draftSchedules].find(s => 
      s.propertyId === property.id
    );

    console.log('Processing property for draft schedule:', {
      propertyId: property.id,
      propertyTitle: property.title,
      hasExistingSchedule: !!existingSchedule,
      existingScheduleId: existingSchedule?.id
    });

    if (existingSchedule) {
      console.log('Found existing schedule for property:', {
        propertyId: property.id,
        propertyTitle: property.title,
        scheduleId: existingSchedule.id,
        scheduleStatus: existingSchedule.status
      });
      return existingSchedule;
    }

    // Find tenant for this property
    const tenant = tenants.find(t => 
      t.rentedProperties?.includes(property.id)
    );

    if (!tenant) {
      console.warn('No tenant found for rented property:', {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyStatus: property.status,
        rentedTo: property.rentedTo
      });
      return null;
    }

    console.log('Creating draft schedule for property:', {
      propertyId: property.id,
      propertyTitle: property.title,
      tenantId: tenant.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`
    });

    // Create a draft schedule with a unique ID
    const timestamp = Date.now();
    return {
      id: `draft_${property.id}_${tenant.id}_${timestamp}`,
      propertyId: property.id,
      tenantId: tenant.id,
      leaseStartDate: new Date(),
      leaseEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      monthlyRent: property.price || 0,
      depositAmount: property.leaseTerms?.deposit || 0,
      paymentDay: 1,
      status: 'draft' as const,
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }).filter(Boolean) as RentalSchedule[];

  // Combine all schedules after propertySchedules are created, removing duplicates
  const allSchedules = [...schedules];
  
  console.log('Combining schedules:', {
    existingSchedules: schedules.map(s => ({
      id: s.id,
      propertyId: s.propertyId,
      tenantId: s.tenantId,
      status: s.status
    })),
    propertySchedules: propertySchedules.map(s => ({
      id: s.id,
      propertyId: s.propertyId,
      tenantId: s.tenantId,
      status: s.status
    }))
  });

  // Only add property schedules for properties that don't have any schedule
  propertySchedules.forEach(propSchedule => {
    const hasExistingSchedule = allSchedules.some(s => s.propertyId === propSchedule.propertyId);
    if (!hasExistingSchedule) {
      console.log('Adding draft schedule for property:', {
        propertyId: propSchedule.propertyId,
        tenantId: propSchedule.tenantId,
        status: propSchedule.status
      });
      allSchedules.push(propSchedule);
    } else {
      console.log('Skipping draft schedule - property already has schedule:', {
        propertyId: propSchedule.propertyId,
        tenantId: propSchedule.tenantId,
        status: propSchedule.status
      });
    }
  });
  
  // Log final state
  console.log('Final state:', {
    rentedPropertiesCount: rentedProperties.length,
    schedulesCount: schedules.length,
    propertySchedulesCount: propertySchedules.length,
    allSchedulesCount: allSchedules.length,
    rentedProperties: rentedProperties.map(p => ({
      id: p.id,
      title: p.title,
      status: p.status,
      hasSchedule: allSchedules.some(s => s.propertyId === p.id)
    }))
  });
  console.log('All schedules:', allSchedules);
  
  // Filter schedules based on search and status
  const filteredSchedules = allSchedules.filter(schedule => {
    const property = properties.find(p => p.id === schedule.propertyId);
    const tenant = tenants.find(t => t.id === schedule.tenantId);
    
    console.log('Checking schedule:', {
      scheduleId: schedule.id,
      propertyId: schedule.propertyId,
      propertyTitle: property?.title,
      tenantId: schedule.tenantId,
      tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown',
      status: schedule.status
    });

    // First check if property and tenant exist
    if (!property || !tenant) {
      console.warn('Missing property or tenant for schedule:', {
        scheduleId: schedule.id,
        propertyId: schedule.propertyId,
        tenantId: schedule.tenantId,
        hasProperty: !!property,
        hasTenant: !!tenant
      });
      return false;
    }

    // Then apply search filter if present
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        property.title.toLowerCase().includes(searchLower) ||
        property.location.address.toLowerCase().includes(searchLower) ||
        tenant.firstName.toLowerCase().includes(searchLower) ||
        tenant.lastName.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  console.log('Filtered schedules:', {
    total: allSchedules.length,
    filtered: filteredSchedules.length,
    schedules: filteredSchedules.map(s => ({
      id: s.id,
      propertyId: s.propertyId,
      propertyTitle: properties.find(p => p.id === s.propertyId)?.title,
      tenantId: s.tenantId,
      tenantName: tenants.find(t => t.id === s.tenantId)?.firstName
    }))
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Management</h1>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rentals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            {(['all', 'active', 'overdue', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg ${filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  } transition-colors`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {rentalLoading || tenantLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading rental schedules...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rental schedules</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new rental schedule
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredSchedules.map(schedule => {
              const paymentStatus = getPaymentStatus(schedule);
              const daysUntilLeaseEnd = getDaysUntilLeaseEnd(schedule.leaseEndDate);
              const statusColor = getStatusColor(schedule);

              return (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {properties.find(p => p.id === schedule.propertyId)?.title || 'Property Not Found'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {properties.find(p => p.id === schedule.propertyId)?.location.address}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tenant: {tenants.find(t => t.id === schedule.tenantId)?.firstName || schedule.tenantId}
                      </p>
                    </div>
                    <div className={`flex items-center ${statusColor}`}>
                      {schedule.status === 'active' && paymentStatus.nextPayment && (
                        <AlertCircle className="h-5 w-5 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${schedule.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full' : ''}`}>
                        {schedule.status === 'draft' ? 'Draft - Needs Setup' : schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${schedule.monthlyRent}/month
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due on day {schedule.paymentDay}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {daysUntilLeaseEnd} days remaining
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Ends {schedule.leaseEndDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {(() => {
                        const status = getPaymentStatus(schedule);
                        
                        if (status.isOverdue) {
                          return (
                            <div className="flex items-center space-x-2">
                              <XCircle className="h-5 w-5 text-red-500" />
                              <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                  ${status.overdueAmount} overdue
                                </p>
                                <p className="text-xs text-red-500 dark:text-red-400">
                                  {status.overdueCount} payment{status.overdueCount > 1 ? 's' : ''} past due
                                </p>
                              </div>
                            </div>
                          );
                        }
                        
                        if (status.nextPayment) {
                          return (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${status.nextPayment.amount} due soon
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Due {status.nextDueDate.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        
                        if (status.needsSetup) {
                          return (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Needs setup
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Configure payment schedule
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                All payments up to date
                              </p>
                              {status.nextDueDate && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Next due: {status.nextDueDate.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()} 
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setStatementSchedule(schedule)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <FileText className="-ml-0.5 mr-1.5 h-4 w-4" />
                      View Statement
                    </button>
                    {schedule.status === 'active' ? (
                      <button
                        onClick={() => setSelectedPaymentSchedule(schedule)}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Record Payment
                      </button>
                    ) : schedule.status === 'draft' ? (
                      <button
                        onClick={() => {
                          const property = properties.find(p => p.id === schedule.propertyId);
                          const tenant = tenants.find(t => t.id === schedule.tenantId);
                          if (property && tenant) {
                            setSelectedSchedule({ schedule, property, tenant });
                          }
                        }}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Setup Rental Schedule
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rental Schedule Setup Modal */}
      {selectedSchedule && (
        <RentalScheduleSetupModal
          isOpen={true}
          onClose={() => setSelectedSchedule(null)}
          onSave={async (data) => {
            if (selectedSchedule.schedule.status === 'draft') {
              // For draft schedules, create a new schedule
              const scheduleData = {
                propertyId: selectedSchedule.schedule.propertyId,
                tenantId: selectedSchedule.schedule.tenantId,
                ...data
              };
              await createSchedule(scheduleData);
            } else {
              // For existing schedules, update them
              await updateSchedule(selectedSchedule.schedule.id, data);
            }
            setSelectedSchedule(null);
          }}
          schedule={selectedSchedule.schedule}
          property={selectedSchedule.property}
          tenant={selectedSchedule.tenant}
        />
      )}

      {/* Payment Modal */}
      {selectedPaymentSchedule && (
        <RentalPaymentModal
          isOpen={true}
          onClose={() => setSelectedPaymentSchedule(null)}
          schedule={selectedPaymentSchedule}
          onPaymentRecorded={() => {
            // Refresh the schedules after recording a payment
            initialize();
            setSelectedPaymentSchedule(null);
          }}
        />
      )}

      {/* Statement Modal */}
      {statementSchedule && (
        <RentalStatementModal
          isOpen={true}
          onClose={() => setStatementSchedule(null)}
          schedule={statementSchedule}
          property={properties.find(p => p.id === statementSchedule.propertyId)!}
          tenant={tenants.find(t => t.id === statementSchedule.tenantId)!}
        />
      )}
    </div>
  );
}
