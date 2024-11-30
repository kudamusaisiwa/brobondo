// ... existing imports ...

export default function OrderDetails() {
  // ... existing code ...

  const handleEdit = async (orderData: Partial<Order>) => {
    try {
      await updateOrder(order!.id, orderData);
      setShowEditModal(false);
      setToastMessage('Order updated successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating order:', error);
      setToastMessage('Failed to update order');
      setShowToast(true);
    }
  };

  // ... rest of existing code ...

  return (
    <div className="space-y-6">
      {/* ... existing header code ... */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered Company Name</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {order.registeredCompanyName || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">RSA Phone Number</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {order.rsaPhoneNumber || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Account Number</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {order.bankAccountNumber || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* ... rest of existing components ... */}
        </div>

        {/* ... existing sidebar components ... */}
      </div>

      {/* ... existing modals and toast ... */}
    </div>
  );
}