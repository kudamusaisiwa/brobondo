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
import { useBuyerDocumentStore } from '../../store/buyerDocumentStore';
import { useAuthStore } from '../../store/authStore';
import Toast from '../ui/Toast';

interface BuyerDocumentsCardProps {
  buyerId: string;
}

const documentTypes = [
  { value: 'id', label: 'ID Document', icon: UserSquare2 },
  { value: 'passport', label: 'Passport', icon: UserSquare2 },
  { value: 'proof_of_income', label: 'Proof of Income', icon: CreditCard },
  { value: 'bank_statement', label: 'Bank Statement', icon: CreditCard },
  { value: 'other', label: 'Other', icon: FileIcon }
] as const;

export default function BuyerDocumentsCard({ buyerId }: BuyerDocumentsCardProps) {
  const { documents, loading, error: docError, initialize, uploadDocument, deleteDocument } = useBuyerDocumentStore();
  const { isAuthenticated, user } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof documentTypes[number]['value']>('other');
  const [description, setDescription] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (buyerId && isAuthenticated) {
      console.log('Initializing documents for buyer:', buyerId);
      const init = async () => {
        try {
          unsubscribe = await initialize(buyerId);
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
  }, [buyerId, initialize, isAuthenticated]);

  useEffect(() => {
    if (docError) {
      const errorMessage = docError instanceof Error ? docError.message : String(docError);
      setToastMessage(errorMessage);
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
      await uploadDocument(buyerId, {
        file,
        type: selectedType,
        description
      });

      setToastMessage('Document uploaded successfully');
      setToastType('success');
      setDescription('');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setToastMessage(error.message || 'Failed to upload document');
      setToastType('error');
    } finally {
      setIsUploading(false);
      setShowToast(true);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setToastMessage('Document deleted successfully');
      setToastType('success');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      setToastMessage(error.message || 'Failed to delete document');
      setToastType('error');
    }
    setShowToast(true);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Documents
      </h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
            className="block w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (required)"
            required
            className="block w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end">
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="image/jpeg,image/png,application/pdf"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isUploading
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white cursor-pointer'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents</h3>
            <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((document) => {
            const docType = documentTypes.find(type => type.value === document.type);
            const TypeIcon = docType?.icon || FileText;
            const isPDF = document.url.toLowerCase().endsWith('.pdf');
            const isImage = /\.(jpe?g|png|gif)$/i.test(document.url);

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
                      Uploaded: {document.createdAt ? document.createdAt.toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {isImage && (
                    <button
                      onClick={() => window.open(document.url, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Preview Image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <a
                    href={document.url}
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
