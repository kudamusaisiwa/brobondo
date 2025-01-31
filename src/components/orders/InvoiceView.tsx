import React, { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Download, Eye, X, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import InvoicePDF from '../pdf/InvoicePDF';
import OrderStatusBadge from './OrderStatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { useCustomerStore } from '../../store/customerStore';
import SendInvoiceModal from '../modals/SendInvoiceModal';
import type { Order, OrderStatus, PaymentMethod } from '../../types';

interface InvoiceViewProps {
  order: Order & {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCompany?: string;
  };
  onStatusChange?: (status: OrderStatus, paymentMethod?: PaymentMethod, paymentAmount?: number, paymentNotes?: string) => void;
  showStatusChange?: boolean;
}

export default function InvoiceView({ 
  order, 
  onStatusChange, 
  showStatusChange = false 
}: InvoiceViewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const { getCustomerById } = useCustomerStore();
  const customer = order ? getCustomerById(order.customerId) : null;

  const PreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
          onClick={() => setShowPreview(false)}
        />
        <div className="relative z-50 w-[95vw] h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={() => setShowPreview(false)}
              className="rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Preview</h2>
            </div>
            <div className="flex-1 p-4 bg-white">
              <PDFViewer 
                className="w-full h-full border-0" 
                showToolbar={false}
              >
                <InvoicePDF 
                  order={order} 
                  customer={customer} 
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSendClick = () => {
    if (!customer) {
      toast.error('Customer information not found');
      return;
    }
    if (!customer.phone) {
      toast.error('Customer phone number not found');
      return;
    }
    setShowSendModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Created on {order.createdAt.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Invoice
            </button>
            <PDFDownloadLink
              document={<InvoicePDF order={order} customer={customer} />}
              fileName={`${order.orderNumber ? `INV${order.orderNumber}` : `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${order.id.slice(-3)}`}.pdf`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              {({ loading }) => (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Generating PDF...' : 'Download Invoice'}
                </>
              )}
            </PDFDownloadLink>
            <button
              onClick={handleSendClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              <Send className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.products.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${product.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${(product.quantity * product.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <dl className="space-y-2">
            <div className="flex justify-end text-sm">
              <dt className="font-medium text-gray-500 dark:text-gray-400 w-32">Subtotal:</dt>
              <dd className="text-gray-900 dark:text-white">${(order.totalAmount / 1.15).toFixed(2)}</dd>
            </div>
            <div className="flex justify-end text-sm">
              <dt className="font-medium text-gray-500 dark:text-gray-400 w-32">VAT (15%):</dt>
              <dd className="text-gray-900 dark:text-white">${order.vatAmount.toFixed(2)}</dd>
            </div>
            <div className="flex justify-end text-sm font-medium">
              <dt className="text-gray-900 dark:text-white w-32">Total:</dt>
              <dd className="text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal />

      {/* Send Invoice Modal */}
      {showSendModal && customer && (
        <SendInvoiceModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          order={order}
          customer={customer}
        />
      )}
    </div>
  );
}