import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { X, Send } from 'lucide-react';
import { manyContactApi } from '../../services/manycontact';
import { uploadToCloudinary } from '../../services/cloudinary';
import InvoicePDF from '../pdf/InvoicePDF';
import ReactPDF from '@react-pdf/renderer';
import type { Order, Customer } from '../../types';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  customer: Customer;
}

export default function SendInvoiceModal({ isOpen, onClose, order, customer }: SendInvoiceModalProps) {
  const [isSending, setIsSending] = useState(false);

  const generatePdfBlob = async () => {
    try {
      console.log('Generating PDF blob...');
      const pdfBlob = await ReactPDF.pdf(<InvoicePDF order={order} customer={customer} />).toBlob();
      console.log('PDF blob generated:', { size: pdfBlob.size, type: pdfBlob.type });
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      console.log('Starting send process...', { customer, order });

      // 1. Generate PDF
      const pdfBlob = await generatePdfBlob();
      console.log('PDF blob generated successfully');
      
      // 2. Upload to Cloudinary
      console.log('Uploading PDF to Cloudinary...');
      const pdfUrl = await uploadToCloudinary(
        pdfBlob, 
        `invoices/${order.orderNumber || order.id}`
      );
      console.log('PDF uploaded successfully:', pdfUrl);
      
      // 3. Create message with link
      const message = `Hello ${customer.firstName},

Thank you for your business! Your invoice #${order.orderNumber || order.id} is ready:
${pdfUrl}

Best regards,
MG Accountants`;
      
      console.log('Sending WhatsApp message with PDF link...', { 
        number: customer.phone,
        messageLength: message.length
      });

      // 4. Send WhatsApp message with link
      const response = await manyContactApi.sendMessage({
        number: customer.phone,
        text: message
      });

      console.log('Message sent successfully:', response);
      toast.success('Invoice sent successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast.error(error.message || 'Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium">
              Send Invoice via WhatsApp
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Send invoice #{order.orderNumber || order.id} to {customer.firstName} {customer.lastName} via WhatsApp
            {customer.phone ? ` (${customer.phone})` : ''}.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
