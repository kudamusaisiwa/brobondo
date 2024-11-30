import React, { useState, useEffect } from 'react';
import { Upload, File, Download, Trash2 } from 'lucide-react';
import { useCustomerDocumentStore } from '../../store/customerDocumentStore';
import { useAuthStore } from '../../store/authStore';
import Toast from '../ui/Toast';

interface CustomerDocumentsProps {
  customerId: string;
}

export default function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { uploadDocument, getDocumentsByCustomer, loading, initialize, deleteDocument } = useCustomerDocumentStore();
  const { user } = useAuthStore();
  const documents = getDocumentsByCustomer(customerId);

  useEffect(() => {
    // Initialize document store
    const unsubscribe = initialize();
    return () => {
      unsubscribe?.then(unsub => unsub?.());
    };
  }, [initialize]);

  useEffect(() => {
    console.log('Current documents:', documents);
  }, [documents]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setToastMessage('Only JPEG, PNG and PDF files are allowed');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setToastMessage('File size must be less than 5MB');
        setToastType('error');
        setShowToast(true);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description) {
      setToastMessage('Please select a file and add a description');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      await uploadDocument({
        customerId,
        file: selectedFile,
        description
      });

      setToastMessage('Document uploaded successfully');
      setToastType('success');
      setSelectedFile(null);
      setDescription('');
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to upload document');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setToastMessage('Document deleted successfully');
      setToastType('success');
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to delete document');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Documents
        </h3>

        {/* Upload Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Document
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="sr-only"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer relative flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span>{selectedFile ? selectedFile.name : 'Choose file...'}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="modern-input mt-1"
              placeholder="Enter document description"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile || !description}
            className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl" role="img" aria-label="file type">
                  {getFileIcon(doc.fileType)}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {doc.description} • {formatFileSize(doc.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No documents uploaded yet
            </p>
          )}
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