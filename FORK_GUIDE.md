# Application Fork Guide

This guide explains how to fork and customize this application for another company. The application is built using React, TypeScript, and Firebase, with several external integrations.

## Tech Stack

### Core Technologies
- **Frontend**: React with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Database**: Firebase (Firestore & Realtime Database)
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage & Cloudinary
- **Messaging**: ManyContact (WhatsApp Business Integration)
- **Deployment**: Netlify

## Database Schema

### Firestore Collections

1. **users**
   ```typescript
   {
     id: string;
     name: string;
     email: string;
     role: 'admin' | 'user' | 'customer';
     createdAt: Timestamp;
     lastLogin: Timestamp;
     permissions: string[];
   }
   ```

2. **customers**
   ```typescript
   {
     id: string;
     firstName: string;
     lastName: string;
     email: string;
     phone: string;
     companyName?: string;
     address?: string;
     notes?: string[];
     createdAt: Timestamp;
     documents: {
       type: string;
       url: string;
       uploadedAt: Timestamp;
     }[];
   }
   ```

3. **orders**
   ```typescript
   {
     id: string;
     orderNumber: string;
     customerId: string;
     products: {
       productId: string;
       quantity: number;
       unitPrice: number;
       costPrice: number;
     }[];
     totalAmount: number;
     paidAmount: number;
     status: 'quotation' | 'pending' | 'paid' | 'completed';
     createdAt: Timestamp;
     updatedAt: Timestamp;
     deliveryDate?: Timestamp;
     collectionDate?: Timestamp;
   }
   ```

4. **products**
   ```typescript
   {
     id: string;
     name: string;
     description: string;
     price: number;
     costPrice: number;
     category: string;
     active: boolean;
     createdAt: Timestamp;
   }
   ```

5. **activities**
   ```typescript
   {
     id: string;
     type: string;
     userId: string;
     customerId?: string;
     orderId?: string;
     description: string;
     createdAt: Timestamp;
   }
   ```

### Realtime Database

Used for real-time features:
- Chat messages
- User presence
- Notifications

## External Services

1. **Cloudinary**
   - Used for customer document storage
   - Required ENV variables:
     - VITE_CLOUDINARY_CLOUD_NAME
     - VITE_CLOUDINARY_UPLOAD_PRESET

2. **ManyContact**
   - Used for customer messaging and communication
   - Integration for WhatsApp business messaging
   - Required ENV variables:
     - VITE_MANYCONTACT_API_KEY
     - VITE_MANYCONTACT_API_URL
     - VITE_MANYCONTACT_WHATSAPP_NUMBER

3. **Firebase**
   - Core backend services
   - Real-time database for chat and notifications
   - Firestore for main data storage
   - Storage for file uploads

## Steps to Fork

1. **Clone and Setup**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd <repository-name>
   
   # Install dependencies
   npm install
   ```

2. **Firebase Setup**
   1. Create a new Firebase project
   2. Enable Authentication (Email/Password)
   3. Create Firestore database
   4. Create Realtime Database
   5. Update Security Rules for both databases
   6. Get Firebase config and update .env

3. **Environment Setup**
   Create a `.env` file with these variables:
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_MEASUREMENT_ID=
   VITE_FIREBASE_DATABASE_URL=
   VITE_CLOUDINARY_CLOUD_NAME=
   VITE_CLOUDINARY_UPLOAD_PRESET=
   VITE_MANYCONTACT_API_KEY=
   VITE_MANYCONTACT_API_URL=
   VITE_MANYCONTACT_WHATSAPP_NUMBER=
   ```

4. **Customization**
   1. Update company branding in `/src/config/branding.ts`
   2. Modify color scheme in `tailwind.config.js`
   3. Update logo and favicon in `/public`
   4. Modify email templates in `/src/utils/emailTemplates.ts`

5. **Deploy**
   1. Create a Netlify account
   2. Connect repository to Netlify
   3. Set environment variables in Netlify
   4. Deploy!

## Security Considerations

1. **Firebase Security Rules**
   - Update Firestore rules in `firestore.rules`
   - Update Storage rules in `storage.rules`
   - Update Realtime Database rules in `database.rules.json`

2. **Authentication**
   - Configure authentication providers in Firebase Console
   - Set password requirements in `/src/utils/validation.ts`

3. **Data Privacy**
   - Review and update privacy policy
   - Implement data retention policies
   - Set up backup procedures

## Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm update
   
   # Check for security vulnerabilities
   npm audit
   ```

2. **Monitoring**
   - Set up Firebase Analytics
   - Configure error tracking (e.g., Sentry)
   - Set up performance monitoring

## Support and Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev/guide/)

## License

Review and update the license terms before using this codebase commercially.
