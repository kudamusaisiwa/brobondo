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
          if (!auth.currentUser) {
            errorMessage = 'You must be logged in to perform this action';
          } else {
            // Check user's role
            try {
              const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
              if (!userDoc.exists()) {
                errorMessage = 'User profile not found';
              } else {
                const userData = userDoc.data();
                if (!userData?.role || !['admin', 'manager'].includes(userData.role)) {
                  errorMessage = 'You must be an admin or manager to perform this action';
                } else {
                  errorMessage = 'Permission denied - please try again';
                }
              }
            } catch (e) {
              console.error('Error checking user role:', e);
              errorMessage = 'Error checking permissions';
            }
          }
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
      withInitState.initialize = async (...args: any[]) => {
        try {
          console.log('Starting store initialization...');
          
          if (!auth.currentUser) {
            console.log('No authenticated user - skipping store initialization');
            return () => {};
          }
          
          // Check user's role
          console.log('Checking user role...');
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (!userDoc.exists()) {
            console.error('User document not found');
            set({ error: 'User profile not found' });
            return () => {};
          }
          
          const userData = userDoc.data();
          console.log('User role:', userData?.role);
          
          if (!userData?.role || !['admin', 'manager'].includes(userData.role)) {
            console.error('Insufficient permissions');
            set({ error: 'You must be an admin or manager to access this page' });
            return () => {};
          }

          console.log('Role check passed, calling store initialization...');
          const cleanup = await originalInit(...args);
          console.log('Store initialization complete');
          set({ isInitialized: true, error: null });
          return cleanup;
        } catch (error) {
          console.error('Error during store initialization:', error);
          withInitState.handleError(error);
          return () => {};
        }
      };
    }

    return withInitState;
  };
};