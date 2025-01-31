import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const initializeRateLimits = async (userId: string) => {
    try {
        const rateLimitRef = doc(db, 'ratelimits', userId);
        await setDoc(rateLimitRef, {
            attempts: {},
            createdAt: new Date().toISOString()
        }, { merge: true });
        console.log('Rate limits initialized for user:', userId);
    } catch (error) {
        console.error('Error initializing rate limits:', error);
        throw error;
    }
};
