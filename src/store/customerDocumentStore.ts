import { create } from 'zustand';
import { 
  collection, 
  addDoc,
  query, 
  where, 
  onSnapshot,
  Timestamp,
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import type { CustomerDocument } from '../types';

const generateSignature = (publicId: string, timestamp: number) => {
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  const str = `folder=customer_documents&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  return sha1(str).toString();
};

interface CustomerDocumentState {
  documents: CustomerDocument[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | undefined>;
  uploadDocument: (data: {
    customerId: string;
    file: File;
    description: string;
  }) => Promise<string>;
  getDocumentsByCustomer: (customerId: string) => CustomerDocument[];
  deleteDocument: (id: string) => Promise<void>;
}

export const useCustomerDocumentStore = create<CustomerDocumentState>(
  createProtectedStore((set, get) => ({
    documents: [],
    loading: false,
    error: null,

    initialize: async () => {
      set({ loading: true });
      
      try {
        const q = query(
          collection(db, 'customerDocuments'),
          orderBy('uploadedAt', 'desc')
        );

        console.log('Initializing document store...');
        
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const documents = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
            })) as CustomerDocument[];

            console.log('Fetched documents:', documents);
            set({ documents, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching documents:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing document store:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    uploadDocument: async ({ customerId, file, description }) => {
      set({ loading: true });
      
      try {
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!user) {
          throw new Error('User not authenticated');
        }

        const cloudName = 'fresh-ideas';
        const uploadPreset = 'customer_docs';

        // Upload to Cloudinary using unsigned upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'customer_documents');
        
        console.log('Uploading to Cloudinary:', {
          cloudName,
          uploadPreset,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          console.error('Cloudinary error response:', responseData);
          if (responseData.error?.message?.includes('preset')) {
            throw new Error('Upload configuration not found. Please contact support.');
          }
          throw new Error(responseData.error?.message || 'Failed to upload file');
        }

        // Save document reference to Firestore
        const docRef = await addDoc(collection(db, 'customerDocuments'), {
          customerId,
          fileName: file.name,
          fileUrl: responseData.secure_url,
          fileType: file.type,
          description,
          uploadedBy: user.id,
          uploadedAt: Timestamp.now(),
          size: file.size,
          publicId: responseData.public_id
        });

        // Log activity
        await logActivity({
          type: 'document_uploaded',
          message: `Document uploaded: ${file.name}`,
          userId: user.id,
          userName: user.name,
          entityId: customerId,
          entityType: 'customer',
          metadata: {
            documentId: docRef.id,
            fileName: file.name,
            fileType: file.type
          }
        });

        set({ loading: false, error: null });
        return docRef.id;
      } catch (error: any) {
        console.error('Upload error:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    getDocumentsByCustomer: (customerId: string) => {
      const docs = get().documents.filter(doc => doc.customerId === customerId);
      console.log('Filtered documents for customer', customerId, ':', docs);
      return docs;
    },

    deleteDocument: async (id) => {
      try {
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Delete from Firestore
        await deleteDoc(doc(db, 'customerDocuments', id));

        // Log activity
        await logActivity({
          type: 'document_deleted',
          message: `Document deleted: ${id}`,
          userId: user.id,
          userName: user.name,
          entityId: id,
          entityType: 'document',
          metadata: {
            documentId: id
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    }
  }))
);