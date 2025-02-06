import { create } from 'zustand';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';

export interface OwnerDocument {
  id: string;
  ownerId: string;
  type: 'id' | 'passport' | 'proof_of_residence' | 'bank_statement' | 'other';
  description: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

interface OwnerDocumentStore {
  documents: OwnerDocument[];
  loading: boolean;
  initialize: (ownerId: string) => Promise<() => void>;
  uploadDocument: (
    ownerId: string,
    file: File,
    type: OwnerDocument['type'],
    description: string
  ) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
}

export const useOwnerDocumentStore = create(
  createProtectedStore<OwnerDocumentStore>((set) => ({
    documents: [],
    loading: false,

    initialize: async (ownerId: string) => {
      if (!ownerId) {
        console.error('OwnerId is required for initialization');
        set({ error: 'OwnerId is required', loading: false });
        return undefined;
      }

      set({ loading: true });
      
      try {
        const q = query(
          collection(db, 'owner_documents'),
          where('ownerId', '==', ownerId),
          orderBy('uploadedAt', 'desc')
        );

        console.log('Initializing owner document store for owner:', ownerId);
        
        const unsubscribe = onSnapshot(
          q, 
          (snapshot) => {
            const documents = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
              uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
            })) as OwnerDocument[];

            console.log('Fetched owner documents:', documents);
            set({ documents, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching owner documents:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing owner document store:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    uploadDocument: async (ownerId, file, type, description) => {
      try {
        set({ loading: true });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload to Cloudinary');
        }

        const data = await response.json();
        console.log('Cloudinary upload response:', data);

        const docRef = await addDoc(collection(db, 'owner_documents'), {
          ownerId,
          type,
          description,
          url: data.secure_url,
          publicId: data.public_id,
          uploadedAt: Timestamp.now()
        });

        console.log('Document added with ID:', docRef.id);
        set({ loading: false });
      } catch (error: any) {
        console.error('Error uploading document:', error);
        set({ loading: false });
        throw error;
      }
    },

    deleteDocument: async (documentId: string) => {
      try {
        set({ loading: true });
        await deleteDoc(doc(db, 'owner_documents', documentId));
        set({ loading: false });
      } catch (error: any) {
        console.error('Error deleting document:', error);
        set({ loading: false });
        throw error;
      }
    }
  }))
);
