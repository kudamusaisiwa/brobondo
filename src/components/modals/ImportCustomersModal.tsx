import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle, Download, FileText } from 'lucide-react';
import { useCustomerStore } from '../../store/customerStore';
import { validateCsvData } from '../../utils/csvValidation';
import Toast from '../ui/Toast';

interface ImportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportCustomersModal({ isOpen, onClose }: ImportCustomersModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { customers, importCustomers } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [validationResults, setValidationResults] = useState<{
    valid: number;
    toUpdate: number;
    invalid: Array<{ row: number; errors: string[] }>;
    duplicates: Array<{ row: number; reason: string }>;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const csvData = event.target?.result as string;
        const rows = parseCSV(csvData);

        // Validate CSV data
        const results = await validateCsvData(rows, customers);

        // Group results by new and update
        const toUpdate = results.duplicates.filter(d => d.reason === 'Email address exists').length;
        const newRecords = results.valid.length;

        setValidationResults({
          valid: newRecords,
          toUpdate,
          invalid: results.invalid,
          duplicates: results.duplicates.filter(d => d.reason !== 'Email address exists')
        });

        if (newRecords > 0 || toUpdate > 0) {
          const validCustomers = [
            ...results.valid,
            ...results.duplicates
              .filter(d => d.reason === 'Email address exists')
              .map(d => d.data)
          ];

          await importCustomers(validCustomers);

          setToastMessage(
            `Successfully processed ${validCustomers.length} customers:\n` +
            `${newRecords} new records\n` +
            `${toUpdate} updated records\n` +
            `${results.invalid.length} invalid entries skipped`
          );
          setToastType('success');
        } else {
          setToastMessage('No valid customers found to import');
          setToastType('error');
        }
      } catch (error: any) {
        console.error('Import error:', error);
        setToastMessage(error.message || 'Failed to import customers');
        setToastType('error');
      } finally {
        setLoading(false);
        setShowToast(true);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvData: string): Array<Record<string, any>> => {
    const lines = csvData.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Validate required headers
    const requiredHeaders = ['firstname', 'lastname', 'email'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
        const row: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        return row;
      });
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      'FirstName*,LastName*,Email*,Phone,Address,CompanyName,Notes',
      'John,Doe,john.doe@example.com,+263712345678,"123 Main St, Harare",ABC Company Ltd,"VIP Customer"',
      'Jane,Smith,jane.smith@example.com,+263723456789,"456 Park Ave, Bulawayo",XYZ Industries,"Prefers morning deliveries"'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customer_import_sample.csv';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <Upload className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Customers</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/50 p-4 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Import Rules
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Required fields (marked with *): FirstName, LastName, Email</li>
                      <li>Email addresses must be unique</li>
                      <li>Existing records will be updated based on email match</li>
                      <li>Optional fields: Phone, Address, CompanyName, Notes</li>
                      <li>All fields except email and name can contain duplicates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {validationResults && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Validation Results
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-green-600 dark:text-green-400">
                    New records: {validationResults.valid}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Records to update: {validationResults.toUpdate}
                  </p>
                  
                  {validationResults.invalid.length > 0 && (
                    <div>
                      <p className="text-red-600 dark:text-red-400">
                        Invalid entries: {validationResults.invalid.length}
                      </p>
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {validationResults.invalid.map(({ row, errors }, index) => (
                          <div key={index} className="text-gray-600 dark:text-gray-400">
                            Row {row}: {errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResults.duplicates.length > 0 && (
                    <div>
                      <p className="text-yellow-600 dark:text-yellow-400">
                        Duplicates: {validationResults.duplicates.length}
                      </p>
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {validationResults.duplicates.map(({ row, reason }, index) => (
                          <div key={index} className="text-gray-600 dark:text-gray-400">
                            Row {row}: {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={downloadSampleCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? 'Processing...' : 'Select CSV File'}
              </button>
            </div>
          </div>
        </div>
      </div>

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