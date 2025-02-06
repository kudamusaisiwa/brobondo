import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const trackLeadSubmission = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {
    const lead = snap.data();
    
    // Only track rate limits for contact form submissions
    if (lead.type !== 'contact_form') return;

    // Get IP from metadata (you'll need to pass this from the client)
    const ip = lead.ipAddress || 'unknown';
    if (ip === 'unknown') return;

    const rateLimitRef = db.collection('rateLimits').doc(ip);
    
    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(rateLimitRef);
        const now = admin.firestore.Timestamp.now();
        
        if (!doc.exists) {
          // First submission for this IP
          transaction.set(rateLimitRef, {
            submissions: [{
              timestamp: now,
              leadId: snap.id
            }],
            lastSubmission: now
          });
          return;
        }

        const data = doc.data()!;
        const oneHourAgo = new Date(now.toMillis() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.toMillis() - 24 * 60 * 60 * 1000);

        // Clean up old submissions
        const recentSubmissions = data.submissions.filter((s: any) => 
          s.timestamp.toDate() > oneDayAgo
        );

        // Add new submission
        recentSubmissions.push({
          timestamp: now,
          leadId: snap.id
        });

        // Update rate limit document
        transaction.update(rateLimitRef, {
          submissions: recentSubmissions,
          lastSubmission: now
        });

        // Check hourly limit (5 submissions)
        const hourlySubmissions = recentSubmissions.filter((s: any) => 
          s.timestamp.toDate() > oneHourAgo
        );
        
        // If limits exceeded, mark the lead as potential spam
        if (hourlySubmissions.length > 5) {
          const leadRef = db.collection('leads').doc(snap.id);
          transaction.update(leadRef, {
            status: 'potential_spam',
            tags: admin.firestore.FieldValue.arrayUnion('rate_limit_exceeded')
          });
        }
      });
    } catch (error) {
      console.error('Error updating rate limits:', error);
    }
  });
