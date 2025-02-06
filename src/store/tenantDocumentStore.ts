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
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';

export interface TenantDocument {
  id: string;
  tenantId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  description: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  publicId: string;
  type: 'lease' | 'id' | 'passport' | 'proof_of_income' | 'other';
  status: 'valid' | 'expired' | 'pending';
  expiryDate?: Date;
}

interface TenantDocumentStore {
  documents: TenantDocument[];
  loading: boolean;
  error: string | null;
  initialize: (tenantId: string) => Promise<(() => void) | undefined>;
  uploadDocument: (data: {
    tenantId: string;
    file: File;
    description: string;
    type: TenantDocument['type'];
    expiryDate?: Date;
  }) => Promise<string>;
  updateDocument: (id: string, updates: Partial<TenantDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useTenantDocumentStore = create<TenantDocumentStore>(
  createProtectedStore((set, get) => ({
    documents: [],
    loading: false,
    error: null,

    initialize: async (tenantId: string) => {
      if (!tenantId) {
        console.error('TenantId is required for initialization');
        set({ error: 'TenantId is required', loading: false });
        return undefined;
      }

      set({ loading: true });
      
      try {
        const q = query(
          collection(db, 'tenant_documents'),
          where('tenantId', '==', tenantId),
          orderBy('uploadedAt', 'desc')
        );

        console.log('Initializing tenant document store for tenant:', tenantId);
        
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const documents = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
              expiryDate: doc.data().expiryDate?.toDate()
            })) as TenantDocument[];

            console.log('Fetched tenant documents:', documents);
            set({ documents, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching tenant documents:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing tenant document store:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    uploadDocument: async ({ tenantId, file, description, type, expiryDate }) => {
      set({ loading: true });
      
      try {
        const { user, isAuthenticated } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!isAuthenticated || !user) {
          console.error('Authentication check failed:', { isAuthenticated, user });
          throw new Error('User not authenticated');
        }

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        // Upload to Cloudinary using unsigned upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'tenant_documents');
        
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
        const docRef = await addDoc(collection(db, 'tenant_documents'), {
          tenantId,
          fileName: file.name,
          fileUrl: responseData.secure_url,
          fileType: file.type,
          description,
          type,
          status: 'valid',
          expiryDate: expiryDate ? Timestamp.fromDate(expiryDate) : null,
          uploadedBy: user.uid,
          uploadedAt: Timestamp.now(),
          size: file.size,
          publicId: responseData.public_id
        });

        // Log activity
        await logActivity({
          type: 'tenant_document_uploaded',
          message: `Document uploaded for tenant: ${file.name}`,
          userId: user.uid,
          userName: user.displayName || user.email || 'Unknown User',
          entityId: tenantId,
          entityType: 'tenant',
          metadata: {
            documentId: docRef.id,
            fileName: file.name,
            fileType: file.type,
            documentType: type
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

    updateDocument: async (id, updates) => {
      try {
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!user) {
          throw new Error('User not authenticated');
        }

        const docRef = doc(db, 'tenant_documents', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.now(),
          updatedBy: user.id
        });

        // Log activity
        await logActivity({
          type: 'tenant_document_updated',
          message: `Document updated: ${id}`,
          userId: user.id,
          userName: user.name,
          entityId: id,
          entityType: 'document',
          metadata: {
            documentId: id,
            updates: Object.keys(updates)
          }
        });
      } catch (error: any) {
        console.error('Update error:', error);
        throw error;
      }
    },

    deleteDocument: async (id) => {
      try {
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Delete from Firestore
        await deleteDoc(doc(db, 'tenant_documents', id));

        // Log activity
        await logActivity({
          type: 'tenant_document_deleted',
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
        console.error('Delete error:', error);
        set({ error: error.message, loading: false });
        throw error;
      }
    }
  }))
);
