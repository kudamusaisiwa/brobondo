import React, { useState } from 'react';
import { Download, FileText, Eye, Send } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../pdf/InvoicePDF';
import PDFViewer from './PDFViewer';
import SendInvoiceModal from '../modals/SendInvoiceModal';
import { useCustomerStore } from '../../store/customerStore';
import type { Order } from '../../types';

interface InvoiceDownloadProps {
  order?: Order;
}

export default function InvoiceDownload({ order }: InvoiceDownloadProps) {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const { getCustomerById } = useCustomerStore();

  if (!order) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        Please authenticate to view and download your documents
      </div>
    );
  }

  const customer = order.customerId ? getCustomerById(order.customerId) : undefined;

  // Function to generate PDF blob
  const generatePdfBlob = async () => {
    const pdfDoc = <InvoicePDF order={order} />;
    const blob = await new Promise<Blob>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(new Blob([reader.result], { type: 'application/pdf' }));
        }
      };
      // Convert PDF to blob
      reader.readAsArrayBuffer(new Blob([pdfDoc as any], { type: 'application/pdf' }));
    });
    setPdfBlob(blob);
    return URL.createObjectURL(blob);
  };

  const handleViewClick = async () => {
    try {
      const pdfUrl = await generatePdfBlob();
      setShowPdfViewer(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Invoice #{order.orderNumber || order.id}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleViewClick}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </button>
          <PDFDownloadLink
            document={<InvoicePDF order={order} />}
            fileName={`invoice-${order.orderNumber || order.id}.pdf`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {({ loading }) => (
              <>
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Download'}
              </>
            )}
          </PDFDownloadLink>
          <button
            onClick={handleSendClick}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </button>
        </div>
      </div>

      {showPdfViewer && pdfBlob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <PDFViewer
              url={URL.createObjectURL(pdfBlob)}
              fileName={`invoice-${order.orderNumber || order.id}.pdf`}
            />
            <button
              onClick={() => {
                setShowPdfViewer(false);
                setPdfBlob(null);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {showSendModal && customer && order && (
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