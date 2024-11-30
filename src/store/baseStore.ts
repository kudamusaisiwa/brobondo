import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const createProtectedStore = <T extends object>(
  storeFn: (set: any, get: any) => T
) => {
  return (set: any, get: any) => {
    const store = storeFn(set, get);
    
    const withErrorHandling = {
      ...store,
      error: null as string | null,
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      handleError: async (error: any) => {
        console.error('Store error:', error);
        let errorMessage = 'An unexpected error occurred';
        
        if (error?.code === 'permission-denied') {
          // Check for temp admin or initialization status
          try {
            const tempAdminDoc = await getDoc(doc(db, 'users', 'temp-admin'));
            const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
            
            if (!tempAdminDoc.exists() && !settingsDoc.exists() && !auth.currentUser) {
              // System not initialized yet, suppress error
              return null;
            }
          } catch (e) {
            // Ignore additional permission errors
          }
          
          errorMessage = 'You do not have permission to perform this action';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        set({ error: errorMessage });
        return errorMessage;
      }
    };

    // Add initialization state tracking
    const withInitState = {
      ...withErrorHandling,
      isInitialized: false,
      setInitialized: (value: boolean) => set({ isInitialized: value }),
    };

    // Wrap initialize method if it exists
    if ('initialize' in store) {
      const originalInit = store.initialize;
      withInitState.initialize = async () => {
        try {
          // Check for temp admin or initialization
          const tempAdminDoc = await getDoc(doc(db, 'users', 'temp-admin'));
          const settingsDoc = await getDoc(doc(db, 'system', 'settings'));
          
          if (!tempAdminDoc.exists() && !settingsDoc.exists() && !auth.currentUser) {
            console.log('System not initialized - skipping store initialization');
            return () => {};
          }

          const cleanup = await originalInit();
          set({ isInitialized: true, error: null });
          return cleanup;
        } catch (error) {
          // Don't show errors during initialization
          if (error?.code === 'permission-denied') {
            return () => {};
          }
          withInitState.handleError(error);
          return () => {};
        }
      };
    }

    return withInitState;
  };
};