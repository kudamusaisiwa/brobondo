import { create } from 'zustand';
import { collection, doc, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinary';

interface BuyerDocument {
  id: string;
  buyerId: string;
  type: string;
  description: string;
  url: string;
  publicId: string;
  expiryDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadDocumentParams {
  file: File;
  type: string;
  description: string;
  expiryDate?: string;
}

interface BuyerDocumentStore {
  documents: BuyerDocument[];
  loading: boolean;
  error: Error | null;
  initialize: (buyerId: string) => Promise<() => void>;
  uploadDocument: (buyerId: string, params: UploadDocumentParams) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
}

export const useBuyerDocumentStore = create<BuyerDocumentStore>((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  initialize: async (buyerId: string) => {
    set({ loading: true, error: null });
    try {
      const q = collection(db, 'buyers', buyerId, 'documents');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as BuyerDocument[];
        set({ documents, loading: false });
      }, (error) => {
        console.error('Error in document snapshot:', error);
        set({ error: error as Error, loading: false });
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing documents:', error);
      set({ error: error as Error, loading: false });
      return () => {};
    }
  },

  uploadDocument: async (buyerId: string, { file, type, description, expiryDate }: UploadDocumentParams) => {
    try {
      // Upload file to Cloudinary
      const url = await uploadToCloudinary(file, `buyers/${buyerId}/documents`);
      const publicId = url.split('/').slice(-1)[0].split('.')[0];

      // Create document data without undefined values
      const documentData = {
        buyerId,
        type,
        description,
        url,
        publicId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Only add expiryDate if it exists
      if (expiryDate) {
        Object.assign(documentData, { expiryDate });
      }

      // Add document reference to Firestore
      const docRef = collection(db, 'buyers', buyerId, 'documents');
      await addDoc(docRef, documentData);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  deleteDocument: async (documentId: string) => {
    try {
      const document = get().documents.find(d => d.id === documentId);
      if (!document) throw new Error('Document not found');

      // Delete document reference from Firestore first
      const buyerId = document.buyerId;
      const docRef = doc(db, 'buyers', buyerId, 'documents', documentId);
      await deleteDoc(docRef);

      // Try to delete from Cloudinary, but don't block if it fails
      try {
        await deleteFromCloudinary(document.publicId);
      } catch (cloudinaryError) {
        console.warn('Failed to delete file from Cloudinary:', cloudinaryError);
        // Continue with the deletion process even if Cloudinary fails
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
}));

export type { BuyerDocument };
