import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Download,
  CreditCard,
  UserSquare2,
  Home,
  FileText as FileIcon,
  FileImage
} from 'lucide-react';
import { useTenantDocumentStore } from '../../store/tenantDocumentStore';
import { useAuthStore } from '../../store/authStore';
import Toast from '../ui/Toast';

interface TenantDocumentsCardProps {
  tenantId: string;
}

const documentTypes = [
  { value: 'lease', label: 'Lease Agreement', icon: FileText },
  { value: 'id', label: 'ID Document', icon: UserSquare2 },
  { value: 'passport', label: 'Passport', icon: UserSquare2 },
  { value: 'proof_of_income', label: 'Proof of Income', icon: CreditCard },
  { value: 'other', label: 'Other', icon: FileIcon }
] as const;

export default function TenantDocumentsCard({ tenantId }: TenantDocumentsCardProps) {
  const { documents, loading, error: docError, initialize, uploadDocument, deleteDocument } = useTenantDocumentStore();
  const { isAuthenticated, user } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof documentTypes[number]['value']>('other');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (tenantId && isAuthenticated) {
      console.log('Initializing documents for tenant:', tenantId);
      const init = async () => {
        try {
          unsubscribe = await initialize(tenantId);
        } catch (error) {
          console.error('Error initializing documents:', error);
          setToastMessage('Failed to load documents');
          setToastType('error');
          setShowToast(true);
        }
      };
      init();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tenantId, initialize, isAuthenticated]);

  useEffect(() => {
    if (docError) {
      setToastMessage(docError);
      setToastType('error');
      setShowToast(true);
    }
  }, [docError]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Auth state:', { isAuthenticated, user });

    if (!isAuthenticated || !user) {
      setToastMessage('Please log in to upload documents');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!description.trim()) {
      setToastMessage('Please add a description');
      setToastType('error');
      setShowToast(true);
      return;
    }

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

    setIsUploading(true);

    try {
      await uploadDocument({
        tenantId,
        file,
        type: selectedType,
        description,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined
      });

      setToastMessage('Document uploaded successfully');
      setToastType('success');
      setDescription('');
      setExpiryDate('');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setToastMessage(error.message || 'Failed to upload document');
      setToastType('error');
    } finally {
      setIsUploading(false);
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setToastMessage('Document deleted successfully');
      setToastType('success');
    } catch (error: any) {
      console.error('Error deleting document:', error);
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (docError) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="text-red-500 dark:text-red-400">{docError}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
      </div>

      {/* Upload Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
            className="modern-input"
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (required)"
            required
            className="block w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date (optional)
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="modern-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upload Document
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.pdf"
              className="sr-only"
              id="file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className="btn-primary inline-flex items-center cursor-pointer w-full justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((document) => {
            const docType = documentTypes.find(type => type.value === document.type);
            const TypeIcon = docType?.icon || FileText;
            const isPDF = document.fileUrl.toLowerCase().endsWith('.pdf');
            const isImage = /\.(jpe?g|png|gif)$/i.test(document.fileUrl);

            return (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <TypeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {document.description || docType?.label || 'Document'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Uploaded: {document.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {isImage && (
                    <button
                      onClick={() => window.open(document.fileUrl, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Preview Image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <a
                    href={document.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="p-2 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
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
